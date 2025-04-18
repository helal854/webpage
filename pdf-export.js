/**
 * PDF Export Component
 * Handles PDF generation with custom branding and multilingual support
 */

const PdfExportComponent = (function() {
    // Current calculation or report data
    let currentData = null;
    
    // PDF document instance
    let pdfDoc = null;
    
    // Current export type
    let exportType = 'single';
    
    // Logo image data URL
    let logoDataUrl = null;
    
    /**
     * Initialize the PDF export component
     */
    function init() {
        // Load saved preferences
        const savedSettings = StorageUtil.loadExportSettings();
        
        // Set initial values from saved settings
        $('#pdf-title').val(savedSettings.pdfTitle || 'Cryptocurrency Calculation Report');
        $('#include-branding').prop('checked', savedSettings.brandingEnabled);
        $('#company-name').val(savedSettings.companyName);
        $('#logo-url').val(savedSettings.logoUrl || '');
        $('#brand-color').val(savedSettings.brandColor || '#3498db');
        $('#pdf-language').val(savedSettings.language);
        $('#include-charts').prop('checked', savedSettings.includeCharts !== false);
        $('#include-tables').prop('checked', savedSettings.includeTables !== false);
        $('#include-summary').prop('checked', savedSettings.includeSummary !== false);
        $('#footer-text').val(savedSettings.footerText || '');
        
        // Toggle branding options visibility
        toggleBrandingOptions();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    /**
     * Set up event listeners for form controls
     */
    function setupEventListeners() {
        // Export type selection
        $('#export-type').on('change', function() {
            exportType = $(this).val();
            updatePreview();
        });
        
        // Branding toggle
        $('#include-branding').on('change', function() {
            toggleBrandingOptions();
            updatePreview();
        });
        
        // Logo upload
        $('#upload-logo').on('click', function() {
            uploadLogo();
        });
        
        // Refresh preview button
        $('#refresh-preview').on('click', function() {
            updatePreview();
        });
        
        // Generate PDF button
        $('#generate-pdf').on('click', function() {
            generatePDF();
        });
        
        // Reset options button
        $('#reset-options').on('click', function() {
            resetOptions();
        });
        
        // Download PDF button
        $('#download-pdf').on('click', function() {
            downloadPDF();
        });
        
        // Form input changes
        $('#pdf-title, #company-name, #logo-url, #brand-color, #pdf-language, #footer-text').on('change', function() {
            if ($('#save-pdf-preferences').prop('checked')) {
                savePreferences();
            }
        });
        
        // Checkbox changes
        $('#include-charts, #include-tables, #include-summary').on('change', function() {
            updatePreview();
            if ($('#save-pdf-preferences').prop('checked')) {
                savePreferences();
            }
        });
    }
    
    /**
     * Toggle branding options visibility
     */
    function toggleBrandingOptions() {
        if ($('#include-branding').prop('checked')) {
            $('#branding-options').show();
        } else {
            $('#branding-options').hide();
        }
    }
    
    /**
     * Upload logo from file input
     */
    function uploadLogo() {
        const fileInput = document.getElementById('logo-upload');
        
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            
            // Check file size (max 1MB)
            if (file.size > 1024 * 1024) {
                alert('Logo file is too large. Maximum size is 1MB.');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                logoDataUrl = e.target.result;
                updatePreview();
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    /**
     * Update PDF preview
     */
    function updatePreview() {
        // Show loading placeholder
        $('#preview-placeholder').show();
        $('#preview-content').hide();
        
        // Get current options
        const options = getExportOptions();
        
        // Check if we have data to preview
        if (!currentData) {
            $('#preview-placeholder').html('<p class="text-muted">No data available for preview. Please load a calculation or report first.</p>');
            return;
        }
        
        // Generate preview content
        let previewHtml = '';
        
        // Add header with branding if enabled
        if (options.brandingEnabled) {
            previewHtml += `
                <div class="pdf-header" style="border-bottom: 2px solid ${options.brandColor}; padding-bottom: 10px; margin-bottom: 20px;">
                    <div class="row align-items-center">
                        <div class="col-8">
                            <h2 style="color: ${options.brandColor};">${options.pdfTitle}</h2>
                            <p>${options.companyName}</p>
                        </div>
                        <div class="col-4 text-end">
                            ${logoDataUrl ? `<img src="${logoDataUrl}" alt="Logo" style="max-height: 50px; max-width: 100%;">` : 
                              options.logoUrl ? `<img src="${options.logoUrl}" alt="Logo" style="max-height: 50px; max-width: 100%;">` : ''}
                        </div>
                    </div>
                </div>
            `;
        } else {
            previewHtml += `
                <div class="pdf-header" style="margin-bottom: 20px;">
                    <h2>${options.pdfTitle}</h2>
                </div>
            `;
        }
        
        // Add content based on export type
        if (exportType === 'single' && currentData.type) {
            // Single calculation export
            previewHtml += generateCalculationPreview(currentData, options);
        } else {
            // Report export
            previewHtml += generateReportPreview(currentData, options);
        }
        
        // Add footer
        if (options.footerText) {
            previewHtml += `
                <div class="pdf-footer" style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 0.8rem; color: #666;">
                    <p>${options.footerText}</p>
                </div>
            `;
        }
        
        // Update preview content
        $('#preview-content').html(previewHtml);
        $('#preview-placeholder').hide();
        $('#preview-content').show();
    }
    
    /**
     * Generate calculation preview HTML
     * @param {object} calculation - Calculation data
     * @param {object} options - Export options
     * @returns {string} - HTML content
     */
    function generateCalculationPreview(calculation, options) {
        let html = '';
        
        if (calculation.type === 'investment') {
            // Investment calculation preview
            html += `
                <div class="calculation-details">
                    <h3>Investment Calculation Details</h3>
                    <p><strong>Date:</strong> ${new Date(calculation.timestamp).toLocaleString()}</p>
                    <p><strong>Cryptocurrency:</strong> ${calculation.coinName}</p>
                    <p><strong>Currency:</strong> ${calculation.currency.toUpperCase()}</p>
                    
                    <div class="row mt-4">
                        <div class="col-6">
                            <h4>Input Parameters</h4>
                            <p><strong>Initial Investment:</strong> ${CalculationsUtil.formatCurrency(calculation.initialInvestment, calculation.currency)}</p>
                            <p><strong>Interest Rate:</strong> ${(calculation.interestRate * 100).toFixed(2)}%</p>
                            <p><strong>Investment Period:</strong> ${calculation.years} years</p>
                            <p><strong>Compound Frequency:</strong> ${calculation.compoundFrequency}x per year</p>
                        </div>
                        <div class="col-6">
                            <h4>Results</h4>
                            <p><strong>Final Amount:</strong> ${CalculationsUtil.formatCurrency(calculation.finalAmount, calculation.currency)}</p>
                            <p><strong>Interest Earned:</strong> ${CalculationsUtil.formatCurrency(calculation.interestEarned, calculation.currency)}</p>
                            <p><strong>Total Return:</strong> ${calculation.totalReturn.toFixed(2)}%</p>
                        </div>
                    </div>
                </div>
            `;
            
            // Add chart if enabled
            if (options.includeCharts) {
                html += `
                    <div class="chart-container mt-4" style="height: 300px;">
                        <h4>Investment Growth Chart</h4>
                        <canvas id="preview-chart"></canvas>
                    </div>
                `;
                
                // Initialize chart after DOM update
                setTimeout(() => {
                    const ctx = document.getElementById('preview-chart').getContext('2d');
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: Array.from({length: calculation.years + 1}, (_, i) => `Year ${i}`),
                            datasets: [{
                                label: 'Investment Value',
                                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                                borderColor: options.brandColor || 'rgba(52, 152, 219, 1)',
                                borderWidth: 2,
                                data: Array.from({length: calculation.years + 1}, (_, i) => {
                                    return calculation.initialInvestment * Math.pow(1 + calculation.interestRate/calculation.compoundFrequency, calculation.compoundFrequency * i);
                                })
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false
                        }
                    });
                }, 100);
            }
        } else if (calculation.type === 'mining') {
            // Mining calculation preview
            html += `
                <div class="calculation-details">
                    <h3>Mining Calculation Details</h3>
                    <p><strong>Date:</strong> ${new Date(calculation.timestamp).toLocaleString()}</p>
                    
                    <div class="row mt-4">
                        <div class="col-6">
                            <h4>Input Parameters</h4>
                            <p><strong>Hash Rate:</strong> ${calculation.hashRate} ${calculation.hashRateUnit}</p>
                            <p><strong>Power Consumption:</strong> ${calculation.powerConsumption} W</p>
                            <p><strong>Electricity Cost:</strong> $${calculation.electricityCost} per kWh</p>
                            <p><strong>Pool Fee:</strong> ${(calculation.poolFee * 100).toFixed(2)}%</p>
                        </div>
                        <div class="col-6">
                            <h4>Network Parameters</h4>
                            <p><strong>Bitcoin Price:</strong> ${CalculationsUtil.formatCurrency(calculation.bitcoinPrice, 'usd')}</p>
                            <p><strong>Network Difficulty:</strong> ${calculation.networkDifficulty.toLocaleString()}</p>
                            <p><strong>Block Reward:</strong> ${calculation.blockReward || '6.25'} BTC</p>
                        </div>
                    </div>
                </div>
            `;
            
            // Add profitability table if enabled
            if (options.includeTables) {
                html += `
                    <div class="profitability-table mt-4">
                        <h4>Mining Profitability</h4>
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Period</th>
                                    <th>BTC Mined</th>
                                    <th>Revenue</th>
                                    <th>Electricity Cost</th>
                                    <th>Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Daily</td>
                                    <td>${calculation.profitability.rewards.daily.btc.toFixed(8)} BTC</td>
                                    <td>${CalculationsUtil.formatCurrency(calculation.profitability.rewards.daily.usd, 'usd')}</td>
                                    <td>${CalculationsUtil.formatCurrency(calculation.profitability.costs.daily, 'usd')}</td>
                                    <td>${CalculationsUtil.formatCurrency(calculation.profitability.profits.daily.usd, 'usd')}</td>
                                </tr>
                                <tr>
                                    <td>Monthly</td>
                                    <td>${calculation.profitability.rewards.monthly.btc.toFixed(8)} BTC</td>
                                    <td>${CalculationsUtil.formatCurrency(calculation.profitability.rewards.monthly.usd, 'usd')}</td>
                                    <td>${CalculationsUtil.formatCurrency(calculation.profitability.costs.monthly, 'usd')}</td>
                                    <td>${CalculationsUtil.formatCurrency(calculation.profitability.profits.monthly.usd, 'usd')}</td>
                                </tr>
                                <tr>
                                    <td>Yearly</td>
                                    <td>${calculation.profitability.rewards.yearly.btc.toFixed(8)} BTC</td>
                                    <td>${CalculationsUtil.formatCurrency(calculation.profitability.rewards.yearly.usd, 'usd')}</td>
                                    <td>${CalculationsUtil.formatCurrency(calculation.profitability.costs.yearly, 'usd')}</td>
                                    <td>${CalculationsUtil.formatCurrency(calculation.profitability.profits.yearly.usd, 'usd')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            // Add chart if enabled
            if (options.includeCharts) {
                html += `
                    <div class="chart-container mt-4" style="height: 300px;">
                        <h4>Mining Profitability Chart</h4>
                        <canvas id="preview-chart"></canvas>
                    </div>
                `;
                
                // Initialize chart after DOM update
                setTimeout(() => {
                    const ctx = document.getElementById('preview-chart').getContext('2d');
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ['Daily', 'Monthly', 'Yearly'],
                            datasets: [
                                {
                                    label: 'Revenue',
                                    backgroundColor: 'rgba(46, 204, 113, 0.5)',
                                    borderColor: 'rgba(46, 204, 113, 1)',
                                    borderWidth: 1,
          
(Content truncated due to size limit. Use line ranges to read in chunks)