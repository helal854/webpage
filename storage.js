/**
 * Storage Utility for Cryptocurrency Platform
 * Handles localStorage operations for saving user preferences and data
 */

const StorageUtil = (function() {
    // Storage keys
    const KEYS = {
        THEME: 'crypto_platform_theme',
        CURRENCY: 'crypto_platform_currency',
        INVESTMENT_SETTINGS: 'crypto_platform_investment_settings',
        MINING_SETTINGS: 'crypto_platform_mining_settings',
        REPORT_FILTERS: 'crypto_platform_report_filters',
        EXPORT_SETTINGS: 'crypto_platform_export_settings',
        RECENT_CALCULATIONS: 'crypto_platform_recent_calculations'
    };
    
    /**
     * Check if localStorage is available
     * @returns {boolean} - Whether localStorage is available
     */
    function isAvailable() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to store (will be JSON stringified)
     * @returns {boolean} - Whether operation was successful
     */
    function saveData(key, data) {
        if (!isAvailable()) return false;
        
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    }
    
    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} - Parsed data or default value
     */
    function loadData(key, defaultValue = null) {
        if (!isAvailable()) return defaultValue;
        
        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData === null) return defaultValue;
            return JSON.parse(serializedData);
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return defaultValue;
        }
    }
    
    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} - Whether operation was successful
     */
    function removeData(key) {
        if (!isAvailable()) return false;
        
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    }
    
    /**
     * Clear all application data from localStorage
     * @returns {boolean} - Whether operation was successful
     */
    function clearAllData() {
        if (!isAvailable()) return false;
        
        try {
            Object.values(KEYS).forEach(key => localStorage.removeItem(key));
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
    
    /**
     * Save user theme preference
     * @param {string} theme - Theme name
     * @returns {boolean} - Whether operation was successful
     */
    function saveTheme(theme) {
        return saveData(KEYS.THEME, theme);
    }
    
    /**
     * Load user theme preference
     * @returns {string} - Theme name or default
     */
    function loadTheme() {
        return loadData(KEYS.THEME, 'default');
    }
    
    /**
     * Save preferred currency
     * @param {string} currency - Currency code
     * @returns {boolean} - Whether operation was successful
     */
    function saveCurrency(currency) {
        return saveData(KEYS.CURRENCY, currency);
    }
    
    /**
     * Load preferred currency
     * @returns {string} - Currency code or default
     */
    function loadCurrency() {
        return loadData(KEYS.CURRENCY, 'usd');
    }
    
    /**
     * Save investment calculator settings
     * @param {object} settings - Investment calculator settings
     * @returns {boolean} - Whether operation was successful
     */
    function saveInvestmentSettings(settings) {
        return saveData(KEYS.INVESTMENT_SETTINGS, settings);
    }
    
    /**
     * Load investment calculator settings
     * @returns {object} - Investment calculator settings or default
     */
    function loadInvestmentSettings() {
        return loadData(KEYS.INVESTMENT_SETTINGS, {
            initialInvestment: 1000,
            interestRate: 0.05,
            years: 5,
            compoundFrequency: 12,
            currency: 'usd',
            coin: 'bitcoin'
        });
    }
    
    /**
     * Save mining calculator settings
     * @param {object} settings - Mining calculator settings
     * @returns {boolean} - Whether operation was successful
     */
    function saveMiningSettings(settings) {
        return saveData(KEYS.MINING_SETTINGS, settings);
    }
    
    /**
     * Load mining calculator settings
     * @returns {object} - Mining calculator settings or default
     */
    function loadMiningSettings() {
        return loadData(KEYS.MINING_SETTINGS, {
            hashRate: 100,
            hashRateUnit: 'TH/s',
            powerConsumption: 3500,
            electricityCost: 0.12,
            poolFee: 0.01,
            displayCurrency: 'usd'
        });
    }
    
    /**
     * Save report filters
     * @param {object} filters - Report filters
     * @returns {boolean} - Whether operation was successful
     */
    function saveReportFilters(filters) {
        return saveData(KEYS.REPORT_FILTERS, filters);
    }
    
    /**
     * Load report filters
     * @returns {object} - Report filters or default
     */
    function loadReportFilters() {
        return loadData(KEYS.REPORT_FILTERS, {
            dateRange: 'month',
            currency: 'all',
            profitRange: [0, Infinity]
        });
    }
    
    /**
     * Save PDF export settings
     * @param {object} settings - Export settings
     * @returns {boolean} - Whether operation was successful
     */
    function saveExportSettings(settings) {
        return saveData(KEYS.EXPORT_SETTINGS, settings);
    }
    
    /**
     * Load PDF export settings
     * @returns {object} - Export settings or default
     */
    function loadExportSettings() {
        return loadData(KEYS.EXPORT_SETTINGS, {
            brandingEnabled: true,
            logoUrl: '',
            companyName: 'Crypto Platform',
            language: 'en'
        });
    }
    
    /**
     * Save recent calculation to history
     * @param {string} type - Calculation type ('investment' or 'mining')
     * @param {object} calculation - Calculation data
     * @returns {boolean} - Whether operation was successful
     */
    function saveRecentCalculation(type, calculation) {
        const recentCalculations = loadRecentCalculations();
        
        // Add timestamp
        calculation.timestamp = Date.now();
        calculation.type = type;
        
        // Add to beginning of array, limit to 10 items
        recentCalculations.unshift(calculation);
        if (recentCalculations.length > 10) {
            recentCalculations.pop();
        }
        
        return saveData(KEYS.RECENT_CALCULATIONS, recentCalculations);
    }
    
    /**
     * Load recent calculations
     * @returns {Array} - Recent calculations or empty array
     */
    function loadRecentCalculations() {
        return loadData(KEYS.RECENT_CALCULATIONS, []);
    }
    
    // Public API
    return {
        isAvailable,
        saveTheme,
        loadTheme,
        saveCurrency,
        loadCurrency,
        saveInvestmentSettings,
        loadInvestmentSettings,
        saveMiningSettings,
        loadMiningSettings,
        saveReportFilters,
        loadReportFilters,
        saveExportSettings,
        loadExportSettings,
        saveRecentCalculation,
        loadRecentCalculations,
        clearAllData
    };
})();
