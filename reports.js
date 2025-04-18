/**
 * Reports Component
 * Handles interactive reports with filters, charts, and data visualization
 */

const ReportsComponent = (function() {
    // Chart instance
    let reportChart = null;
    
    // Current report data
    let reportData = [];
    
    // Current page for pagination
    let currentPage = 1;
    
    // Items per page
    const itemsPerPage = 10;
    
    /**
     * Initialize the reports component
     */
    function init() {
        // Load saved filter preferences
        const savedFilters = StorageUtil.loadReportFilters();
        
        // Set initial values from saved filters
        $('#date-range').val(savedFilters.dateRange);
        $('#report-type').val(savedFilters.reportType || 'all');
        $('#currency-filter').val(savedFilters.currency);
        $('#cryptocurrency-filter').val(savedFilters.cryptocurrency || 'all');
        
        if (savedFilters.profitRange) {
            $('#min-profit').val(savedFilters.profitRange[0] !== 0 ? savedFilters.profitRange[0] : '');
            $('#max-profit').val(savedFilters.profitRange[1] !== Infinity ? savedFilters.profitRange[1] : '');
        }
        
        // Show custom date range if selected
        if (savedFilters.dateRange === 'custom') {
            $('#custom-date-container').show();
            if (savedFilters.customDateRange) {
                $('#start-date').val(savedFilters.customDateRange.start);
                $('#end-date').val(savedFilters.customDateRange.end);
            }
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize chart
        initChart();
        
        // Load report data
        loadReportData();
    }
    
    /**
     * Set up event listeners for form controls
     */
    function setupEventListeners() {
        // Date range selection
        $('#date-range').on('change', function() {
            if ($(this).val() === 'custom') {
                $('#custom-date-container').show();
            } else {
                $('#custom-date-container').hide();
            }
        });
        
        // Apply filters button
        $('#apply-filters').on('click', function() {
            applyFilters();
        });
        
        // Reset filters button
        $('#reset-filters').on('click', function() {
            resetFilters();
        });
        
        // View toggle buttons
        $('#view-chart').on('click', function() {
            $(this).addClass('active');
            $('#view-table').removeClass('active');
            $('#chart-container').show();
            $('#table-container').hide();
            
            // Update chart if needed
            updateChart();
        });
        
        $('#view-table').on('click', function() {
            $(this).addClass('active');
            $('#view-chart').removeClass('active');
            $('#table-container').show();
            $('#chart-container').hide();
        });
        
        // Chart type selection
        $('#chart-type').on('change', function() {
            updateChart();
        });
        
        // Export report button
        $('#export-report').on('click', function() {
            exportReport();
        });
    }
    
    /**
     * Initialize the report chart
     */
    function initChart() {
        const ctx = document.getElementById('report-chart').getContext('2d');
        
        reportChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Profit/Loss',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    data: []
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Value'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Load report data from localStorage
     */
    function loadReportData() {
        // Get recent calculations from storage
        const calculations = StorageUtil.loadRecentCalculations();
        
        // Set as report data
        reportData = calculations;
        
        // Apply filters to data
        applyFilters();
    }
    
    /**
     * Apply filters to report data
     */
    function applyFilters() {
        // Get filter values
        const dateRange = $('#date-range').val();
        const reportType = $('#report-type').val();
        const currency = $('#currency-filter').val();
        const cryptocurrency = $('#cryptocurrency-filter').val();
        const minProfit = $('#min-profit').val() ? parseFloat($('#min-profit').val()) : 0;
        const maxProfit = $('#max-profit').val() ? parseFloat($('#max-profit').val()) : Infinity;
        
        // Get custom date range if selected
        let startDate = null;
        let endDate = null;
        
        if (dateRange === 'custom') {
            startDate = $('#start-date').val() ? new Date($('#start-date').val()) : null;
            endDate = $('#end-date').val() ? new Date($('#end-date').val()) : null;
        } else {
            // Calculate date range based on selection
            const now = new Date();
            endDate = now;
            
            switch(dateRange) {
                case 'day':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'quarter':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case 'year':
                    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(0); // Beginning of time
            }
        }
        
        // Filter data
        const filteredData = reportData.filter(item => {
            // Filter by date
            const itemDate = new Date(item.timestamp);
            if (startDate && itemDate < startDate) return false;
            if (endDate && itemDate > endDate) return false;
            
            // Filter by report type
            if (reportType !== 'all' && item.type !== reportType) return false;
            
            // Filter by currency (investment calculations)
            if (currency !== 'all' && item.type === 'investment' && item.currency !== currency) return false;
            
            // Filter by cryptocurrency (investment calculations)
            if (cryptocurrency !== 'all' && item.type === 'investment' && item.coin !== cryptocurrency) return false;
            
            // Filter by profit range (investment calculations)
            if (item.type === 'investment') {
                const profit = item.interestEarned;
                if (profit < minProfit || profit > maxProfit) return false;
            }
            
            // Filter by profit range (mining calculations)
            if (item.type === 'mining') {
                const profit = item.profitability.profits.monthly.usd;
                if (profit < minProfit || profit > maxProfit) return false;
            }
            
            return true;
        });
        
        // Save filter preferences if enabled
        if ($('#save-preferences').prop('checked')) {
            saveFilterPreferences();
        }
        
        // Update UI with filtered data
        updateReportUI(filteredData);
    }
    
    /**
     * Update report UI with filtered data
     * @param {Array} filteredData - Filtered report data
     */
    function updateReportUI(filteredData) {
        // Reset pagination
        currentPage = 1;
        
        // Update table
        updateTable(filteredData);
        
        // Update chart
        updateChart(filteredData);
        
        // Update summary statistics
        updateSummaryStatistics(filteredData);
    }
    
    /**
     * Update table with filtered data
     * @param {Array} filteredData - Filtered report data
     */
    function updateTable(filteredData) {
        const tableBody = $('#report-table-body');
        tableBody.empty();
        
        // Check if data is empty
        if (filteredData.length === 0) {
            tableBody.append(`
                <tr>
                    <td colspan="8" class="text-center">No data available. Apply different filters to see results.</td>
                </tr>
            `);
            
            // Update pagination
            updatePagination(filteredData);
            
            return;
        }
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        // Add rows to table
        paginatedData.forEach((item, index) => {
            let row = '';
            
            if (item.type === 'investment') {
                // Format investment calculation row
                const date = new Date(item.timestamp).toLocaleDateString();
                const initialValue = CalculationsUtil.formatCurrency(item.initialInvestment, item.currency);
                const finalValue = CalculationsUtil.formatCurrency(item.finalAmount, item.currency);
                const profit = CalculationsUtil.formatCurrency(item.interestEarned, item.currency);
                const profitClass = item.interestEarned >= 0 ? 'text-success' : 'text-danger';
                
                row = `
                    <tr>
                        <td>${date}</td>
                        <td>Investment</td>
                        <td>${item.coinName}</td>
                        <td>${item.currency.toUpperCase()}</td>
                        <td>${initialValue}</td>
                        <td>${finalValue}</td>
                        <td class="${profitClass}">${profit}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary view-details" data-index="${startIndex + index}">
                                <i class="bi bi-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
            } else if (item.type === 'mining') {
                // Format mining calculation row
                const date = new Date(item.timestamp).toLocaleDateString();
                const initialValue = '$0.00'; // Mining doesn't have initial investment
                const monthlyRevenue = CalculationsUtil.formatCurrency(item.profitability.rewards.monthly.usd, 'usd');
                const monthlyProfit = CalculationsUtil.formatCurrency(item.profitability.profits.monthly.usd, 'usd');
                const profitClass = item.profitability.profits.monthly.usd >= 0 ? 'text-success' : 'text-danger';
                
                row = `
                    <tr>
                        <td>${date}</td>
                        <td>Mining</td>
                        <td>Bitcoin</td>
                        <td>USD</td>
                        <td>${initialValue}</td>
                        <td>${monthlyRevenue}</td>
                        <td class="${profitClass}">${monthlyProfit}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary view-details" data-index="${startIndex + index}">
                                <i class="bi bi-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }
            
            tableBody.append(row);
        });
        
        // Add event listeners to view details buttons
        $('.view-details').on('click', function() {
            const index = $(this).data('index');
            viewCalculationDetails(filteredData[index]);
        });
        
        // Update pagination
        updatePagination(filteredData);
        
        // Update showing entries text
        $('#showing-entries').text(paginatedData.length);
        $('#total-entries').text(filteredData.length);
    }
    
    /**
     * Update pagination controls
     * @param {Array} filteredData - Filtered report data
     */
    function updatePagination(filteredData) {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        const pagination = $('.pagination');
        pagination.empty();
        
        // Previous button
        const prevDisabled = currentPage === 1 ? 'disabled' : '';
        pagination.append(`
            <li class="page-item ${prevDisabled}">
                <a class="page-link" href="#" id="prev-page" tabindex="-1" aria-disabled="${currentPage === 1}">Previous</a>
            </li>
        `);
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const active = i === currentPage ? 'active' : '';
            pagination.append(`
                <li class="page-item ${active}">
                    <a class="page-link page-number" href="#" data-page="${i}">${i}</a>
                </li>
            `);
        }
        
        // Next button
        const nextDisabled = currentPage === totalPages || totalPages === 0 ? 'disabled' : '';
        pagination.append(`
            <li class="page-item ${nextDisabled}">
                <a class="page-link" href="#" id="next-page" tabindex="-1" aria-disabled="${currentPage === totalPages || totalPages === 0}">Next</a>
            </li>
        `);
        
        // Add event listeners to pagination controls
        $('#prev-page').on('click', function(e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                updateTable(filteredData);
            }
        });
        
        $('#next-page').on('click', function(e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                updateTable(filteredData);
            }
        });
        
        $('.page-number').on('click', function(e) {
            e.preventDefault();
            currentPage = parseInt($(this).data('page'));
            updateTable(filteredData);
        });
    }
    
    /**
     * Update chart with filtered data
     * @param {Array} filteredData - Filtered report data
     */
    function updateChart(filteredData) {
        // If chart container is not visible, don't update
        if ($('#chart-container').is(':hidden')) return;
        
        // If no data provided, use current filtered data
        if (!filteredData) {
            filteredData = reportData.filter(item => {
                // Apply current filters
                // (simplified version - in real implementation, would reuse applyFilters logic)
                return true;
            });
        }
        
        // Get chart type
        const chartType = $('#chart-type').val();
        
        // Prepare data for chart based on type
        let labels = [];
        let data = [];
        let backgroundColor = [];
        let borderColor = [];
        
        if (chartType === 'line' || chartType === 'bar') {
            // Sort data by date
            const sortedData = [...filteredData].sort((a, b) => a.timestamp - b.timestamp);
            
(Content truncated due to size limit. Use line ranges to read in chunks)