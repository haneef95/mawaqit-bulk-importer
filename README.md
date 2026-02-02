# Mawaqit Bulk Calendar Importer

A Chrome extension to bulk import prayer times from CSV files into the Mawaqit calendar configuration page.

## Features

- 📅 Import Athan or Iqama times for any or all days in the year in a single CSV for each type.
- 🌍 **DST to Winter Time Conversion** - Automatically converts local DST times to standard time (winter time) as required by Mawaqit
- 🕐 **12hr to 24hr Conversion** - Automatically converts 12-hour format times to 24-hour format
- 📁 Drag & drop CSV upload
- 📊 Real-time import statistics
- 🎨 Modern dark UI that matches Mawaqit
- ✅ This only loads the CSV onto the configure page, allowing you to review and submit.

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the extension folder

## Usage

1. Navigate to your Mawaqit mosque configuration page
2. Click the calendar button in the bottom right
3. Select calendar type (Athan or Iqama)
4. Configure advanced options (optional):
   - **Convert 12hr to 24hr**: Enable automatic conversion of 12-hour times to 24-hour format
   - **Convert DST to Winter Time**: Enable if your CSV contains local times with DST applied (required by Mawaqit)
5. Upload your CSV file

## CSV Format

### Adhan
```csv
Month,Day,Fajr,Shuruq,Dhuhr,Asr,Maghrib,Isha
1,1,06:30,08:00,12:30,15:00,17:30,19:00
1,2,06:29,07:59,12:30,15:01,17:31,19:01
```


### Iqama
```csv
Month,Day,Fajr,Dhuhr,Asr,Maghrib,Isha
1,1,06:30,12:30,15:00,17:30,19:00
1,2,06:29,12:30,15:01,17:31,19:01
```

## Important: Daylight Saving Time (DST) Handling

**Mawaqit requires all times to be in standard time (winter time) throughout the year.** The software will automatically apply DST when needed.

### If your CSV contains local times WITH DST applied:
1. Enable **"Convert DST to Winter Time"** in Advanced Options
2. Select your mosque's timezone from the dropdown
3. The extension will automatically subtract 1 hour from all times during DST periods

### Examples of DST transitions in CSV files:
- **Europe**: Times jump by 1 hour around last Sunday of March (DST starts) and last Sunday of October (DST ends)
- **USA/Canada**: Times jump around second Sunday of March and first Sunday of November
- **Southern Hemisphere** (Australia, New Zealand): DST is active during opposite months (October-April)

The extension automatically detects DST periods for any timezone worldwide using the browser's built-in timezone database.

## Supported Timezones

The extension supports all major IANA timezones worldwide, including:
- **Europe**: London, Paris, Berlin, Rome, Madrid, Amsterdam, Brussels, Zurich, Vienna, Stockholm, Oslo, Copenhagen, Helsinki, Dublin, Lisbon
- **Americas**: New York, Chicago, Denver, Los Angeles, Toronto, Vancouver, Mexico City, Sao Paulo, Buenos Aires, Santiago
- **Asia-Pacific**: Dubai, Riyadh, Jeddah, Kuwait, Qatar, Bahrain, Muscat, Amman, Beirut, Damascus, Jerusalem, Tehran, Karachi, India, Dhaka, Jakarta, Kuala Lumpur, Singapore, Bangkok, Hong Kong, Shanghai, Tokyo, Seoul, Manila, Sydney, Melbourne, Brisbane, Perth, Adelaide, Auckland, Fiji
- **Africa**: Cairo, Casablanca, Tunis, Algiers, Tripoli, Khartoum, Lagos, Johannesburg, Nairobi

## Folder structure
```
mawaqit-bulk-importer/
├── manifest.json
├── content.js
├── timeConverter.js
├── styles.css
├── README.md
└── icons/
    └── icon.svg
```
