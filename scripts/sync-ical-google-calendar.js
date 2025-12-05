require('dotenv').config();
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DateTime } = require('luxon');

class ICalToGoogleCalendarSync {
  constructor() {
    this.syncLogPath = path.join(__dirname, '..', 'google-sync-log.json');
    this.calendars = this.loadCalendarsFromEnv();
    this.googleCalendars = {}; // Will store calendar name -> Google Calendar ID mapping

    // Service account authentication
    this.serviceAccount = {
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: process.env.GOOGLE_PRIVATE_KEY,
      projectId: process.env.GOOGLE_PROJECT_ID
    };

    // Your personal Gmail to share calendars with
    this.personalEmail = process.env.PERSONAL_GMAIL;

    if (!this.serviceAccount.email || !this.serviceAccount.privateKey || !this.serviceAccount.projectId) {
      throw new Error('Missing Google service account environment variables: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_PROJECT_ID');
    }

    if (this.calendars.length === 0) {
      throw new Error('No calendar URLs found. Set CALENDAR_*_URL environment variables.');
    }

    this.accessToken = null; // Will be generated from service account
  }

  loadCalendarsFromEnv() {
    const calendars = [];
    const envVars = Object.keys(process.env);

    const calendarUrls = envVars
      .filter(key => key.startsWith('CALENDAR_') && key.endsWith('_URL'))
      .sort();

    for (const envKey of calendarUrls) {
      const url = process.env[envKey];
      if (url) {
        const namePart = envKey.replace('CALENDAR_', '').replace('_URL', '');
        const name = namePart.split('_').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');

        calendars.push({ name, url, envKey });
        console.log(`📅 Loaded calendar: ${name} (${envKey})`);
      }
    }

    return calendars;
  }

  normalizeUrl(url) {
    if (url.startsWith('webcal://')) {
      return url.replace('webcal://', 'https://');
    }
    return url;
  }

