# Google Calendar API Setup Guide

This guide helps you set up Google Calendar API access for syncing your iCal events to Google Calendar, which then syncs to Calendly.

## 🎯 **Goal:**
iCloud Calendars → Google Calendar (via API) → Calendly (reliable sync)

## ✨ **Features:**
- **Multi-Calendar Sync**: Creates separate Google Calendars for each iCloud calendar (Personal, Work, Health, Travel, Events)
- **Bidirectional Sync**: Automatically removes Google Calendar events when they're deleted from iCloud
- **Timezone Support**: Proper Asia/Kolkata timezone handling for accurate time display
- **Auto-Sharing**: Automatically shares created calendars with your personal Gmail account
- **Duplicate Prevention**: Smart UID-based tracking prevents duplicate events
- **Browser Compatibility**: Uses browser-like headers to ensure iCloud calendar access

## 📋 **Setup Steps:**

### **1. Enable Google Calendar API**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Library**
4. Search for "Google Calendar API"
5. Click **Enable**

### **2. Create Service Account (Recommended for GitHub Actions)**

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in details:
   - **Name**: `ical-sync-service`
   - **Description**: `Service account for iCal to Google Calendar sync`
4. Click **Create and Continue**
5. **Skip** role assignment (we'll set calendar permissions directly)
6. Click **Done**

### **3. Generate Service Account Key**

1. Click on your newly created service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create New Key**
4. Choose **JSON** format
5. Download the key file
6. **Keep this file secure** - it's like a password!

### **4. Auto-Calendar Creation (No Manual Setup Needed!)**

The sync script automatically:
- Creates separate Google Calendars for each iCloud calendar (e.g., "iCloud Personal", "iCloud Health")
- Shares these calendars with your personal Gmail account
- Sets appropriate colors for each calendar type
- Handles all permissions automatically

### **5. Configure Environment Variables**

Add to your `.env` file:

```bash
# Google Calendar API Integration (Service Account)
GOOGLE_SERVICE_ACCOUNT_EMAIL=ical-sync-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----
GOOGLE_PROJECT_ID=your-project-id
PERSONAL_GMAIL=your-personal-email@gmail.com

# Multiple Calendar URLs (get these from iCloud Calendar sharing settings)
CALENDAR_PERSONAL_URL=webcal://your-personal-calendar-url
CALENDAR_WORK_URL=webcal://your-work-calendar-url
CALENDAR_HEALTH_URL=webcal://your-health-calendar-url
CALENDAR_TRAVEL_URL=webcal://your-travel-calendar-url
CALENDAR_EVENTS_URL=webcal://your-events-calendar-url
```

### **6. Test the Setup**

Run the sync script locally:
```bash
node scripts/sync-ical-google-calendar.js
```

**Expected output:**
```
🚀 Starting iCal to Google Calendar sync...

📋 Setting up Google Calendars...
✅ Created Google Calendar: iCloud Personal (abc123@group.calendar.google.com)
🔗 Shared Personal with your-email@gmail.com

==================================================
📅 Syncing: Personal → iCloud Personal
==================================================
📡 Fetching Personal: https://...
✅ Downloaded Personal: 1263.5KB
📋 Parsed 1011 events from Personal
🎯 Relevant events (future + last 7 days): 12/1011
🆕 New events to sync: 12
📅 Creating: Event Name - 12/5/2025
   ✅ Created: event-id-123
✅ Personal: 12 events synced, 0 deleted, 0 errors
```

### **7. GitHub Secrets**

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

**Required for Service Account:**
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY` (the entire private key including `\n` characters)
- `GOOGLE_PROJECT_ID`
- `PERSONAL_GMAIL`

**Also add your calendar URLs:**
- `CALENDAR_PERSONAL_URL`
- `CALENDAR_WORK_URL`
- `CALENDAR_HEALTH_URL`
- `CALENDAR_TRAVEL_URL`
- `CALENDAR_EVENTS_URL`

## 🔧 **Troubleshooting:**

### **"403 Forbidden" Error**
- Check if Calendar API is enabled in Google Cloud Console
- Verify service account credentials are correct
- Ensure the service account JSON key is properly formatted

### **"400 Bad Request" when fetching iCloud calendars**
- iCloud may be blocking non-browser requests
- The script uses browser headers to work around this
- Verify the iCloud calendar URL is correct and publicly shared

### **"401 Unauthorized"**
- Check if service account credentials are valid
- Verify private key format (should include `\n` characters)
- Ensure Google Project ID is correct

### **Events showing wrong times**
- The script handles Asia/Kolkata timezone automatically
- Verify events appear at correct times in Google Calendar
- Check if iCloud events have proper timezone information

### **Calendars not visible in personal Gmail**
- The script automatically shares calendars with `PERSONAL_GMAIL`
- Check the email address in your `.env` file
- Look for calendar invitations in your email

## 🎉 **Expected Result:**

Once set up correctly:
1. **Separate Google Calendars** created for each iCloud calendar (Personal, Work, Health, etc.)
2. **Automatic sharing** with your personal Gmail account
3. **Bidirectional sync** - events deleted from iCloud are removed from Google Calendar
4. **Proper timezone handling** - events show correct Asia/Kolkata times
5. **Reliable Calendly integration** - Google Calendar syncs perfectly with Calendly
6. **Automated syncing** - GitHub Action runs every 3 hours

## 📝 **Notes:**

- **Multi-Calendar Architecture**: Each iCloud calendar gets its own Google Calendar
- **Smart Duplicate Detection**: Uses iCal UIDs to prevent re-syncing same events
- **Timezone Aware**: Automatically handles Asia/Kolkata timezone conversion
- **Browser Compatibility**: Uses browser-like headers to access iCloud calendars
- **Automatic Cleanup**: Removes Google Calendar events when deleted from iCloud
- **Rate Limiting**: Includes delays between API calls to respect Google's limits
- **Comprehensive Logging**: Detailed sync reports with event counts and errors
- **Only Recent Events**: Syncs future events + last 7 days to avoid clutter

## 🔄 **Sync Process:**

1. **Fetch**: Download iCal data from each calendar URL
2. **Parse**: Extract events with proper timezone handling
3. **Create**: Set up Google Calendars (if needed) and share with personal email
4. **Compare**: Check existing Google Calendar events vs new iCal events
5. **Sync**: Add new events and remove deleted ones
6. **Report**: Detailed summary of sync results
