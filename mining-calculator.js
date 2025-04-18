/**
 * Mining Calculator Component
 * Handles Bitcoin mining profitability calculations with real-time network data
 */

const MiningCalculator = (function() {
    // Current Bitcoin network data
    let bitcoinNetworkData = null;
    
    // Debounce timer for input changes
    let debounceTimer = null;
    
    // Current display currency (USD or BTC)
    let displayCurrency = 'usd';
    
    /**
     * Initialize the mining calculator
     */
    function init() {
        // Load saved settings
        const savedSettings = StorageUtil.loadMiningSettings();
        
        // Set initial values from saved settings
        $('#hash-rate').val(savedSettings.hashRate);
        $('#hash-rate-slider').val(savedSettings.hashRate);
        $('#hash-rate-unit').val(savedSettings.hashRateUnit);
        $('#power-consumption').val(savedSettings.powerConsumption);
        $('#power-consumption-slider').val(savedSettings.powerConsumption);
        $('#electricity-cost').val(savedSettings.electricityCost);
        $('#electricity-cost-slider').val(savedSettings.electricityCost);
        $('#pool-fee').val(savedSettings.poolFee * 100); // Convert decimal to percentage
        $('#pool-fee-slider').val(savedSettings.poolFee * 100);
        
        // Set display currency
        displayCurrency = savedSettings.displayCurrency;
        $('#currency-toggle').prop('checked', displayCurrency === 'btc');
        updateCurrencyLabel();
        
        // Fetch Bitcoin network data
        fetchBitcoinNetworkData();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    /**
     * Set up event listeners for form controls
     */
    function setupEventListeners() {
        // Hash rate input and slider
        $('#hash-rate').on('input', function() {
            $('#hash-rate-slider').val($(this).val());
            debounceCalculation();
        });
        
        $('#hash-rate-slider').on('input', function() {
            $('#hash-rate').val($(this).val());
            debounceCalculation();
        });
        
        // Hash rate unit selection
        $('#hash-rate-unit').on('change', function() {
            // Update slider range based on unit
            updateHashRateSliderRange($(this).val());
            debounceCalculation();
            saveSettings();
        });
        
        // Power consumption input and slider
        $('#power-consumption').on('input', function() {
            $('#power-consumption-slider').val($(this).val());
            debounceCalculation();
        });
        
        $('#power-consumption-slider').on('input', function() {
            $('#power-consumption').val($(this).val());
            debounceCalculation();
        });
        
        // Electricity cost input and slider
        $('#electricity-cost').on('input', function() {
            $('#electricity-cost-slider').val($(this).val());
            debounceCalculation();
        });
        
        $('#electricity-cost-slider').on('input', function() {
            $('#electricity-cost').val($(this).val());
            debounceCalculation();
        });
        
        // Pool fee input and slider
        $('#pool-fee').on('input', function() {
            $('#pool-fee-slider').val($(this).val());
            debounceCalculation();
        });
        
        $('#pool-fee-slider').on('input', function() {
            $('#pool-fee').val($(this).val());
            debounceCalculation();
        });
        
        // Currency toggle
        $('#currency-toggle').on('change', function() {
            displayCurrency = $(this).prop('checked') ? 'btc' : 'usd';
            updateCurrencyLabel();
            updateProfitabilityDisplay();
            saveSettings();
        });
        
        // Save calculation button
        $('#save-mining-calculation').on('click', function() {
            saveMiningCalculation();
        });
        
        // Reset calculator button
        $('#reset-mining-calculator').on('click', function() {
            resetCalculator();
        });
        
        // Tab switching
        $('#profitability-tabs button').on('click', function(e) {
            e.preventDefault();
            $(this).tab('show');
        });
    }
    
    /**
     * Update hash rate slider range based on selected unit
     * @param {string} unit - Hash rate unit
     */
    function updateHashRateSliderRange(unit) {
        const slider = $('#hash-rate-slider');
        const hashRateInput = $('#hash-rate');
        
        // Set appropriate range based on unit
        switch(unit) {
            case 'H/s':
                slider.attr('min', 1);
                slider.attr('max', 1000000);
                slider.val(1000000);
                hashRateInput.val(1000000);
                break;
            case 'KH/s':
                slider.attr('min', 1);
                slider.attr('max', 1000000);
                slider.val(1000);
                hashRateInput.val(1000);
                break;
            case 'MH/s':
                slider.attr('min', 1);
                slider.attr('max', 100000);
                slider.val(1000);
                hashRateInput.val(1000);
                break;
            case 'GH/s':
                slider.attr('min', 1);
                slider.attr('max', 10000);
                slider.val(1000);
                hashRateInput.val(1000);
                break;
            case 'TH/s':
                slider.attr('min', 1);
                slider.attr('max', 1000);
                slider.val(100);
                hashRateInput.val(100);
                break;
            case 'PH/s':
                slider.attr('min', 0.1);
                slider.attr('max', 100);
                slider.val(1);
                hashRateInput.val(1);
                break;
        }
        
        // Update slider labels
        const minLabel = slider.siblings('div').find('small').first();
        const maxLabel = slider.siblings('div').find('small').last();
        
        minLabel.text(slider.attr('min') + ' ' + unit);
        maxLabel.text(slider.attr('max') + ' ' + unit);
    }
    
    /**
     * Update currency label based on selected display currency
     */
    function updateCurrencyLabel() {
        $('#currency-label').text(displayCurrency.toUpperCase());
    }
    
    /**
     * Fetch Bitcoin network data from API
     */
    function fetchBitcoinNetworkData() {
        // Show loading indicator
        $('#api-loading-indicator').show();
        
        // Fetch Bitcoin network data
        ApiService.getBitcoinNetworkInfo()
            .then(data => {
                bitcoinNetworkData = data;
                
                // Update UI with network data
                updateNetworkDataUI(data);
                
                // Calculate mining profitability
                calculateMiningProfitability();
                
                // Hide loading indicator
                $('#api-loading-indicator').hide();
            })
            .catch(error => {
                console.error('Error fetching Bitcoin network data:', error);
                
                // Show error message
                alert('Error fetching Bitcoin network data. Please try again later.');
                
                // Hide loading indicator
                $('#api-loading-indicator').hide();
            });
    }
    
    /**
     * Update network data UI elements
     * @param {object} data - Bitcoin network data
     */
    function updateNetworkDataUI(data) {
        // Format price with currency symbol
        $('#btc-price').text(CalculationsUtil.formatCurrency(data.price, 'usd'));
        
        // Format difficulty with thousands separators
        $('#network-difficulty').text(data.difficulty.toLocaleString());
        
        // Format network hash rate
        $('#network-hashrate').text(formatHashRate(data.hashrate, 'TH/s'));
        
        // Format block reward
        $('#block-reward').text(data.block_reward.toFixed(2) + ' BTC');
    }
    
    /**
     * Format hash rate with appropriate unit
     * @param {number} hashRate - Hash rate value
     * @param {string} unit - Hash rate unit
     * @returns {string} - Formatted hash rate string
     */
    function formatHashRate(hashRate, unit) {
        return hashRate.toLocaleString() + ' ' + unit;
    }
    
    /**
     * Calculate mining profitability
     */
    function calculateMiningProfitability() {
        // Check if network data is available
        if (!bitcoinNetworkData) {
            console.warn('Bitcoin network data not available');
            return;
        }
        
        // Get input values
        const hashRate = parseFloat($('#hash-rate').val());
        const hashRateUnit = $('#hash-rate-unit').val();
        const powerConsumption = parseFloat($('#power-consumption').val());
        const electricityCost = parseFloat($('#electricity-cost').val());
        const poolFee = parseFloat($('#pool-fee').val()) / 100; // Convert percentage to decimal
        
        // Convert hash rate to H/s for calculation
        const hashRateInHs = CalculationsUtil.convertHashRate(hashRate, hashRateUnit, 'H/s');
        
        // Calculate mining profitability
        const profitability = CalculationsUtil.calculateMiningProfitability(
            hashRateInHs,
            powerConsumption,
            electricityCost,
            poolFee,
            bitcoinNetworkData
        );
        
        // Update UI with profitability data
        updateProfitabilityUI(profitability);
    }
    
    /**
     * Update profitability UI elements
     * @param {object} profitability - Mining profitability data
     */
    function updateProfitabilityUI(profitability) {
        // Daily values
        $('#daily-btc').text(profitability.rewards.daily.btc.toFixed(8) + ' BTC');
        $('#daily-revenue').text(CalculationsUtil.formatCurrency(profitability.rewards.daily.usd, 'usd'));
        $('#daily-cost').text(CalculationsUtil.formatCurrency(profitability.costs.daily, 'usd'));
        
        // Monthly values
        $('#monthly-btc').text(profitability.rewards.monthly.btc.toFixed(8) + ' BTC');
        $('#monthly-revenue').text(CalculationsUtil.formatCurrency(profitability.rewards.monthly.usd, 'usd'));
        $('#monthly-cost').text(CalculationsUtil.formatCurrency(profitability.costs.monthly, 'usd'));
        
        // Yearly values
        $('#yearly-btc').text(profitability.rewards.yearly.btc.toFixed(8) + ' BTC');
        $('#yearly-revenue').text(CalculationsUtil.formatCurrency(profitability.rewards.yearly.usd, 'usd'));
        $('#yearly-cost').text(CalculationsUtil.formatCurrency(profitability.costs.yearly, 'usd'));
        
        // Update profit display based on selected currency
        updateProfitabilityDisplay(profitability);
    }
    
    /**
     * Update profitability display based on selected currency
     * @param {object} profitability - Mining profitability data (optional, uses cached data if not provided)
     */
    function updateProfitabilityDisplay(profitability) {
        // Use provided profitability data or calculate new
        if (!profitability) {
            calculateMiningProfitability();
            return;
        }
        
        // Display profits in selected currency
        if (displayCurrency === 'btc') {
            $('#daily-profit').text(profitability.profits.daily.btc.toFixed(8) + ' BTC');
            $('#monthly-profit').text(profitability.profits.monthly.btc.toFixed(8) + ' BTC');
            $('#yearly-profit').text(profitability.profits.yearly.btc.toFixed(8) + ' BTC');
        } else {
            $('#daily-profit').text(CalculationsUtil.formatCurrency(profitability.profits.daily.usd, 'usd'));
            $('#monthly-profit').text(CalculationsUtil.formatCurrency(profitability.profits.monthly.usd, 'usd'));
            $('#yearly-profit').text(CalculationsUtil.formatCurrency(profitability.profits.yearly.usd, 'usd'));
        }
        
        // Add color coding for profits/losses
        colorCodeProfits();
    }
    
    /**
     * Color code profit values (green for profit, red for loss)
     */
    function colorCodeProfits() {
        $('.result-value[id$="-profit"]').each(function() {
            const value = $(this).text();
            
            if (displayCurrency === 'btc') {
                // Check if BTC value is positive or negative
                const btcValue = parseFloat(value.replace(' BTC', ''));
                $(this).removeClass('text-success text-danger');
                $(this).addClass(btcValue >= 0 ? 'text-success' : 'text-danger');
            } else {
                // Check if USD value is positive or negative
                const usdValue = parseFloat(value.replace('$', '').replace(',', ''));
                $(this).removeClass('text-success text-danger');
                $(this).addClass(usdValue >= 0 ? 'text-success' : 'text-danger');
            }
        });
    }
    
    /**
     * Debounce calculation to prevent excessive updates
     */
    function debounceCalculation() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            calculateMiningProfitability();
            saveSettings();
        }, 300);
    }
    
    /**
     * Save current settings to localStorage
     */
    function saveSettings() {
        const settings = {
            hashRate: parseFloat($('#hash-rate').val()),
            hashRateUnit: $('#hash-rate-unit').val(),
            powerConsumption: parseFloat($('#power-consumption').val()),
            electricityCost: parseFloat($('#electricity-cost').val()),
            poolFee: parseFloat($('#pool-fee').val()) / 100, // Convert percentage to decimal
            displayCurrency: displayCurrency
        };
        
        StorageUtil.saveMiningSettings(settings);
    }
    
    /**
     * Save current calculation to history
     */
    function saveMiningCalculation() {
        // Get current values
        const hashRate = parseFloat($('#hash-rate').val());
        const hashRateUnit = $('#hash-rate-unit').val();
        const powerConsumption = parseFloat($('#power-consumption').val());
        const electricityCost = parseFloat($('#electricity-cost').val());
        const poolFee = parseFloat($('#pool-fee').val()) / 100;
        
        // Convert hash rate to H/s for calculation
        const hashRateInHs = CalculationsUtil.convertHashRate(hashRate, hashRateUnit, 'H/s');
        
        // Calculate mining profitability
        const profitability = CalculationsUtil.calculateMiningProfitability(
            hashRateInHs,
            powerConsumption,
            electricityCost,
            poolFee,
            bitcoinNetworkData
        );
        
        // Create calculation object
        const calculation = {
            hashRate: hashRate,
            hashRateUnit: hashRateUnit,
            powerConsumption: powerConsumption,
            electricityCost: electricityCost,
            poolFee: poolFee,
            bitcoinPrice: bitcoinNetworkData.price,
            networkDifficulty: bitcoinNetworkData.difficulty,
            networkHashrate: bitcoinNetworkData.hashrate,
            blockReward: bitcoinNetworkData.block_reward,
            profitability: profitability
        };
        
        // Save to history
        StorageUtil.saveRecentCalculation('mining', calculation);
        
        // Show success message
        alert('Calculation saved successfully!');
    }
    
    /**
     * Reset calculator to default values
     */
    function resetCalculator() {
        // Set default values
        $('#hash-rate').val(100);
        $('#hash-rate-slider').val(100);
        $('#hash-rate-unit').val('TH/s');
        $('#power-consumption').val(3500);
        $('#power-consumption-slider').val(3500);
        $('#electricity-cost').val(0.12);
        $('#electricity-cost-slider').val(0.12);
(Content truncated due to size limit. Use line ranges to read in chunks)