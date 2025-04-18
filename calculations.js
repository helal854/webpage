/**
 * Calculations Utility for Cryptocurrency Platform
 * Handles all mathematical calculations for investment and mining
 */

const CalculationsUtil = (function() {
    /**
     * Calculate compound interest for investment
     * @param {number} principal - Initial investment amount
     * @param {number} rate - Annual interest rate (as decimal, e.g., 0.05 for 5%)
     * @param {number} time - Time period in years
     * @param {number} compoundFrequency - Number of times interest is compounded per year
     * @returns {object} - Object containing final amount and interest earned
     */
    function calculateCompoundInterest(principal, rate, time, compoundFrequency = 12) {
        // A = P(1 + r/n)^(nt)
        const n = compoundFrequency;
        const t = time;
        const r = rate;
        const P = principal;
        
        const finalAmount = P * Math.pow(1 + r/n, n*t);
        const interestEarned = finalAmount - P;
        
        return {
            principal: P,
            finalAmount: finalAmount,
            interestEarned: interestEarned,
            growthRate: rate
        };
    }
    
    /**
     * Generate compound interest data for chart
     * @param {number} principal - Initial investment amount
     * @param {number} rate - Annual interest rate (as decimal)
     * @param {number} years - Number of years
     * @param {number} compoundFrequency - Compounding frequency per year
     * @returns {Array} - Array of data points for charting
     */
    function generateCompoundInterestChartData(principal, rate, years, compoundFrequency = 12) {
        const dataPoints = [];
        const intervals = years * 12; // Monthly data points
        
        for (let i = 0; i <= intervals; i++) {
            const timeInYears = i / 12;
            const result = calculateCompoundInterest(principal, rate, timeInYears, compoundFrequency);
            
            dataPoints.push({
                x: timeInYears,
                y: result.finalAmount
            });
        }
        
        return dataPoints;
    }
    
    /**
     * Convert hash rate between different units
     * @param {number} hashRate - Hash rate value
     * @param {string} fromUnit - Source unit (H/s, KH/s, MH/s, GH/s, TH/s, PH/s)
     * @param {string} toUnit - Target unit (H/s, KH/s, MH/s, GH/s, TH/s, PH/s)
     * @returns {number} - Converted hash rate
     */
    function convertHashRate(hashRate, fromUnit, toUnit) {
        const units = {
            'H/s': 1,
            'KH/s': 1e3,
            'MH/s': 1e6,
            'GH/s': 1e9,
            'TH/s': 1e12,
            'PH/s': 1e15
        };
        
        // Convert to H/s first, then to target unit
        const hashRateInHs = hashRate * units[fromUnit];
        return hashRateInHs / units[toUnit];
    }
    
    /**
     * Calculate Bitcoin mining profitability
     * @param {number} hashRate - Hash rate in H/s
     * @param {number} power - Power consumption in watts
     * @param {number} electricityCost - Electricity cost per kWh
     * @param {number} poolFee - Pool fee as decimal (e.g., 0.01 for 1%)
     * @param {object} networkInfo - Bitcoin network information
     * @returns {object} - Mining profitability data
     */
    function calculateMiningProfitability(hashRate, power, electricityCost, poolFee, networkInfo) {
        // Constants
        const SECONDS_IN_DAY = 86400;
        const DAYS_IN_MONTH = 30.44;
        const DAYS_IN_YEAR = 365.25;
        
        // Calculate daily Bitcoin reward
        // Formula: (hashRate / networkHashrate) * blockReward * blocksPerDay
        const blocksPerDay = SECONDS_IN_DAY / networkInfo.block_time;
        const networkHashrateInHs = networkInfo.hashrate * 1e12; // Convert from TH/s to H/s
        const dailyBtcReward = (hashRate / networkHashrateInHs) * networkInfo.block_reward * blocksPerDay;
        
        // Apply pool fee
        const dailyBtcRewardAfterFee = dailyBtcReward * (1 - poolFee);
        
        // Calculate electricity cost
        const dailyPowerConsumptionKwh = (power / 1000) * 24; // kWh per day
        const dailyElectricityCost = dailyPowerConsumptionKwh * electricityCost;
        
        // Calculate profit in BTC and USD
        const dailyProfitUsd = (dailyBtcRewardAfterFee * networkInfo.price) - dailyElectricityCost;
        const dailyProfitBtc = dailyBtcRewardAfterFee - (dailyElectricityCost / networkInfo.price);
        
        // Calculate monthly and yearly values
        const monthlyBtcReward = dailyBtcRewardAfterFee * DAYS_IN_MONTH;
        const yearlyBtcReward = dailyBtcRewardAfterFee * DAYS_IN_YEAR;
        
        const monthlyElectricityCost = dailyElectricityCost * DAYS_IN_MONTH;
        const yearlyElectricityCost = dailyElectricityCost * DAYS_IN_YEAR;
        
        const monthlyProfitUsd = dailyProfitUsd * DAYS_IN_MONTH;
        const yearlyProfitUsd = dailyProfitUsd * DAYS_IN_YEAR;
        
        const monthlyProfitBtc = dailyProfitBtc * DAYS_IN_MONTH;
        const yearlyProfitBtc = dailyProfitBtc * DAYS_IN_YEAR;
        
        // Return comprehensive result object
        return {
            rewards: {
                daily: {
                    btc: dailyBtcRewardAfterFee,
                    usd: dailyBtcRewardAfterFee * networkInfo.price
                },
                monthly: {
                    btc: monthlyBtcReward,
                    usd: monthlyBtcReward * networkInfo.price
                },
                yearly: {
                    btc: yearlyBtcReward,
                    usd: yearlyBtcReward * networkInfo.price
                }
            },
            costs: {
                daily: dailyElectricityCost,
                monthly: monthlyElectricityCost,
                yearly: yearlyElectricityCost
            },
            profits: {
                daily: {
                    btc: dailyProfitBtc,
                    usd: dailyProfitUsd
                },
                monthly: {
                    btc: monthlyProfitBtc,
                    usd: monthlyProfitUsd
                },
                yearly: {
                    btc: yearlyProfitBtc,
                    usd: yearlyProfitUsd
                }
            },
            breakEven: {
                days: dailyProfitUsd > 0 ? 0 : Infinity // Simple break-even calculation
            }
        };
    }
    
    /**
     * Format currency value
     * @param {number} value - Value to format
     * @param {string} currency - Currency code (e.g., 'usd', 'btc')
     * @param {number} decimals - Number of decimal places
     * @returns {string} - Formatted currency string
     */
    function formatCurrency(value, currency = 'usd', decimals = 2) {
        if (currency.toLowerCase() === 'btc') {
            // Format BTC with more decimal places
            return value.toFixed(8) + ' BTC';
        } else {
            // Format fiat currencies
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency.toUpperCase(),
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }).format(value);
        }
    }
    
    // Public API
    return {
        calculateCompoundInterest,
        generateCompoundInterestChartData,
        convertHashRate,
        calculateMiningProfitability,
        formatCurrency
    };
})();
