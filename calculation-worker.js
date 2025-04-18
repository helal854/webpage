/**
 * Web Worker for heavy calculations
 * Offloads intensive calculations from the main thread
 */

// Handle messages from main thread
self.onmessage = function(e) {
    const data = e.data;
    
    switch(data.type) {
        case 'compound-interest':
            const result = calculateCompoundInterest(
                data.principal,
                data.rate,
                data.time,
                data.compoundFrequency
            );
            self.postMessage({
                type: 'compound-interest-result',
                result: result
            });
            break;
            
        case 'chart-data':
            const chartData = generateCompoundInterestChartData(
                data.principal,
                data.rate,
                data.years,
                data.compoundFrequency
            );
            self.postMessage({
                type: 'chart-data-result',
                data: chartData
            });
            break;
            
        case 'mining-profitability':
            // Will be implemented later
            break;
    }
};

/**
 * Calculate compound interest
 * @param {number} principal - Initial investment amount
 * @param {number} rate - Annual interest rate (as decimal)
 * @param {number} time - Time period in years
 * @param {number} compoundFrequency - Number of times interest is compounded per year
 * @returns {object} - Object containing final amount and interest earned
 */
function calculateCompoundInterest(principal, rate, time, compoundFrequency = 12) {
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
