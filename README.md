# Mawaqit Bulk Calendar Importer

A Chrome extension to bulk import prayer times from CSV files into the Mawaqit calendar configuration page.

## Features

- 📅 Import Athan or Iqama times for any or all days in the year in a single CSV for each type.
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
4. Upload your CSV file

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

## Folder structure
```Simple folder tree
mawaqit-bulk-importer/
├── manifest.json
├── content.js
├── styles.css
├── README.md
└── icons/
    ├── icon.svg
```
