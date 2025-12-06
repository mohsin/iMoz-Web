require('dotenv').config();
const https = require('https');
const crypto = require('crypto');

class GoogleCalendarCleanup {
  constructor() {
    // Service account authentication
    this.serviceAccount = {
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: process.env.GOOGLE_PRIVATE_KEY,
      projectId: process.env.GOOGLE_PROJECT_ID
    };

    if (!this.serviceAccount.email || !this.serviceAccount.privateKey || !this.serviceAccount.projectId) {
      throw new Error('Missing Google service account environment variables');
    }

    this.accessToken = null;
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
      exp: now + 3600,
      iat: now
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

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
      return this.accessToken;
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

  async getExistingGoogleCalendars() {
    try {
      const response = await this.makeGoogleCalendarRequest('/calendar/v3/users/me/calendarList');
      return response.items || [];
    } catch (error) {
      console.error('Error fetching calendar list:', error.message);
      return [];
    }
  }

  async getAllEventsFromCalendar(calendarId) {
    try {
      // Get all events (no time limit)
      const response = await this.makeGoogleCalendarRequest(
        `/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?maxResults=2500`
      );

      return response.items || [];
    } catch (error) {
      console.warn(`⚠️ Could not fetch events from ${calendarId}: ${error.message}`);
      return [];
    }
  }

  async deleteEvent(calendarId, eventId) {
    try {
      await this.makeGoogleCalendarRequest(
        `/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        'DELETE'
      );
      return true;
    } catch (error) {
      console.warn(`⚠️ Could not delete event ${eventId}: ${error.message}`);
      return false;
    }
  }

  async cleanupCalendars() {
    console.log('🧹 Starting Google Calendar cleanup...\n');

    try {
      // Get all calendars
      const calendars = await this.getExistingGoogleCalendars();

      // Filter for our iCloud sync calendars
      const icloudCalendars = calendars.filter(cal =>
        cal.summary && cal.summary.startsWith('iCloud ')
      );

      if (icloudCalendars.length === 0) {
        console.log('📭 No iCloud sync calendars found to clean up');
        return;
      }

      console.log(`🎯 Found ${icloudCalendars.length} iCloud sync calendars:`);
      icloudCalendars.forEach(cal => {
        console.log(`   📅 ${cal.summary} (${cal.id})`);
      });

      let totalEventsDeleted = 0;

      // Clean up each calendar
      for (const calendar of icloudCalendars) {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🧹 Cleaning: ${calendar.summary}`);
        console.log(`${'='.repeat(50)}`);

        // Get all events from this calendar
        const events = await this.getAllEventsFromCalendar(calendar.id);

        if (events.length === 0) {
          console.log(`📭 No events found in ${calendar.summary}`);
          continue;
        }

        console.log(`🔍 Found ${events.length} events to delete`);

        let deletedCount = 0;
        let errorCount = 0;

        // Delete all events
        for (const event of events) {
          const success = await this.deleteEvent(calendar.id, event.id);
          if (success) {
            deletedCount++;
            console.log(`   ✅ Deleted: ${event.summary || 'Untitled event'}`);
          } else {
            errorCount++;
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`✅ ${calendar.summary}: ${deletedCount} events deleted, ${errorCount} errors`);
        totalEventsDeleted += deletedCount;
      }

      console.log('\n' + '='.repeat(60));
      console.log('🎉 CLEANUP SUMMARY');
      console.log('='.repeat(60));
      console.log(`📅 Calendars cleaned: ${icloudCalendars.length}`);
      console.log(`🗑️  Total events deleted: ${totalEventsDeleted}`);
      console.log('\n✨ All synced events have been removed!');
      console.log('🔄 You can now re-run the sync script to generate events with correct timezones');

    } catch (error) {
      console.error('\n💥 Cleanup failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the cleanup
const cleanup = new GoogleCalendarCleanup();
cleanup.cleanupCalendars();
