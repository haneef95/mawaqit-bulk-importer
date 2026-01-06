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

    function parseMawaqitCSV(csvContent, calendarType) {
        const stats = {
            rowsProcessed: 0,
            fieldsUpdated: 0,
            errors: []
        };

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

            for (let colIndex = 2; colIndex < columns.length; colIndex++) {
                const cellIndex = colIndex - 1;
                const fieldName = `configuration[${calendarType}][${monthIndex}][${dayOfMonth}][${cellIndex}]`;
                const timeValue = columns[colIndex]?.trim();

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

    console.log('✅ Mawaqit Bulk Calendar Importer extension loaded');

})();
