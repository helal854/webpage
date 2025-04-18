/**
 * Investment Calculator Component
 * Handles investment profit calculations with real-time cryptocurrency data
 */

const InvestmentCalculator = (function() {
    // Chart instance
    let investmentChart = null;
    
    // Current cryptocurrency data
    let currentCryptoData = null;
    
    // Debounce timer for input changes
    let debounceTimer = null;
    
    /**
     * Initialize the investment calculator
     */
    function init() {
        // Load saved settings
        const savedSettings = StorageUtil.loadInvestmentSettings();
        
        // Set initial values from saved settings
        $('#crypto-select').val(savedSettings.coin);
        $('#currency-select').val(savedSettings.currency);
        $('#initial-investment').val(savedSettings.initialInvestment);
        $('#initial-investment-slider').val(savedSettings.initialInvestment);
        $('#interest-rate').val(savedSettings.interestRate * 100); // Convert decimal to percentage
        $('#interest-rate-slider').val(savedSettings.interestRate * 100);
        $('#investment-time').val(savedSettings.years);
        $('#investment-time-slider').val(savedSettings.years);
        $('#compound-frequency').val(savedSettings.compoundFrequency);
        
        // Set currency symbol
        updateCurrencySymbol(savedSettings.currency);
        
        // Fetch initial cryptocurrency data
        fetchCryptoData(savedSettings.coin, savedSettings.currency);
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize chart
        initChart();
    }
    
    /**
     * Set up event listeners for form controls
     */
    function setupEventListeners() {
        // Cryptocurrency selection
        $('#crypto-select').on('change', function() {
            const coin = $(this).val();
            const currency = $('#currency-select').val();
            fetchCryptoData(coin, currency);
            saveSettings();
        });
        
        // Currency selection
        $('#currency-select').on('change', function() {
            const currency = $(this).val();
            const coin = $('#crypto-select').val();
            updateCurrencySymbol(currency);
            fetchCryptoData(coin, currency);
            saveSettings();
        });
        
        // Initial investment input and slider
        $('#initial-investment').on('input', function() {
            $('#initial-investment-slider').val($(this).val());
            debounceCalculation();
        });
        
        $('#initial-investment-slider').on('input', function() {
            $('#initial-investment').val($(this).val());
            debounceCalculation();
        });
        
        // Interest rate input and slider
        $('#interest-rate').on('input', function() {
            $('#interest-rate-slider').val($(this).val());
            debounceCalculation();
        });
        
        $('#interest-rate-slider').on('input', function() {
            $('#interest-rate').val($(this).val());
            debounceCalculation();
        });
        
        // Investment time input and slider
        $('#investment-time').on('input', function() {
            $('#investment-time-slider').val($(this).val());
            debounceCalculation();
        });
        
        $('#investment-time-slider').on('input', function() {
            $('#investment-time').val($(this).val());
            debounceCalculation();
        });
        
        // Compound frequency selection
        $('#compound-frequency').on('change', function() {
            debounceCalculation();
            saveSettings();
        });
        
        // Save calculation button
        $('#save-calculation').on('click', function() {
            saveCalculation();
        });
        
        // Reset calculator button
        $('#reset-calculator').on('click', function() {
            resetCalculator();
        });
    }
    
    /**
     * Initialize the investment chart
     */
    function initChart() {
        const ctx = document.getElementById('investment-chart').getContext('2d');
        
        investmentChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Investment Value',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(52, 152, 219, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(52, 152, 219, 1)',
                    data: []
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Years'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(0);
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Value'
                        },
                        ticks: {
                            callback: function(value) {
                                return CalculationsUtil.formatCurrency(value, $('#currency-select').val());
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return CalculationsUtil.formatCurrency(context.parsed.y, $('#currency-select').val());
                            },
                            title: function(context) {
                                return `Year ${context[0].parsed.x}`;
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    /**
     * Fetch cryptocurrency data from API
     * @param {string} coin - Coin ID
     * @param {string} currency - Currency code
     */
    function fetchCryptoData(coin, currency) {
        // Show loading indicator
        $('#api-loading-indicator').show();
        
        // Fetch coin data
        ApiService.getCoinData(coin)
            .then(data => {
                currentCryptoData = data;
                
                // Update UI with coin data
                updateCryptoUI(data, currency);
                
                // Calculate investment with new data
                calculateInvestment();
                
                // Hide loading indicator
                $('#api-loading-indicator').hide();
            })
            .catch(error => {
                console.error('Error fetching crypto data:', error);
                
                // Show error message
                alert('Error fetching cryptocurrency data. Please try again later.');
                
                // Hide loading indicator
                $('#api-loading-indicator').hide();
            });
    }
    
    /**
     * Update cryptocurrency UI elements
     * @param {object} data - Cryptocurrency data
     * @param {string} currency - Currency code
     */
    function updateCryptoUI(data, currency) {
        // Set crypto name and symbol
        $('#crypto-name').text(data.name);
        $('#crypto-symbol').text(`(${data.symbol.toUpperCase()})`);
        
        // Set crypto icon
        $('#crypto-icon-img').attr('src', data.image.small);
        
        // Set current price
        const price = data.market_data.current_price[currency.toLowerCase()];
        $('#current-price').text(CalculationsUtil.formatCurrency(price, currency));
    }
    
    /**
     * Update currency symbol in UI
     * @param {string} currency - Currency code
     */
    function updateCurrencySymbol(currency) {
        let symbol = '$';
        
        switch(currency.toLowerCase()) {
            case 'eur':
                symbol = '€';
                break;
            case 'gbp':
                symbol = '£';
                break;
            case 'jpy':
                symbol = '¥';
                break;
            case 'cny':
                symbol = '¥';
                break;
            default:
                symbol = '$';
        }
        
        $('#currency-symbol').text(symbol);
    }
    
    /**
     * Calculate investment results
     */
    function calculateInvestment() {
        // Get input values
        const initialInvestment = parseFloat($('#initial-investment').val());
        const interestRate = parseFloat($('#interest-rate').val()) / 100; // Convert percentage to decimal
        const years = parseFloat($('#investment-time').val());
        const compoundFrequency = parseInt($('#compound-frequency').val());
        const currency = $('#currency-select').val();
        
        // Calculate compound interest
        const result = CalculationsUtil.calculateCompoundInterest(
            initialInvestment,
            interestRate,
            years,
            compoundFrequency
        );
        
        // Update results in UI
        $('#result-initial').text(CalculationsUtil.formatCurrency(result.principal, currency));
        $('#result-final').text(CalculationsUtil.formatCurrency(result.finalAmount, currency));
        $('#result-interest').text(CalculationsUtil.formatCurrency(result.interestEarned, currency));
        
        // Calculate and display total return percentage
        const totalReturn = (result.finalAmount / result.principal - 1) * 100;
        $('#result-return').text(`${totalReturn.toFixed(2)}%`);
        
        // Update chart
        updateChart(initialInvestment, interestRate, years, compoundFrequency);
    }
    
    /**
     * Update investment chart with new data
     * @param {number} principal - Initial investment
     * @param {number} rate - Interest rate
     * @param {number} years - Investment time in years
     * @param {number} compoundFrequency - Compound frequency
     */
    function updateChart(principal, rate, years, compoundFrequency) {
        // Generate chart data
        const chartData = CalculationsUtil.generateCompoundInterestChartData(
            principal,
            rate,
            years,
            compoundFrequency
        );
        
        // Update chart data
        investmentChart.data.datasets[0].data = chartData;
        
        // Update chart x-axis to match investment time
        investmentChart.options.scales.x.max = years;
        
        // Update chart
        investmentChart.update();
    }
    
    /**
     * Debounce calculation to prevent excessive updates
     */
    function debounceCalculation() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            calculateInvestment();
            saveSettings();
        }, 300);
    }
    
    /**
     * Save current settings to localStorage
     */
    function saveSettings() {
        const settings = {
            coin: $('#crypto-select').val(),
            currency: $('#currency-select').val(),
            initialInvestment: parseFloat($('#initial-investment').val()),
            interestRate: parseFloat($('#interest-rate').val()) / 100, // Convert percentage to decimal
            years: parseFloat($('#investment-time').val()),
            compoundFrequency: parseInt($('#compound-frequency').val())
        };
        
        StorageUtil.saveInvestmentSettings(settings);
    }
    
    /**
     * Save current calculation to history
     */
    function saveCalculation() {
        // Get current values
        const initialInvestment = parseFloat($('#initial-investment').val());
        const interestRate = parseFloat($('#interest-rate').val()) / 100;
        const years = parseFloat($('#investment-time').val());
        const compoundFrequency = parseInt($('#compound-frequency').val());
        const currency = $('#currency-select').val();
        const coin = $('#crypto-select').val();
        
        // Calculate result
        const result = CalculationsUtil.calculateCompoundInterest(
            initialInvestment,
            interestRate,
            years,
            compoundFrequency
        );
        
        // Create calculation object
        const calculation = {
            coin: coin,
            coinName: currentCryptoData.name,
            currency: currency,
            initialInvestment: initialInvestment,
            interestRate: interestRate,
            years: years,
            compoundFrequency: compoundFrequency,
            finalAmount: result.finalAmount,
            interestEarned: result.interestEarned,
            totalReturn: (result.finalAmount / result.principal - 1) * 100
        };
        
        // Save to history
        StorageUtil.saveRecentCalculation('investment', calculation);
        
        // Show success message
        alert('Calculation saved successfully!');
    }
    
    /**
     * Reset calculator to default values
     */
    function resetCalculator() {
        // Set default values
        $('#crypto-select').val('bitcoin');
        $('#currency-select').val('usd');
        $('#initial-investment').val(1000);
        $('#initial-investment-slider').val(1000);
        $('#interest-rate').val(5);
        $('#interest-rate-slider').val(5);
        $('#investment-time').val(5);
        $('#investment-time-slider').val(5);
        $('#compound-frequency').val(12);
        
        // Update currency symbol
        updateCurrencySymbol('usd');
        
        // Fetch cryptocurrency data
        fetchCryptoData('bitcoin', 'usd');
        
        // Save settings
        saveSettings();
    }
    
    // Public API
    return {
        init: init
    };
})();
