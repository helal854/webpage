/**
 * API Service for Cryptocurrency Platform
 * Handles all API calls to CoinGecko and caching mechanisms
 */

const ApiService = (function() {
    // Base URL for CoinGecko API
    const API_BASE_URL = 'https://api.coingecko.com/api/v3';
    
    // Cache duration in milliseconds (5 minutes)
    const CACHE_DURATION = 5 * 60 * 1000;
    
    // Cache object to store API responses
    const cache = {};
    
    /**
     * Get current price for a cryptocurrency
     * @param {string} coinId - Coin ID in CoinGecko format (e.g., 'bitcoin', 'ethereum')
     * @param {string} currency - Currency to convert to (e.g., 'usd', 'eur')
     * @returns {Promise} - Promise resolving to price data
     */
    async function getCoinPrice(coinId, currency = 'usd') {
        const endpoint = `/simple/price?ids=${coinId}&vs_currencies=${currency}`;
        return fetchFromApi(endpoint);
    }
    
    /**
     * Get detailed information about a cryptocurrency
     * @param {string} coinId - Coin ID in CoinGecko format
     * @returns {Promise} - Promise resolving to coin data
     */
    async function getCoinData(coinId) {
        const endpoint = `/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`;
        return fetchFromApi(endpoint);
    }
    
    /**
     * Get list of available coins
     * @returns {Promise} - Promise resolving to list of coins
     */
    async function getCoinList() {
        const endpoint = '/coins/list';
        return fetchFromApi(endpoint);
    }
    
    /**
     * Get market data for top cryptocurrencies
     * @param {string} currency - Currency to convert to (e.g., 'usd', 'eur')
     * @param {number} perPage - Number of results per page
     * @param {number} page - Page number
     * @returns {Promise} - Promise resolving to market data
     */
    async function getMarketData(currency = 'usd', perPage = 100, page = 1) {
        const endpoint = `/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`;
        return fetchFromApi(endpoint);
    }
    
    /**
     * Get historical market data for a cryptocurrency
     * @param {string} coinId - Coin ID in CoinGecko format
     * @param {string} currency - Currency to convert to
     * @param {number} days - Number of days of data to retrieve
     * @returns {Promise} - Promise resolving to historical data
     */
    async function getHistoricalData(coinId, currency = 'usd', days = 30) {
        const endpoint = `/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`;
        return fetchFromApi(endpoint);
    }
    
    /**
     * Get Bitcoin network information (for mining calculator)
     * @returns {Promise} - Promise resolving to network data
     */
    async function getBitcoinNetworkInfo() {
        // First get the Bitcoin data which includes the current price
        const bitcoinData = await getCoinData('bitcoin');
        
        // Then make a custom object with the network information needed for mining calculations
        return {
            price: bitcoinData.market_data.current_price.usd,
            market_cap: bitcoinData.market_data.market_cap.usd,
            total_volume: bitcoinData.market_data.total_volume.usd,
            hashrate: 350000000, // Example value in TH/s, would need a better source
            difficulty: 70000000000000, // Example value, would need a better source
            block_reward: 6.25, // Current block reward as of 2024
            block_time: 600 // Average block time in seconds (10 minutes)
        };
    }
    
    /**
     * Fetch data from API with caching
     * @param {string} endpoint - API endpoint
     * @returns {Promise} - Promise resolving to API data
     */
    async function fetchFromApi(endpoint) {
        const url = API_BASE_URL + endpoint;
        
        // Check if we have a valid cached response
        if (cache[url] && cache[url].timestamp > Date.now() - CACHE_DURATION) {
            return cache[url].data;
        }
        
        // Show loading indicator
        $('#api-loading-indicator').show();
        
        try {
            // Fetch from API
            const response = await fetch(url);
            
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            // Parse JSON response
            const data = await response.json();
            
            // Cache the response
            cache[url] = {
                timestamp: Date.now(),
                data: data
            };
            
            return data;
        } catch (error) {
            console.error('API fetch error:', error);
            throw error;
        } finally {
            // Hide loading indicator
            $('#api-loading-indicator').hide();
        }
    }
    
    /**
     * Clear the API cache
     */
    function clearCache() {
        Object.keys(cache).forEach(key => delete cache[key]);
    }
    
    // Public API
    return {
        getCoinPrice,
        getCoinData,
        getCoinList,
        getMarketData,
        getHistoricalData,
        getBitcoinNetworkInfo,
        clearCache
    };
})();