  base64UrlEncode(str) {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  createJWT() {
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.serviceAccount.email,
      scope: 'https://www.googleapis.com/auth/calendar',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, // 1 hour
      iat: now
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    // Clean up the private key
    const privateKey = this.serviceAccount.privateKey.replace(/\\n/g, '\n');

    const signature = crypto
      .createSign('RSA-SHA256')
      .update(signatureInput)
      .sign(privateKey);

    const encodedSignature = this.base64UrlEncode(signature);

    return `${signatureInput}.${encodedSignature}`;
  }

  async getAccessToken() {
    if (this.accessToken) {
      return this.accessToken; // Return cached token
    }

    const jwt = this.createJWT();

    return new Promise((resolve, reject) => {
      const postData = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      }).toString();

      const options = {
        hostname: 'oauth2.googleapis.com',
        port: 443,
        path: '/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const request = https.request(options, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            const tokenData = JSON.parse(data);
            if (tokenData.access_token) {
              this.accessToken = tokenData.access_token;
              console.log('🔑 Google API authentication successful');
              resolve(this.accessToken);
            } else {
              reject(new Error(`Token request failed: ${data}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse token response: ${error.message}`));
          }
        });
      });

      request.on('error', (error) => {
        reject(new Error(`Token request error: ${error.message}`));
      });

      request.write(postData);
      request.end();
    });
  }

  async fetchICalData(url, calendarName) {
    const normalizedUrl = this.normalizeUrl(url);

    return new Promise((resolve, reject) => {
      console.log(`📡 Fetching ${calendarName}: ${normalizedUrl}`);

      const isHttps = normalizedUrl.startsWith('https://');
      const client = isHttps ? https : http;

      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/calendar,*/*',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      };

      const request = client.get(normalizedUrl, options, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          console.log(`🔀 Redirect to: ${response.headers.location}`);
          return this.fetchICalData(response.headers.location, calendarName)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode} for ${calendarName}: ${response.statusMessage}`));
          return;
        }

        let data = '';
        let totalSize = 0;
        const maxSize = 10 * 1024 * 1024;

        response.on('data', (chunk) => {
          totalSize += chunk.length;
          if (totalSize > maxSize) {
            reject(new Error(`Response too large for ${calendarName} (>10MB)`));
            return;
          }
          data += chunk;
        });

        response.on('end', () => {
          console.log(`✅ Downloaded ${calendarName}: ${(totalSize / 1024).toFixed(1)}KB`);
          resolve(data);
        });
      });

      request.on('error', (error) => {
        reject(new Error(`Network error for ${calendarName}: ${error.message}`));
      });

      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error(`Request timeout for ${calendarName} (30s)`));
      });
    });
  }

  parseICalEvents(iCalData, calendarName) {
    const events = [];
    const lines = iCalData.split(/\r?\n/);
    let currentEvent = null;

    for (const line of lines) {
      const cleanLine = line.trim();

      if (cleanLine === 'BEGIN:VEVENT') {
        currentEvent = {
          calendarName: calendarName
        };
      } else if (cleanLine === 'END:VEVENT' && currentEvent) {
        if (currentEvent.summary && (currentEvent.dtstart || currentEvent.dtstart_date)) {
          events.push(currentEvent);
        }
        currentEvent = null;
      } else if (currentEvent && cleanLine.includes(':')) {
        const colonIndex = cleanLine.indexOf(':');
        const key = cleanLine.substring(0, colonIndex);
        const value = cleanLine.substring(colonIndex + 1);

        const [propName, ...params] = key.split(';');

        switch (propName) {
          case 'SUMMARY':
            currentEvent.summary = this.unescapeICalValue(value);
            break;
          case 'DESCRIPTION':
            currentEvent.description = this.unescapeICalValue(value);
            break;
          case 'DTSTART':
            if (params.some(p => p.includes('DATE'))) {
              currentEvent.dtstart_date = this.parseDate(value);
              currentEvent.allDay = true;
            } else {
              const timezone = this.extractTimezone(params);
              currentEvent.dtstart = this.parseDateTime(value, timezone);
              currentEvent.allDay = false;
            }
            break;
          case 'DTEND':
            if (params.some(p => p.includes('DATE'))) {
              currentEvent.dtend_date = this.parseDate(value);
            } else {
              const timezone = this.extractTimezone(params);
              currentEvent.dtend = this.parseDateTime(value, timezone);
            }
            break;
          case 'UID':
            currentEvent.uid = value;
            break;
          case 'LOCATION':
            currentEvent.location = this.unescapeICalValue(value);
            break;
          case 'STATUS':
            currentEvent.status = value;
            break;
          case 'RRULE':
            currentEvent.rrule = value;
            break;
          case 'EXDATE':
            if (!currentEvent.exdates) currentEvent.exdates = [];
            const exTimezone = this.extractTimezone(params);
            currentEvent.exdates.push(this.parseDateTime(value, exTimezone));
            break;
          case 'RECURRENCE-ID':
            const recTimezone = this.extractTimezone(params);
            currentEvent.recurrenceId = this.parseDateTime(value, recTimezone);
            break;
        }
      }
    }

    console.log(`📋 Parsed ${events.length} events from ${calendarName}`);

    // Expand recurring events
    const expandedEvents = this.expandRecurringEvents(events);
    console.log(`🔄 After expanding recurring events: ${expandedEvents.length} events`);

    return expandedEvents;
  }

  unescapeICalValue(value) {
    return value
      .replace(/\\n/g, '\n')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\');
  }

  extractTimezone(params) {
    const tzidParam = params.find(param => param.startsWith('TZID='));
    return tzidParam ? tzidParam.replace('TZID=', '') : null;
  }

  expandRecurringEvents(events) {
    const expandedEvents = [];
    const now = new Date();
    const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // First, collect all override events (events with RECURRENCE-ID)
    const overrides = new Map(); // Key: baseUID + recurrenceId, Value: override event
    const recurringEvents = [];
    const regularEvents = [];

    for (const event of events) {
      if (event.recurrenceId && event.recurrenceId instanceof Date) {
        // This is an override event
        const overrideKey = `${event.uid}_${event.recurrenceId.getTime()}`;
        overrides.set(overrideKey, event);
        console.log(`🔄 Found override for ${event.summary} on ${event.recurrenceId.toLocaleDateString()}`);
      } else if (event.rrule && !event.recurrenceId) {
        // This is a base recurring event (not an override)
        recurringEvents.push(event);
      } else {
        regularEvents.push(event);
      }
    }

    // Add all non-recurring events
    expandedEvents.push(...regularEvents);

    // Process recurring events
    for (const event of recurringEvents) {
      // Parse RRULE
      const rruleParams = this.parseRRule(event.rrule);
      if (!rruleParams) {
        console.warn(`⚠️  Could not parse RRULE: ${event.rrule}`);
        expandedEvents.push(event);
        continue;
      }

      // Build excluded dates from RECURRENCE-ID overrides for this event
      const overrideExcludeDates = [];
      for (const [overrideKey, override] of overrides) {
        if (override.uid === event.uid && override.recurrenceId) {
          overrideExcludeDates.push(override.recurrenceId);
        }
      }

      // Generate recurring instances with override exclusions
      const instances = this.generateRecurringInstances(event, rruleParams, thirtyDaysAgo, threeMonthsFromNow, overrideExcludeDates);

      // Apply overrides to the instances
      const finalInstances = instances.map(instance => {
        if (!instance.dtstart) return instance;
        const overrideKey = `${event.uid}_${instance.dtstart.getTime()}`;
        const override = overrides.get(overrideKey);

        if (override) {
          console.log(`🔄 Applying override to ${instance.summary} on ${instance.dtstart.toLocaleDateString()}`);
          // Use the override event but keep the generated UID for consistency
          return {
            ...override,
            uid: instance.uid, // Keep the generated UID for the instance
            originalUID: event.uid,
            isRecurringInstance: true,
            isOverridden: true
          };
        }

        return instance;
      });

      expandedEvents.push(...finalInstances);
    }

    // Add any standalone override events that didn't match a recurring instance
    for (const [overrideKey, override] of overrides) {
      if (!expandedEvents.some(event =>
        event.originalUID === override.uid &&
        event.dtstart?.getTime() === override.recurrenceId?.getTime()
      )) {
        console.log(`🔄 Adding standalone override: ${override.summary} on ${override.recurrenceId?.toLocaleDateString()}`);
        expandedEvents.push({
          ...override,
          isRecurringInstance: true,
          isOverridden: true,
          originalUID: override.uid
        });
      }
    }

    return expandedEvents;
  }

  parseRRule(rruleStr) {
    const params = {};
    const parts = rruleStr.split(';');

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key && value) {
        params[key.toUpperCase()] = value;
      }
    }

    return params;
  }

  generateRecurringInstances(baseEvent, rruleParams, startRange, endRange, overrideExcludeDates = []) {
    const instances = [];

    if (!baseEvent.dtstart) {
      return [baseEvent]; // Can't generate instances without start date
    }

    const freq = rruleParams.FREQ;
    const byDay = rruleParams.BYDAY;
    const until = rruleParams.UNTIL ? this.parseDateTime(rruleParams.UNTIL, null) : endRange;

    if (freq !== 'WEEKLY') {
      // Only handle weekly recurrence for now
      return [baseEvent];
    }

    if (!byDay) {
      return [baseEvent];
    }

    // Parse BYDAY (e.g., "SU,MO,TU,WE,TH,SA")
    const dayMap = {
      'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6
    };

    const recurDays = byDay.split(',').map(day => dayMap[day]).filter(day => day !== undefined);

    if (recurDays.length === 0) {
      return [baseEvent];
    }

    // Generate instances
    let currentDate = new Date(startRange);
    const baseStart = new Date(baseEvent.dtstart);
    const baseEnd = baseEvent.dtend ? new Date(baseEvent.dtend) : null;
    const duration = baseEnd ? baseEnd.getTime() - baseStart.getTime() : 60 * 60 * 1000; // Default 1 hour

    // Get excluded dates
    const excludedDates = new Set();
    if (baseEvent.exdates) {
      baseEvent.exdates.forEach(exdate => {
        if (exdate) {
          excludedDates.add(exdate.toDateString());
        }
      });
    }

    // Add RECURRENCE-ID override dates to exclusions
    overrideExcludeDates.forEach(overrideDate => {
      if (overrideDate) {
        excludedDates.add(overrideDate.toDateString());
        console.log(`🚫 Excluding recurring instance on ${overrideDate.toLocaleDateString()} (has override)`);
      }
    });

    while (currentDate <= until && currentDate <= endRange) {
      const dayOfWeek = currentDate.getDay();

      if (recurDays.includes(dayOfWeek)) {
        // Create instance for this day
        const instanceStart = new Date(currentDate);
        instanceStart.setHours(baseStart.getHours());
        instanceStart.setMinutes(baseStart.getMinutes());
        instanceStart.setSeconds(baseStart.getSeconds());

        const instanceEnd = new Date(instanceStart.getTime() + duration);

        // Check if this instance is excluded
        const instanceDateStr = instanceStart.toDateString();
        if (!excludedDates.has(instanceDateStr)) {
          const instance = {
            ...baseEvent,
            dtstart: instanceStart,
            dtend: instanceEnd,
            uid: `${baseEvent.uid}-${instanceStart.toISOString().split('T')[0]}`, // Unique UID for each instance
            isRecurringInstance: true,
            originalUID: baseEvent.uid
          };

          instances.push(instance);
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`🔄 Generated ${instances.length} instances for recurring event: ${baseEvent.summary}`);
    return instances;
  }

  parseDate(dateStr) {
    try {
      if (dateStr.match(/^\d{8}$/)) {
        const year = dateStr.slice(0, 4);
        const month = dateStr.slice(4, 6);
        const day = dateStr.slice(6, 8);

        return new Date(`${year}-${month}-${day}`);
      }

      return new Date(dateStr);
    } catch (error) {
      console.warn(`⚠️  Could not parse date: ${dateStr}`);
      return null;
    }
  }

  parseDateTime(dateTimeStr, timezone = null) {
    try {
      // Handle iCal format: YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
      if (dateTimeStr.match(/^\d{8}T\d{6}Z?$/)) {
        // Check if it already has 'Z' suffix (UTC)
        if (dateTimeStr.endsWith('Z')) {
          const dt = DateTime.fromFormat(dateTimeStr, "yyyyMMdd'T'HHmmss'Z'", { zone: 'utc' });
          return dt.isValid ? dt.toJSDate() : null;
        } else {
          // Parse with timezone if specified
          if (timezone) {
            console.log(`🕐 Parsing ${dateTimeStr} as timezone: ${timezone}`);

            // Luxon will handle the timezone conversion automatically (including DST)
            const dt = DateTime.fromFormat(dateTimeStr, "yyyyMMdd'T'HHmmss", { zone: timezone });

            if (!dt.isValid) {
              console.warn(`⚠️  Invalid timezone or format: ${dateTimeStr} in ${timezone}`, dt.invalidReason);
              // Fallback: try parsing without timezone
              const fallbackDt = DateTime.fromFormat(dateTimeStr, "yyyyMMdd'T'HHmmss");
              return fallbackDt.isValid ? fallbackDt.toJSDate() : null;
            }

            // Convert to UTC and return as JavaScript Date
            const utcDt = dt.toUTC();
            console.log(`   ✅ Converted ${dateTimeStr} (${timezone}) → ${utcDt.toISO()}`);
            return utcDt.toJSDate();
          } else {
            // No timezone specified, treat as local system time
            const dt = DateTime.fromFormat(dateTimeStr, "yyyyMMdd'T'HHmmss");
            return dt.isValid ? dt.toJSDate() : null;
          }
        }
      }

      // Fallback for other datetime formats
      const dt = DateTime.fromISO(dateTimeStr);
      return dt.isValid ? dt.toJSDate() : new Date(dateTimeStr);
    } catch (error) {
      console.warn(`⚠️  Could not parse datetime: ${dateTimeStr}, timezone: ${timezone}`, error.message);
      return null;
    }
  }

  async createGoogleCalendar(calendarName) {
    const calendarData = {
      summary: `iCloud ${calendarName}`,
      description: `Synced from iCloud ${calendarName} calendar`,
      timeZone: 'Asia/Kolkata',
      backgroundColor: this.getCalendarColor(calendarName)
    };

    try {
      const calendar = await this.makeGoogleCalendarRequest('/calendar/v3/calendars', 'POST', calendarData);
      console.log(`✅ Created Google Calendar: ${calendar.summary} (${calendar.id})`);
      return calendar;
    } catch (error) {
      console.error(`❌ Failed to create calendar ${calendarName}:`, error.message);
      throw error;
    }
  }

  getCalendarColor(calendarName) {
    const colors = {
      'Personal': '#F09300', // Orange
      'Work': '#0D7377',     // Teal
      'Health': '#E74C3C',   // Red
      'Travel': '#3498DB',   // Blue
      'Events': '#9B59B6'    // Purple
    };
    return colors[calendarName] || '#616161'; // Default gray
  }

  async getExistingGoogleCalendars() {
    try {
      const response = await this.makeGoogleCalendarRequest('/calendar/v3/users/me/calendarList');
      return response.items || [];
    } catch (error) {
      console.error('Error fetching calendar list:', error.message);
      return [];
    }
  }

  async shareCalendarWithPersonalEmail(calendarId, calendarName) {
    try {
      const aclRule = {
        role: 'owner', // Give yourself full access
        scope: {
          type: 'user',
          value: this.personalEmail
        }
      };

      await this.makeGoogleCalendarRequest(
        `/calendar/v3/calendars/${encodeURIComponent(calendarId)}/acl`,
        'POST',
        aclRule
      );

      console.log(`🔗 Shared ${calendarName} with ${this.personalEmail}`);
    } catch (error) {
      console.warn(`⚠️ Could not share ${calendarName}: ${error.message}`);
    }
  }

  async findOrCreateGoogleCalendar(calendarName) {
    const expectedSummary = `iCloud ${calendarName}`;

    // Check if calendar already exists
    const existingCalendars = await this.getExistingGoogleCalendars();
    const existingCalendar = existingCalendars.find(cal => cal.summary === expectedSummary);

    if (existingCalendar) {
      console.log(`📅 Found existing Google Calendar: ${existingCalendar.summary} (${existingCalendar.id})`);
      return existingCalendar;
    }

    // Create new calendar and share it
    console.log(`📅 Creating new Google Calendar: ${expectedSummary}`);
    const newCalendar = await this.createGoogleCalendar(calendarName);

    // Share with your personal Gmail
    await this.shareCalendarWithPersonalEmail(newCalendar.id, calendarName);

    return newCalendar;
  }

  async makeGoogleCalendarRequest(endpoint, method = 'GET', data = null) {
    const token = await this.getAccessToken();

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'www.googleapis.com',
        port: 443,
        path: endpoint,
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      if (data && method !== 'GET') {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const request = https.request(options, (response) => {
        let responseData = '';

        response.on('data', (chunk) => {
          responseData += chunk;
        });

        response.on('end', () => {
          try {
            const parsedData = responseData ? JSON.parse(responseData) : {};
            if (response.statusCode >= 200 && response.statusCode < 300) {
              resolve(parsedData);
            } else {
              reject(new Error(`Google Calendar API error: ${response.statusCode} - ${responseData}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse Google Calendar response: ${error.message}`));
          }
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      if (data && method !== 'GET') {
        request.write(JSON.stringify(data));
      }

      request.end();
    });
  }

  convertToGoogleCalendarEvent(iCalEvent) {
    const startDate = iCalEvent.dtstart || iCalEvent.dtstart_date;
    const endDate = iCalEvent.dtend || iCalEvent.dtend_date;

    if (!startDate) {
      return null;
    }

    const googleEvent = {
      summary: iCalEvent.summary,
      description: iCalEvent.description || `Synced from iCloud ${iCalEvent.calendarName}`,
      location: iCalEvent.location,
      extendedProperties: {
        private: {
          iCalUID: iCalEvent.uid,
          sourceCalendar: iCalEvent.calendarName,
          syncedAt: new Date().toISOString()
        }
      }
    };

    if (iCalEvent.allDay) {
      // All-day event
      googleEvent.start = {
        date: startDate.toISOString().split('T')[0],
        timeZone: 'Asia/Kolkata'
      };
      googleEvent.end = {
        date: endDate ? endDate.toISOString().split('T')[0] : startDate.toISOString().split('T')[0],
        timeZone: 'Asia/Kolkata'
      };
    } else {
      // Timed event
      googleEvent.start = {
        dateTime: startDate.toISOString(),
        timeZone: 'Asia/Kolkata'
      };
      googleEvent.end = {
        dateTime: endDate ? endDate.toISOString() : new Date(startDate.getTime() + 60 * 60 * 1000).toISOString(), // Default 1 hour
        timeZone: 'Asia/Kolkata'
      };
    }

    return googleEvent;
  }

  async createGoogleCalendarEvent(googleEvent, calendarId) {
    try {
      const response = await this.makeGoogleCalendarRequest(
        `/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        'POST',
        googleEvent
      );
      return response;
    } catch (error) {
      console.error(`❌ Failed to create Google Calendar event: ${error.message}`);
      throw error;
    }
  }

  async deleteGoogleCalendarEvent(eventId, calendarId) {
    try {
      await this.makeGoogleCalendarRequest(
        `/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        'DELETE'
      );
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete Google Calendar event: ${error.message}`);
      return false;
    }
  }

  async getExistingGoogleEvents(calendarId) {
    try {
      // Get events from the past 30 days to avoid duplicates
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const response = await this.makeGoogleCalendarRequest(
        `/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${thirtyDaysAgo.toISOString()}&maxResults=2500`
      );

      return response.items || [];
    } catch (error) {
      console.warn(`⚠️ Could not fetch existing Google Calendar events from ${calendarId}: ${error.message}`);
      return [];
    }
  }

  async getAllExistingGoogleEvents() {
    const allEvents = [];

    for (const [calendarName, calendarId] of Object.entries(this.googleCalendars)) {
      const events = await this.getExistingGoogleEvents(calendarId);
      allEvents.push(...events);
    }

    return allEvents;
  }

  loadSyncLog() {
    try {
      if (fs.existsSync(this.syncLogPath)) {
        const data = fs.readFileSync(this.syncLogPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Could not load sync log:', error.message);
    }
    return { syncedEvents: [], lastSync: null };
  }

  saveSyncLog(syncLog) {
    try {
      fs.writeFileSync(this.syncLogPath, JSON.stringify(syncLog, null, 2));
      console.log('📝 Google sync log updated');
    } catch (error) {
      console.error('Could not save sync log:', error.message);
    }
  }

  async syncEvents() {
    try {
      console.log('🚀 Starting iCal to Google Calendar sync...\n');

      const syncResults = {
        calendars: [],
        totalEvents: 0,
        newEvents: 0,
        errors: [],
        googleCalendarsCreated: 0
      };

      // Step 1: Set up Google Calendars for each iCloud calendar
      console.log('📋 Setting up Google Calendars...\n');
      for (const calendar of this.calendars) {
        try {
          const googleCalendar = await this.findOrCreateGoogleCalendar(calendar.name);
          this.googleCalendars[calendar.name] = googleCalendar.id;

          if (googleCalendar.summary.includes('Created')) {
            syncResults.googleCalendarsCreated++;
          }
        } catch (error) {
          console.error(`❌ Error setting up Google Calendar for ${calendar.name}:`, error.message);
          syncResults.errors.push({
            calendar: calendar.name,
            error: `Calendar setup failed: ${error.message}`
          });
        }
      }

      console.log(`\n📊 Google Calendar setup complete:`);
      console.log(`   📅 Calendars ready: ${Object.keys(this.googleCalendars).length}/${this.calendars.length}`);
      if (syncResults.googleCalendarsCreated > 0) {
        console.log(`   ✨ New calendars created: ${syncResults.googleCalendarsCreated}`);
      }

      // Step 2: Sync events for each calendar separately
      for (const calendar of this.calendars) {
        const googleCalendarId = this.googleCalendars[calendar.name];
        if (!googleCalendarId) {
          console.log(`⚠️ Skipping ${calendar.name} - no Google Calendar available`);
          continue;
        }

        try {
          console.log(`\n${'='.repeat(50)}`);
          console.log(`📅 Syncing: ${calendar.name} → iCloud ${calendar.name}`);
          console.log(`${'='.repeat(50)}`);

          // Fetch and parse iCal events
          const iCalData = await this.fetchICalData(calendar.url, calendar.name);
          const events = this.parseICalEvents(iCalData, calendar.name);

          // Filter events to only sync future events and recent past (last 7 days)
          const now = new Date();
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

          const relevantEvents = events.filter(event => {
            const eventDate = event.dtstart || event.dtstart_date;
            return eventDate && eventDate >= sevenDaysAgo;
          });

          console.log(`🎯 Relevant events (future + last 7 days): ${relevantEvents.length}/${events.length}`);

          if (relevantEvents.length === 0) {
            console.log(`📭 No relevant events to sync for ${calendar.name}`);
            syncResults.calendars.push({
              name: calendar.name,
              eventCount: events.length,
              relevantCount: 0,
              syncedCount: 0,
              status: 'success'
            });
            continue;
          }

          // Get existing Google Calendar events for this specific calendar
          console.log(`🔍 Checking existing events in Google Calendar...`);
          const existingGoogleEvents = await this.getExistingGoogleEvents(googleCalendarId);
          const existingSyncedUIDs = new Set(
            existingGoogleEvents
              .filter(event => event.extendedProperties?.private?.iCalUID)
              .map(event => event.extendedProperties.private.iCalUID)
          );

          console.log(`📋 Found ${existingGoogleEvents.length} existing events, ${existingSyncedUIDs.size} synced from iCal`);

          // Filter new events for this calendar
          const newEvents = relevantEvents.filter(event => !existingSyncedUIDs.has(event.uid));
          console.log(`🆕 New events to sync: ${newEvents.length}`);

          // Smart deletion logic for recurring events
          const currentICalUIDs = new Set(relevantEvents.map(event => event.uid).filter(uid => uid));
          const currentBaseUIDs = new Set(relevantEvents.map(event => event.originalUID || event.uid).filter(uid => uid));

          const eventsToDelete = existingGoogleEvents.filter(googleEvent => {
            const iCalUID = googleEvent.extendedProperties?.private?.iCalUID;
            if (!iCalUID) return false;

            // Direct match - keep if UID exists in current events
            if (currentICalUIDs.has(iCalUID)) return false;

            // For recurring event instances (have date suffix), check if base event still exists
            if (iCalUID.includes('-') && iCalUID.match(/\d{4}-\d{2}-\d{2}$/)) {
              const baseUID = iCalUID.substring(0, iCalUID.lastIndexOf('-'));

              // Keep if base recurring event still exists
              if (currentBaseUIDs.has(baseUID)) {
                // But check if this specific instance should still exist
                // If the base event exists but this instance doesn't, it means the RRULE changed
                const instanceExists = relevantEvents.some(event =>
                  (event.originalUID === baseUID || event.uid === baseUID) &&
                  event.uid === iCalUID
                );
                return !instanceExists;
              }

              // Base event doesn't exist anymore - delete this instance
              return true;
            }

            // Regular event - delete if not found in current events
            return true;
          });

          console.log(`🗑️  Events to delete (removed from iCal): ${eventsToDelete.length}`);

          let syncCount = 0;
          let deleteCount = 0;
          let errorCount = 0;

          // Sync new events to this Google Calendar
          for (const iCalEvent of newEvents) {
            try {
              const googleEvent = this.convertToGoogleCalendarEvent(iCalEvent);
              if (!googleEvent) {
                console.warn(`⚠️ Skipped invalid event: ${iCalEvent.summary}`);
                continue;
              }

              const eventDate = iCalEvent.dtstart || iCalEvent.dtstart_date;
              const dateStr = eventDate ? eventDate.toLocaleDateString() : 'No date';

              console.log(`📅 Creating: ${iCalEvent.summary} - ${dateStr}`);

              const createdEvent = await this.createGoogleCalendarEvent(googleEvent, googleCalendarId);
              console.log(`   ✅ Created: ${createdEvent.id}`);

              syncCount++;

              // Rate limiting: small delay between API calls
              await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error) {
              console.error(`   ❌ Error syncing ${iCalEvent.summary}: ${error.message}`);
              errorCount++;

              // Don't fail the entire sync for individual event errors
              if (errorCount > 5) {
                console.error(`   ❌ Too many errors for ${calendar.name}, skipping remaining events`);
                break;
              }
            }
          }

          // Delete events that no longer exist in iCal
          for (const googleEvent of eventsToDelete) {
            try {
              console.log(`🗑️  Deleting: ${googleEvent.summary} (removed from iCal)`);

              const success = await this.deleteGoogleCalendarEvent(googleEvent.id, googleCalendarId);
              if (success) {
                console.log(`   ✅ Deleted: ${googleEvent.id}`);
                deleteCount++;
              } else {
                console.log(`   ❌ Failed to delete: ${googleEvent.id}`);
                errorCount++;
              }

              // Rate limiting: small delay between API calls
              await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error) {
              console.error(`   ❌ Error deleting ${googleEvent.summary}: ${error.message}`);
              errorCount++;
            }
          }

          syncResults.calendars.push({
            name: calendar.name,
            eventCount: events.length,
            relevantCount: relevantEvents.length,
            syncedCount: syncCount,
            deletedCount: deleteCount,
            errorCount: errorCount,
            status: 'success'
          });

          syncResults.totalEvents += relevantEvents.length;
          syncResults.newEvents += syncCount;
          syncResults.deletedEvents = (syncResults.deletedEvents || 0) + deleteCount;

          console.log(`✅ ${calendar.name}: ${syncCount} events synced, ${deleteCount} deleted, ${errorCount} errors`);

        } catch (error) {
          console.error(`❌ Error processing ${calendar.name}:`, error.message);
          syncResults.errors.push({
            calendar: calendar.name,
            error: error.message
          });

          syncResults.calendars.push({
            name: calendar.name,
            eventCount: 0,
            status: 'failed',
            error: error.message
          });
        }
      }

      // Update sync log
      const syncLog = this.loadSyncLog();
      const updatedSyncLog = {
        lastSync: new Date().toISOString(),
        lastSyncCount: syncResults.newEvents,
        totalEventsSynced: (syncLog.totalEventsSynced || 0) + syncResults.newEvents,
        calendars: syncResults.calendars,
        googleCalendars: this.googleCalendars
      };

      this.saveSyncLog(updatedSyncLog);

      console.log('\n' + '='.repeat(60));
      console.log('📊 MULTI-CALENDAR SYNC SUMMARY');
      console.log('='.repeat(60));
      console.log(`📅 Google Calendars: ${Object.keys(this.googleCalendars).length}`);
      console.log(`✅ Calendars synced: ${syncResults.calendars.filter(c => c.status === 'success').length}/${this.calendars.length}`);
      console.log(`📊 Total relevant events: ${syncResults.totalEvents}`);
      console.log(`🆕 New events synced: ${syncResults.newEvents}`);
      if (syncResults.deletedEvents > 0) {
        console.log(`🗑️  Events deleted: ${syncResults.deletedEvents}`);
      }

      // Show calendar breakdown
      console.log('\n📋 Calendar breakdown:');
      syncResults.calendars.forEach(cal => {
        if (cal.status === 'success') {
          const deletedText = cal.deletedCount > 0 ? `, ${cal.deletedCount} deleted` : '';
          console.log(`   📅 ${cal.name}: ${cal.syncedCount || 0}/${cal.relevantCount || 0} synced${deletedText}`);
        } else {
          console.log(`   ❌ ${cal.name}: ${cal.error}`);
        }
      });

      if (syncResults.errors.length > 0) {
        console.log(`\n❌ Errors: ${syncResults.errors.length}`);
        syncResults.errors.forEach(error => {
          console.log(`   • ${error.calendar}: ${error.error}`);
        });
      }

      console.log(`\n🎉 Multi-calendar sync completed!`);
      console.log(`💡 Your events are now in separate Google Calendars that mirror your iCloud setup`);
      console.log(`🔗 Connect these Google Calendars to Calendly for reliable blocking`);

    } catch (error) {
      console.error('\n💥 Sync failed:', error.message);
      process.exit(1);
    }
  }
}

// Export the class for debugging
module.exports = ICalToGoogleCalendarSync;

// Run the sync if this file is executed directly
if (require.main === module) {
  const sync = new ICalToGoogleCalendarSync();
  sync.syncEvents();
}
