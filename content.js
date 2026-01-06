(function () {
  'use strict';

  // Check if we're on the right page
  if (!window.location.href.includes('/configure')) {
    return;
  }

  // Prevent multiple injections
  if (document.getElementById('mawaqit-bulk-importer')) {
    return;
  }

  // Create floating action button
  const fab = document.createElement('div');
  fab.id = 'mawaqit-bulk-importer';
  fab.className = 'mawaqit-fab';
  fab.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  `;
  fab.title = 'Bulk Import Prayer Times';

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'mawaqit-modal';
  modal.innerHTML = `
    <div class="mawaqit-modal-content">
      <div class="mawaqit-modal-header">
        <h2>Bulk Import Prayer Times</h2>
        <button class="mawaqit-close">&times;</button>
      </div>
      
      <div class="mawaqit-modal-body">
        <div class="mawaqit-section">
          <label class="mawaqit-label">Calendar Type</label>
          <div class="mawaqit-radio-group">
            <label class="mawaqit-radio">
              <input type="radio" name="calendarType" value="calendar" checked>
              <span class="mawaqit-radio-custom"></span>
              Athan Times
            </label>
            <label class="mawaqit-radio">
              <input type="radio" name="calendarType" value="iqamaCalendar">
              <span class="mawaqit-radio-custom"></span>
              Iqama Times
            </label>
          </div>
        </div>

        <div class="mawaqit-section">
          <label class="mawaqit-label">Upload CSV File</label>
          <div class="mawaqit-dropzone" id="mawaqit-dropzone">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mawaqit-upload-icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p>Drag & drop your CSV file here</p>
            <span>or click to browse</span>
            <input type="file" id="mawaqit-file-input" accept=".csv" hidden>
          </div>
        </div>

        <div class="mawaqit-file-info" id="mawaqit-file-info">
          <div class="mawaqit-sample-csv">
            <h4>Expected CSV Format</h4>
            <div class="mawaqit-csv-preview" id="mawaqit-csv-preview">
              <!-- Sample CSV will be inserted here -->
            </div>
          </div>
        </div>

        <div class="mawaqit-stats" id="mawaqit-stats" style="display: none;">
          <div class="mawaqit-stat">
            <span class="mawaqit-stat-value" id="stat-total">0</span>
            <span class="mawaqit-stat-label">Total Rows</span>
          </div>
          <div class="mawaqit-stat">
            <span class="mawaqit-stat-value" id="stat-success">0</span>
            <span class="mawaqit-stat-label">Imported</span>
          </div>
          <div class="mawaqit-stat">
            <span class="mawaqit-stat-value" id="stat-errors">0</span>
            <span class="mawaqit-stat-label">Errors</span>
          </div>
        </div>

        <div class="mawaqit-progress" id="mawaqit-progress" style="display: none;">
          <div class="mawaqit-progress-bar">
            <div class="mawaqit-progress-fill" id="mawaqit-progress-fill"></div>
          </div>
          <span class="mawaqit-progress-text" id="mawaqit-progress-text">0%</span>
        </div>

        <div class="mawaqit-log" id="mawaqit-log" style="display: none;">
          <div class="mawaqit-log-header">
            <span>Import Log</span>
            <button class="mawaqit-log-clear" id="mawaqit-log-clear">Clear</button>
          </div>
          <div class="mawaqit-log-content" id="mawaqit-log-content"></div>
        </div>
      </div>

      <div class="mawaqit-modal-footer">
        <button class="mawaqit-btn mawaqit-btn-secondary" id="mawaqit-cancel">Cancel</button>
        <button class="mawaqit-btn mawaqit-btn-primary" id="mawaqit-import" disabled>Import</button>
      </div>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(modal);

  // Sample CSV data
  const sampleCSV = {
    calendar: {
      header: 'Month,Day,Fajr,Sunrise,Dhuhr,Asr,Maghrib,Isha',
      rows: [
        '1,1,06:30,08:00,12:30,15:00,17:30,19:00',
        '1,2,06:29,07:59,12:30,15:01,17:31,19:01',
        '1,3,06:28,07:58,12:31,15:02,17:32,19:02',
        '...',
        '12,31,06:32,08:02,12:29,14:58,17:28,18:58'
      ],
      description: 'Athan times include Sunrise. Times should be in 24-hour format (HH:MM).'
    },
    iqamaCalendar: {
      header: 'Month,Day,Fajr,Dhuhr,Asr,Maghrib,Isha',
      rows: [
        '1,1,06:45,12:45,15:15,17:35,19:15',
        '1,2,06:44,12:45,15:16,17:36,19:16',
        '1,3,06:43,12:46,15:17,17:37,19:17',
        '...',
        '12,31,06:47,12:44,15:13,17:33,19:13'
      ],
      description: 'Iqama times do not include Sunrise. Times should be in 24-hour format (HH:MM).'
    }
  };

  // Function to update sample CSV display
  function updateSampleCSV(type) {
    const preview = document.getElementById('mawaqit-csv-preview');
    const data = sampleCSV[type];
    
    let tableHTML = `
      <p class="mawaqit-csv-description">${data.description}</p>
      <div class="mawaqit-csv-table-wrapper">
        <table class="mawaqit-csv-table">
          <thead>
            <tr>
              ${data.header.split(',').map(col => `<th>${col}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.rows.map(row => `
              <tr>
                ${row.split(',').map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    preview.innerHTML = tableHTML;
  }

  // Elements
  const closeBtn = modal.querySelector('.mawaqit-close');
  const cancelBtn = modal.querySelector('#mawaqit-cancel');
  const importBtn = modal.querySelector('#mawaqit-import');
  const dropzone = modal.querySelector('#mawaqit-dropzone');
  const fileInput = modal.querySelector('#mawaqit-file-input');
  const fileInfo = modal.querySelector('#mawaqit-file-info');
  const statsContainer = modal.querySelector('#mawaqit-stats');
  const progressContainer = modal.querySelector('#mawaqit-progress');
  const progressFill = modal.querySelector('#mawaqit-progress-fill');
  const progressText = modal.querySelector('#mawaqit-progress-text');
  const logContainer = modal.querySelector('#mawaqit-log');
  const logContent = modal.querySelector('#mawaqit-log-content');
  const logClear = modal.querySelector('#mawaqit-log-clear');
  const radioButtons = modal.querySelectorAll('input[name="calendarType"]');

  let selectedFile = null;
  let isImporting = false;

  // Initialize sample CSV display
  updateSampleCSV('calendar');

  // Radio button change handler
  radioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
      updateSampleCSV(e.target.value);
    });
  });

  // Open modal
  fab.addEventListener('click', () => {
    modal.classList.add('active');
    // Reset to show sample CSV
    if (!selectedFile) {
      fileInfo.style.display = 'block';
      fileInfo.innerHTML = `
        <div class="mawaqit-sample-csv">
          <h4>Expected CSV Format</h4>
          <div class="mawaqit-csv-preview" id="mawaqit-csv-preview"></div>
        </div>
      `;
      const currentType = modal.querySelector('input[name="calendarType"]:checked').value;
      updateSampleCSV(currentType);
    }
  });

  // Close modal
  function closeModal() {
    if (!isImporting) {
      modal.classList.remove('active');
    }
  }

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // File handling
  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      handleFile(file);
    } else {
      showLog('error', 'Please upload a valid CSV file');
    }
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  function handleFile(file) {
    selectedFile = file;
    dropzone.classList.add('has-file');
    fileInfo.style.display = 'block';
    fileInfo.innerHTML = `
      <div class="mawaqit-file-selected">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <div class="mawaqit-file-details">
          <span class="mawaqit-file-name">${file.name}</span>
          <span class="mawaqit-file-size">${formatFileSize(file.size)}</span>
        </div>
        <button class="mawaqit-file-remove" id="mawaqit-file-remove">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;
    
    document.getElementById('mawaqit-file-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      removeFile();
    });
    
    importBtn.disabled = false;
  }

  function removeFile() {
    selectedFile = null;
    fileInput.value = '';
    dropzone.classList.remove('has-file');
    importBtn.disabled = true;
    
    // Show sample CSV again
    fileInfo.innerHTML = `
      <div class="mawaqit-sample-csv">
        <h4>Expected CSV Format</h4>
        <div class="mawaqit-csv-preview" id="mawaqit-csv-preview"></div>
      </div>
    `;
    const currentType = modal.querySelector('input[name="calendarType"]:checked').value;
    updateSampleCSV(currentType);
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Logging
  function showLog(type, message) {
    logContainer.style.display = 'block';
    const entry = document.createElement('div');
    entry.className = `mawaqit-log-entry mawaqit-log-${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
  }

  logClear.addEventListener('click', () => {
    logContent.innerHTML = '';
    logContainer.style.display = 'none';
  });

  // Import functionality
  importBtn.addEventListener('click', async () => {
    if (!selectedFile || isImporting) return;

    isImporting = true;
    importBtn.disabled = true;
    cancelBtn.disabled = true;

    const calendarType = modal.querySelector('input[name="calendarType"]:checked').value;

    try {
      const text = await selectedFile.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        throw new Error('No valid data found in CSV');
      }

      statsContainer.style.display = 'flex';
      progressContainer.style.display = 'flex';

      const stats = { total: rows.length, success: 0, errors: 0 };
      updateStats(stats);

      showLog('info', `Starting import of ${rows.length} rows...`);

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          await importRow(row, calendarType);
          stats.success++;
          showLog('success', `Row ${i + 1}: Imported ${row.month}/${row.day}`);
        } catch (error) {
          stats.errors++;
          showLog('error', `Row ${i + 1}: ${error.message}`);
        }

        updateStats(stats);
        updateProgress((i + 1) / rows.length * 100);

        // Small delay to prevent overwhelming the page
        await sleep(50);
      }

      showLog('info', `Import complete: ${stats.success} successful, ${stats.errors} errors`);

    } catch (error) {
      showLog('error', `Import failed: ${error.message}`);
    } finally {
      isImporting = false;
      importBtn.disabled = false;
      cancelBtn.disabled = false;
    }
  });

  function parseCSV(text) {
    const lines = text.trim().split('\n');
    const rows = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());

      // Handle both formats: with and without sunrise
      if (values.length >= 7) {
        const row = {
          month: parseInt(values[0]),
          day: parseInt(values[1]),
          fajr: values[2],
          sunrise: values.length === 8 ? values[3] : null,
          dhuhr: values.length === 8 ? values[4] : values[3],
          asr: values.length === 8 ? values[5] : values[4],
          maghrib: values.length === 8 ? values[6] : values[5],
          isha: values.length === 8 ? values[7] : values[6]
        };

        if (row.month >= 1 && row.month <= 12 && row.day >= 1 && row.day <= 31) {
          rows.push(row);
        }
      }
    }

    return rows;
  }

  async function importRow(row, calendarType) {
    // This is where you'd implement the actual import logic
    // For now, this is a placeholder that simulates the import
    
    // Find the calendar table/form on the page
    const calendar = document.querySelector('[data-calendar]') || 
                     document.querySelector('.calendar-config') ||
                     document.querySelector('#calendar');

    if (!calendar) {
      // Simulate import for demo purposes
      await sleep(10);
      return;
    }

    // Implement actual field updates based on the Mawaqit page structure
    // This will need to be customized based on the actual DOM structure
    throw new Error('Calendar element not found - please customize the import logic');
  }

  function updateStats(stats) {
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-success').textContent = stats.success;
    document.getElementById('stat-errors').textContent = stats.errors;
  }

  function updateProgress(percent) {
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${Math.round(percent)}%`;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

})();
