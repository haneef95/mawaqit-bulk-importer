(function() {
    'use strict';

    // Prevent duplicate injection
    if (document.getElementById('mawaqit-importer-toggle')) {
        return;
    }

    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'mawaqit-importer-toggle';
    toggleBtn.title = 'Open Bulk Calendar Importer';
    toggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    `;
    document.body.appendChild(toggleBtn);

    // Create panel
    const panel = document.createElement('div');
    panel.id = 'mawaqit-importer-panel';
    panel.innerHTML = `
        <div class="mawaqit-header">
            <h2>
                <span>📅</span>
                Bulk Calendar Importer
            </h2>
            <button class="mawaqit-close-btn" id="mawaqit-close">
                <svg viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
        <div class="mawaqit-content">
            <div class="mawaqit-section">
                <div class="mawaqit-section-title">Calendar Type</div>
                <div class="mawaqit-radio-group">
                    <div class="mawaqit-radio-option">
                        <input type="radio" id="mawaqit-calendar" name="mawaqit-cal-type" value="calendar" checked>
                        <label for="mawaqit-calendar">Athan</label>
                    </div>
                    <div class="mawaqit-radio-option">
                        <input type="radio" id="mawaqit-iqama" name="mawaqit-cal-type" value="iqamaCalendar">
                        <label for="mawaqit-iqama">Iqama</label>
                    </div>
                </div>
            </div>

            <div class="mawaqit-section">
                <div class="mawaqit-advanced-toggle" id="mawaqit-advanced-toggle">
                    <span>Advanced Options</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="mawaqit-advanced-content" id="mawaqit-advanced-content">
                    <div class="mawaqit-advanced-option">
                        <label class="mawaqit-toggle-label">
                            <input type="checkbox" id="mawaqit-convert-24hr" checked>
                            <span class="mawaqit-toggle-slider"></span>
                            <span class="mawaqit-toggle-text">Convert 12hr to 24hr</span>
                        </label>
                    </div>
                    <div class="mawaqit-advanced-option">
                        <label class="mawaqit-toggle-label">
                            <input type="checkbox" id="mawaqit-convert-dst">
                            <span class="mawaqit-toggle-slider"></span>
                            <span class="mawaqit-toggle-text">Convert DST to Winter Time</span>
                        </label>
                        <div class="mawaqit-hint">Required by Mawaqit: Times must be in standard time (winter time) throughout the year. Enable this if your CSV contains local times with DST applied.</div>
                    </div>
                    <div class="mawaqit-timezone-section" id="mawaqit-timezone-section" style="display: none; margin-top: 12px;">
                        <label for="mawaqit-timezone">Timezone</label>
                        <select id="mawaqit-timezone" class="mawaqit-select">
                            <option value="auto">Auto-detect from browser</option>
                            <option value="Europe/London">Europe/London</option>
                            <option value="Europe/Paris">Europe/Paris</option>
                            <option value="Europe/Berlin">Europe/Berlin</option>
                            <option value="Europe/Rome">Europe/Rome</option>
                            <option value="Europe/Madrid">Europe/Madrid</option>
                            <option value="Europe/Amsterdam">Europe/Amsterdam</option>
                            <option value="Europe/Brussels">Europe/Brussels</option>
                            <option value="Europe/Zurich">Europe/Zurich</option>
                            <option value="Europe/Vienna">Europe/Vienna</option>
                            <option value="Europe/Stockholm">Europe/Stockholm</option>
                            <option value="Europe/Oslo">Europe/Oslo</option>
                            <option value="Europe/Copenhagen">Europe/Copenhagen</option>
                            <option value="Europe/Helsinki">Europe/Helsinki</option>
                            <option value="Europe/Dublin">Europe/Dublin</option>
                            <option value="Europe/Lisbon">Europe/Lisbon</option>
                            <option value="Europe/Prague">Europe/Prague</option>
                            <option value="Europe/Warsaw">Europe/Warsaw</option>
                            <option value="Europe/Budapest">Europe/Budapest</option>
                            <option value="Europe/Athens">Europe/Athens</option>
                            <option value="Europe/Istanbul">Europe/Istanbul</option>
                            <option value="Europe/Moscow">Europe/Moscow</option>
                            <option value="Europe/Kiev">Europe/Kiev</option>
                            <option value="America/New_York">America/New_York</option>
                            <option value="America/Chicago">America/Chicago</option>
                            <option value="America/Denver">America/Denver</option>
                            <option value="America/Los_Angeles">America/Los_Angeles</option>
                            <option value="America/Toronto">America/Toronto</option>
                            <option value="America/Vancouver">America/Vancouver</option>
                            <option value="America/Mexico_City">America/Mexico_City</option>
                            <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                            <option value="America/Buenos_Aires">America/Buenos_Aires</option>
                            <option value="America/Santiago">America/Santiago</option>
                            <option value="Asia/Dubai">Asia/Dubai</option>
                            <option value="Asia/Riyadh">Asia/Riyadh</option>
                            <option value="Asia/Jeddah">Asia/Jeddah</option>
                            <option value="Asia/Kuwait">Asia/Kuwait</option>
                            <option value="Asia/Qatar">Asia/Qatar</option>
                            <option value="Asia/Bahrain">Asia/Bahrain</option>
                            <option value="Asia/Muscat">Asia/Muscat</option>
                            <option value="Asia/Amman">Asia/Amman</option>
                            <option value="Asia/Beirut">Asia/Beirut</option>
                            <option value="Asia/Damascus">Asia/Damascus</option>
                            <option value="Asia/Jerusalem">Asia/Jerusalem</option>
                            <option value="Asia/Gaza">Asia/Gaza</option>
                            <option value="Asia/Tehran">Asia/Tehran</option>
                            <option value="Asia/Karachi">Asia/Karachi</option>
                            <option value="Asia/India">Asia/Kolkata</option>
                            <option value="Asia/Dhaka">Asia/Dhaka</option>
                            <option value="Asia/Jakarta">Asia/Jakarta</option>
                            <option value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur</option>
                            <option value="Asia/Singapore">Asia/Singapore</option>
                            <option value="Asia/Bangkok">Asia/Bangkok</option>
                            <option value="Asia/Hong_Kong">Asia/Hong_Kong</option>
                            <option value="Asia/Shanghai">Asia/Shanghai</option>
                            <option value="Asia/Tokyo">Asia/Tokyo</option>
                            <option value="Asia/Seoul">Asia/Seoul</option>
                            <option value="Asia/Manila">Asia/Manila</option>
                            <option value="Australia/Sydney">Australia/Sydney</option>
                            <option value="Australia/Melbourne">Australia/Melbourne</option>
                            <option value="Australia/Brisbane">Australia/Brisbane</option>
                            <option value="Australia/Perth">Australia/Perth</option>
                            <option value="Australia/Adelaide">Australia/Adelaide</option>
                            <option value="Pacific/Auckland">Pacific/Auckland</option>
                            <option value="Pacific/Fiji">Pacific/Fiji</option>
                            <option value="Africa/Cairo">Africa/Cairo</option>
                            <option value="Africa/Casablanca">Africa/Casablanca</option>
                            <option value="Africa/Tunis">Africa/Tunis</option>
                            <option value="Africa/Algiers">Africa/Algiers</option>
                            <option value="Africa/Tripoli">Africa/Tripoli</option>
                            <option value="Africa/Khartoum">Africa/Khartoum</option>
                            <option value="Africa/Lagos">Africa/Lagos</option>
                            <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                            <option value="Africa/Nairobi">Africa/Nairobi</option>
                        </select>
                        <div class="mawaqit-hint">Select the timezone of your mosque. The system will detect DST periods and subtract 1 hour from times during those periods.</div>
                    </div>
                    <div class="mawaqit-thresholds" id="mawaqit-thresholds">
                        <div class="mawaqit-threshold-title">Conversion Thresholds</div>
                        <div class="mawaqit-threshold-hint">Fajr and Shuruq will remain unchanged. Add 12 hours if hour is less than:</div>
                        <div class="mawaqit-threshold-inputs">
                            <div class="mawaqit-threshold-item">
                                <label>Dhuhr</label>
                                <input type="number" id="mawaqit-threshold-dhuhr" value="5" min="0" max="12">
                            </div>
                            <div class="mawaqit-threshold-item">
                                <label>Asr</label>
                                <input type="number" id="mawaqit-threshold-asr" value="12" min="0" max="12">
                            </div>
                            <div class="mawaqit-threshold-item">
                                <label>Maghrib</label>
                                <input type="number" id="mawaqit-threshold-maghrib" value="12" min="0" max="12">
                            </div>
                            <div class="mawaqit-threshold-item">
                                <label>Isha</label>
                                <input type="number" id="mawaqit-threshold-isha" value="12" min="0" max="12">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mawaqit-section">
                <div class="mawaqit-section-title">Upload CSV</div>
                <div class="mawaqit-file-upload" id="mawaqit-dropzone">
                    <input type="file" id="mawaqit-file-input" accept=".csv,.txt">
                    <div class="mawaqit-upload-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                        </svg>
                    </div>
                    <div class="mawaqit-upload-text">Drop CSV or click to browse</div>
                    <div class="mawaqit-upload-hint">Supports .csv and .txt</div>
                </div>
            </div>

            <div class="mawaqit-message" id="mawaqit-message">
                <svg id="mawaqit-msg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
                <span id="mawaqit-msg-text"></span>
            </div>

            <div class="mawaqit-processing" id="mawaqit-processing">
                <div class="mawaqit-spinner"></div>
                <span>Processing...</span>
            </div>

            <div class="mawaqit-file-info" id="mawaqit-file-info">
                <div class="mawaqit-file-header">
                    <div class="mawaqit-file-name">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span id="mawaqit-filename">file.csv</span>
                    </div>
                    <span class="mawaqit-file-size" id="mawaqit-filesize">0 KB</span>
                </div>
                <div class="mawaqit-file-content" id="mawaqit-filecontent"></div>
                <div class="mawaqit-stats" id="mawaqit-stats"></div>
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    // Toggle panel visibility
    toggleBtn.addEventListener('click', () => {
        panel.classList.toggle('show');
    });

    document.getElementById('mawaqit-close').addEventListener('click', () => {
        panel.classList.remove('show');
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('show')) {
            panel.classList.remove('show');
        }
    });

    // Close when clicking outside the panel
    document.addEventListener('click', (e) => {
        if (panel.classList.contains('show') && 
            !panel.contains(e.target) && 
            e.target !== toggleBtn && 
            !toggleBtn.contains(e.target)) {
            panel.classList.remove('show');
        }
    });

    // Utility functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function showMessage(text, type = 'info') {
        const msgEl = document.getElementById('mawaqit-message');
        const msgText = document.getElementById('mawaqit-msg-text');
        const msgIcon = document.getElementById('mawaqit-msg-icon');

        msgText.textContent = text;
        msgEl.className = `mawaqit-message show ${type}`;

        const icons = {
            error: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
            success: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
            info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
        };
        msgIcon.innerHTML = icons[type] || icons.info;
    }

    function getConversionSettings() {
        const convert24hr = document.getElementById('mawaqit-convert-24hr')?.checked ?? true;
        const convertDst = document.getElementById('mawaqit-convert-dst')?.checked ?? false;
        const timezoneSelect = document.getElementById('mawaqit-timezone');
        const timezone = convertDst && timezoneSelect ? timezoneSelect.value : null;
        
        if (!convert24hr && !convertDst) {
            return { disableConversion: true, disableDstConversion: true };
        }

        return {
            disableConversion: !convert24hr,
            disableDstConversion: !convertDst,
            timezone: timezone,
            thresholds: {
                dhuhr: parseInt(document.getElementById('mawaqit-threshold-dhuhr')?.value ?? 5, 10),
                asr: parseInt(document.getElementById('mawaqit-threshold-asr')?.value ?? 12, 10),
                maghrib: parseInt(document.getElementById('mawaqit-threshold-maghrib')?.value ?? 12, 10),
                isha: parseInt(document.getElementById('mawaqit-threshold-isha')?.value ?? 12, 10)
            }
        };
    }

    function parseMawaqitCSV(csvContent, calendarType) {
        const stats = {
            rowsProcessed: 0,
            fieldsUpdated: 0,
            timesConverted: 0,
            dstAdjustments: 0,
            errors: []
        };

        const settings = getConversionSettings();
        const prayerRules = TimeConverter.getPrayerRules(settings.thresholds, settings.disableConversion);

        const rows = csvContent
            .trim()
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .split('\n');

        for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];
            const columns = row.split(/[,;]/);

            if (!columns[0]?.trim()) continue;

            stats.rowsProcessed++;
            const monthIndex = parseInt(columns[0], 10) - 1;
            const dayOfMonth = parseInt(columns[1], 10);

            let processedColumns = [...columns];

            // Step 1: Convert DST to Standard Time (Winter Time) if enabled
            if (!settings.disableDstConversion && settings.timezone) {
                const dstResult = TimeConverter.convertDstToStandard(processedColumns, calendarType, settings.timezone);
                processedColumns = dstResult.columns;
                stats.dstAdjustments += dstResult.dstAdjustments;
            }

            // Step 2: Convert times from 12hr to 24hr format based on prayer context
            const converted = TimeConverter.convertRow(processedColumns, calendarType, prayerRules);
            stats.timesConverted += converted.conversions;
            converted.errors.forEach(err => stats.errors.push(`Row ${rowIndex}: ${err}`));

            for (let colIndex = 2; colIndex < converted.columns.length; colIndex++) {
                const cellIndex = colIndex - 1;
                const fieldName = `configuration[${calendarType}][${monthIndex}][${dayOfMonth}][${cellIndex}]`;
                const timeValue = converted.columns[colIndex]?.trim();

                try {
                    const inputElement = document.getElementsByName(fieldName)[0];
                    if (inputElement) {
                        inputElement.value = timeValue;
                        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                        stats.fieldsUpdated++;
                    }
                } catch (error) {
                    stats.errors.push(`Row ${rowIndex}: ${error.message}`);
                }
            }
        }

        return stats;
    }

    function showFileInfo(file, content, stats) {
        document.getElementById('mawaqit-filename').textContent = file.name;
        document.getElementById('mawaqit-filesize').textContent = formatFileSize(file.size);
        document.getElementById('mawaqit-filecontent').textContent = content;
        const showDstStats = stats.dstAdjustments > 0;
        document.getElementById('mawaqit-stats').innerHTML = `
            <div class="mawaqit-stat-card">
                <div class="mawaqit-stat-value">${stats.rowsProcessed}</div>
                <div class="mawaqit-stat-label">Rows</div>
            </div>
            <div class="mawaqit-stat-card">
                <div class="mawaqit-stat-value">${stats.fieldsUpdated}</div>
                <div class="mawaqit-stat-label">Fields</div>
            </div>
            <div class="mawaqit-stat-card">
                <div class="mawaqit-stat-value">${stats.timesConverted || 0}</div>
                <div class="mawaqit-stat-label">12hr→24hr</div>
            </div>
            ${showDstStats ? `
            <div class="mawaqit-stat-card">
                <div class="mawaqit-stat-value">${stats.dstAdjustments}</div>
                <div class="mawaqit-stat-label">DST Adjusted</div>
            </div>
            ` : ''}
            <div class="mawaqit-stat-card">
                <div class="mawaqit-stat-value">${stats.errors.length}</div>
                <div class="mawaqit-stat-label">Errors</div>
            </div>
        `;
        document.getElementById('mawaqit-file-info').classList.add('show');
    }

    function handleFileSelection(event) {
        const file = event.target.files?.[0];
        const fileInfo = document.getElementById('mawaqit-file-info');
        const processing = document.getElementById('mawaqit-processing');
        const message = document.getElementById('mawaqit-message');

        fileInfo.classList.remove('show');
        message.classList.remove('show');

        if (!file) {
            showMessage('No file selected.', 'error');
            return;
        }

        const validExtensions = ['.csv', '.txt'];
        const hasValidExtension = validExtensions.some(ext =>
            file.name.toLowerCase().endsWith(ext)
        );

        if (!hasValidExtension) {
            showMessage('Please select a CSV or text file.', 'error');
            return;
        }

        const calendarType = document.querySelector('input[name="mawaqit-cal-type"]:checked')?.value;
        if (!calendarType) {
            showMessage('Please select a calendar type.', 'error');
            return;
        }

        processing.classList.add('show');

        const reader = new FileReader();

        reader.onload = () => {
            processing.classList.remove('show');

            try {
                const content = reader.result;
                const stats = parseMawaqitCSV(content, calendarType);

                showFileInfo(file, content, stats);

                if (stats.errors.length > 0) {
                    showMessage(`Done with ${stats.errors.length} warning(s).`, 'info');
                    console.warn('CSV Warnings:', stats.errors);
                } else {
                    showMessage(`Updated ${stats.fieldsUpdated} fields from ${stats.rowsProcessed} rows.`, 'success');
                }
            } catch (error) {
                showMessage(`Error: ${error.message}`, 'error');
                console.error('CSV Error:', error);
            }
        };

        reader.onerror = () => {
            processing.classList.remove('show');
            showMessage('Error reading file.', 'error');
        };

        reader.readAsText(file);
    }

    // File input handler
    document.getElementById('mawaqit-file-input').addEventListener('change', handleFileSelection);

    // Drag and drop
    const dropzone = document.getElementById('mawaqit-dropzone');

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

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const fileInput = document.getElementById('mawaqit-file-input');
                fileInput.files = files;
                handleFileSelection({ target: fileInput });
            }
        });

    // Advanced Options Toggle
    const advancedToggle = document.getElementById('mawaqit-advanced-toggle');
    const advancedContent = document.getElementById('mawaqit-advanced-content');
    
    advancedToggle.addEventListener('click', () => {
        advancedToggle.classList.toggle('expanded');
        advancedContent.classList.toggle('show');
    });

    // 24hr Conversion Toggle
    const convert24hrToggle = document.getElementById('mawaqit-convert-24hr');
    const thresholdsSection = document.getElementById('mawaqit-thresholds');
    
    convert24hrToggle.addEventListener('change', () => {
        thresholdsSection.classList.toggle('disabled', !convert24hrToggle.checked);
        const inputs = thresholdsSection.querySelectorAll('input');
        inputs.forEach(input => input.disabled = !convert24hrToggle.checked);
    });

    // Initialize thresholds state
    thresholdsSection.classList.toggle('disabled', !convert24hrToggle.checked);

    // DST Conversion Toggle
    const convertDstToggle = document.getElementById('mawaqit-convert-dst');
    const timezoneSection = document.getElementById('mawaqit-timezone-section');
    const timezoneSelect = document.getElementById('mawaqit-timezone');
    
    // Auto-detect browser timezone for default selection
    try {
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (browserTimezone) {
            // Check if the timezone exists in our options
            const options = timezoneSelect.querySelectorAll('option');
            let found = false;
            options.forEach(option => {
                if (option.value === browserTimezone) {
                    option.selected = true;
                    found = true;
                }
            });
            // If exact match not found, try to find a partial match (e.g., "America/New_York" vs "America/Chicago")
            if (!found && browserTimezone.includes('/')) {
                const region = browserTimezone.split('/')[0];
                options.forEach(option => {
                    if (option.value.startsWith(region + '/')) {
                        option.selected = true;
                    }
                });
            }
        }
    } catch (e) {
        console.log('Could not detect browser timezone');
    }
    
    convertDstToggle.addEventListener('change', () => {
        timezoneSection.style.display = convertDstToggle.checked ? 'block' : 'none';
    });

    console.log('✅ Mawaqit Bulk Calendar Importer extension loaded');

})();
