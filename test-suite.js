/**
 * Test Suite for Cryptocurrency Platform
 * Validates all features and functionality
 */

const TestSuite = (function() {
    // Test results
    const testResults = {
        passed: 0,
        failed: 0,
        total: 0,
        details: []
    };
    
    /**
     * Run all tests
     */
    function runAllTests() {
        console.log('Starting test suite...');
        
        // Reset test results
        testResults.passed = 0;
        testResults.failed = 0;
        testResults.total = 0;
        testResults.details = [];
        
        // Create test report container
        $('#content-area').html(`
            <div class="container">
                <h2>Cryptocurrency Platform Test Suite</h2>
                <p class="lead">Testing all features and functionality</p>
                
                <div class="progress mb-4">
                    <div class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                </div>
                
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">Test Results</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <h6>Total Tests</h6>
                                <p class="fs-4" id="total-tests">0</p>
                            </div>
                            <div class="col-md-4 text-center">
                                <h6>Passed</h6>
                                <p class="fs-4 text-success" id="passed-tests">0</p>
                            </div>
                            <div class="col-md-4 text-center">
                                <h6>Failed</h6>
                                <p class="fs-4 text-danger" id="failed-tests">0</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Test Details</h5>
                    </div>
                    <div class="card-body">
                        <div class="test-log" id="test-log">
                            <p class="text-muted">Running tests...</p>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4 text-center">
                    <button class="btn btn-primary" id="run-tests-again">Run Tests Again</button>
                    <button class="btn btn-success ms-2" id="export-test-report">Export Test Report</button>
                </div>
            </div>
        `);
        
        // Add event listeners
        $('#run-tests-again').on('click', runAllTests);
        $('#export-test-report').on('click', exportTestReport);
        
        // Run tests sequentially
        runTestSequence();
    }
    
    /**
     * Run test sequence
     */
    function runTestSequence() {
        const tests = [
            { name: 'API Service', func: testApiService },
            { name: 'Storage Utilities', func: testStorageUtils },
            { name: 'Calculation Utilities', func: testCalculationUtils },
            { name: 'Performance Utilities', func: testPerformanceUtils },
            { name: 'Investment Calculator', func: testInvestmentCalculator },
            { name: 'Mining Calculator', func: testMiningCalculator },
            { name: 'Reports Component', func: testReportsComponent },
            { name: 'PDF Export', func: testPdfExport },
            { name: 'Responsive Design', func: testResponsiveDesign },
            { name: 'Performance Metrics', func: testPerformanceMetrics }
        ];
        
        // Clear test log
        $('#test-log').empty();
        
        // Run tests with delay between each
        let currentTest = 0;
        
        function runNextTest() {
            if (currentTest < tests.length) {
                const test = tests[currentTest];
                logTestStart(test.name);
                
                // Update progress
                const progress = Math.round((currentTest / tests.length) * 100);
                $('.progress-bar').css('width', progress + '%').attr('aria-valuenow', progress).text(progress + '%');
                
                // Run test with timeout to prevent UI freezing
                setTimeout(() => {
                    try {
                        test.func();
                        currentTest++;
                        setTimeout(runNextTest, 500);
                    } catch (error) {
                        logTestError(test.name, error.message);
                        currentTest++;
                        setTimeout(runNextTest, 500);
                    }
                }, 100);
            } else {
                // All tests completed
                $('.progress-bar').css('width', '100%').attr('aria-valuenow', 100).text('100%');
                logTestComplete();
            }
        }
        
        // Start running tests
        runNextTest();
    }
    
    /**
     * Log test start
     * @param {string} testName - Name of the test
     */
    function logTestStart(testName) {
        $('#test-log').append(`
            <div class="test-item" id="test-${testName.replace(/\s+/g, '-').toLowerCase()}">
                <h5>${testName}</h5>
                <div class="test-details"></div>
            </div>
        `);
    }
    
    /**
     * Log test result
     * @param {string} testName - Name of the test
     * @param {string} message - Test message
     * @param {boolean} passed - Whether the test passed
     */
    function logTestResult(testName, message, passed) {
        const testItem = $(`#test-${testName.replace(/\s+/g, '-').toLowerCase()} .test-details`);
        const statusClass = passed ? 'text-success' : 'text-danger';
        const statusIcon = passed ? '✓' : '✗';
        
        testItem.append(`
            <div class="test-result">
                <span class="${statusClass}">${statusIcon}</span> ${message}
            </div>
        `);
        
        // Update test results
        testResults.total++;
        if (passed) {
            testResults.passed++;
        } else {
            testResults.failed++;
        }
        
        // Add to details
        testResults.details.push({
            name: testName,
            message: message,
            passed: passed
        });
        
        // Update counters
        $('#total-tests').text(testResults.total);
        $('#passed-tests').text(testResults.passed);
        $('#failed-tests').text(testResults.failed);
    }
    
    /**
     * Log test error
     * @param {string} testName - Name of the test
     * @param {string} error - Error message
     */
    function logTestError(testName, error) {
        const testItem = $(`#test-${testName.replace(/\s+/g, '-').toLowerCase()} .test-details`);
        
        testItem.append(`
            <div class="test-result">
                <span class="text-danger">✗</span> Test error: ${error}
            </div>
        `);
        
        // Update test results
        testResults.total++;
        testResults.failed++;
        
        // Add to details
        testResults.details.push({
            name: testName,
            message: `Test error: ${error}`,
            passed: false
        });
        
        // Update counters
        $('#total-tests').text(testResults.total);
        $('#passed-tests').text(testResults.passed);
        $('#failed-tests').text(testResults.failed);
    }
    
    /**
     * Log test completion
     */
    function logTestComplete() {
        $('#test-log').append(`
            <div class="test-summary mt-4">
                <h5>Test Summary</h5>
                <p>Total tests: ${testResults.total}</p>
                <p class="text-success">Passed: ${testResults.passed}</p>
                <p class="text-danger">Failed: ${testResults.failed}</p>
                <p>Pass rate: ${Math.round((testResults.passed / testResults.total) * 100)}%</p>
            </div>
        `);
    }
    
    /**
     * Export test report
     */
    function exportTestReport() {
        // Create PDF report
        const pdfDoc = new jspdf.jsPDF();
        
        // Add title
        pdfDoc.setFontSize(20);
        pdfDoc.text('Cryptocurrency Platform Test Report', 20, 20);
        
        // Add date
        pdfDoc.setFontSize(12);
        pdfDoc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
        
        // Add summary
        pdfDoc.setFontSize(16);
        pdfDoc.text('Test Summary', 20, 50);
        
        pdfDoc.setFontSize(12);
        pdfDoc.text(`Total tests: ${testResults.total}`, 20, 60);
        pdfDoc.text(`Passed: ${testResults.passed}`, 20, 70);
        pdfDoc.text(`Failed: ${testResults.failed}`, 20, 80);
        pdfDoc.text(`Pass rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`, 20, 90);
        
        // Add details
        pdfDoc.setFontSize(16);
        pdfDoc.text('Test Details', 20, 110);
        
        let yPos = 120;
        let currentPage = 1;
        
        testResults.details.forEach((detail, index) => {
            // Check if we need a new page
            if (yPos > 270) {
                pdfDoc.addPage();
                currentPage++;
                yPos = 20;
            }
            
            pdfDoc.setFontSize(12);
            pdfDoc.text(`${index + 1}. ${detail.name}`, 20, yPos);
            yPos += 10;
            
            pdfDoc.setFontSize(10);
            if (detail.passed) {
                pdfDoc.setTextColor(0, 128, 0); // Green for passed
            } else {
                pdfDoc.setTextColor(255, 0, 0); // Red for failed
            }
            pdfDoc.text(`${detail.passed ? '✓' : '✗'} ${detail.message}`, 30, yPos);
            pdfDoc.setTextColor(0, 0, 0); // Reset to black
            
            yPos += 15;
        });
        
        // Add page numbers
        for (let i = 1; i <= currentPage; i++) {
            pdfDoc.setPage(i);
            pdfDoc.setFontSize(10);
            pdfDoc.text(`Page ${i} of ${currentPage}`, pdfDoc.internal.pageSize.width - 40, pdfDoc.internal.pageSize.height - 10);
        }
        
        // Save PDF
        pdfDoc.save('crypto-platform-test-report.pdf');
    }
    
    /**
     * Test API Service
     */
    function testApiService() {
        // Test API service initialization
        logTestResult('API Service', 'API service initialization', typeof ApiService !== 'undefined');
        
        // Test cryptocurrency list endpoint
        ApiService.getCryptocurrencyList()
            .then(data => {
                logTestResult('API Service', 'Get cryptocurrency list', data && data.length > 0);
            })
            .catch(error => {
                logTestResult('API Service', 'Get cryptocurrency list', false);
            });
        
        // Test cryptocurrency price endpoint
        ApiService.getCryptocurrencyPrice('bitcoin', 'usd')
            .then(data => {
                logTestResult('API Service', 'Get cryptocurrency price', data && data.price > 0);
            })
            .catch(error => {
                logTestResult('API Service', 'Get cryptocurrency price', false);
            });
        
        // Test Bitcoin network data endpoint
        ApiService.getBitcoinNetworkData()
            .then(data => {
                logTestResult('API Service', 'Get Bitcoin network data', data && data.difficulty > 0);
            })
            .catch(error => {
                logTestResult('API Service', 'Get Bitcoin network data', false);
            });
    }
    
    /**
     * Test Storage Utilities
     */
    function testStorageUtils() {
        // Test storage availability
        logTestResult('Storage Utilities', 'Storage availability', StorageUtil.isAvailable());
        
        // Test saving and loading data
        const testData = { test: 'data', value: 123 };
        StorageUtil.saveData('test_key', testData);
        const loadedData = StorageUtil.loadData('test_key');
        logTestResult('Storage Utilities', 'Save and load data', 
            loadedData && loadedData.test === 'data' && loadedData.value === 123);
        
        // Test saving and loading currency
        StorageUtil.saveCurrency('eur');
        const currency = StorageUtil.loadCurrency();
        logTestResult('Storage Utilities', 'Save and load currency', currency === 'eur');
        
        // Test saving and loading theme
        StorageUtil.saveTheme('dark');
        const theme = StorageUtil.loadTheme();
        logTestResult('Storage Utilities', 'Save and load theme', theme === 'dark');
        
        // Test saving and loading calculation
        const testCalculation = { 
            type: 'investment', 
            initialInvestment: 1000, 
            interestRate: 0.05,
            years: 5,
            timestamp: Date.now()
        };
        StorageUtil.saveCalculation(testCalculation);
        const calculations = StorageUtil.loadRecentCalculations();
        logTestResult('Storage Utilities', 'Save and load calculations', 
            calculations && calculations.length > 0 && calculations.some(calc => calc.type === 'investment'));
        
        // Clean up test data
        localStorage.removeItem('test_key');
    }
    
    /**
     * Test Calculation Utilities
     */
    function testCalculationUtils() {
        // Test compound interest calculation
        const principal = 1000;
        const rate = 0.05;
        const time = 5;
        const compoundFrequency = 12;
        
        const expectedResult = principal * Math.pow(1 + (rate / compoundFrequency), compoundFrequency * time);
        const result = CalculationsUtil.calculateCompoundInterest(principal, rate, time, compoundFrequency);
        
        logTestResult('Calculation Utilities', 'Compound interest calculation', 
            Math.abs(result - expectedResult) < 0.01);
        
        // Test mining reward calculation
        const hashRate = 100; // TH/s
        const difficulty = 35000000000000;
        const blockReward = 6.25;
        
        const result2 = CalculationsUtil.calculateMiningReward(hashRate, difficulty, blockReward);
        logTestResult('Calculation Utilities', 'Mining reward calculation', result2 > 0);
        
        // Test currency formatting
        const formattedUSD = CalculationsUtil.formatCurrency(1234.56, 'usd');
        const formattedEUR = CalculationsUtil.formatCurrency(1234.56, 'eur');
        const formattedBTC = CalculationsUtil.formatCurrency(1.23456789, 'btc');
        
        logTestResult('Calculation Utilities', 'Currency formatting (USD)', formattedUSD === '$1,234.56');
        logTestResult('Calculation Utilities', 'Currency formatting (EUR)', formattedEUR === '€1,234.56');
        logTestResult('Calculation Utilities', 'Currency formatting (BTC)', formattedBTC === '1.23456789 BTC');
    }
    
    /**
     * Test Performance Utilities
     */
    function testPerformanceUtils() {
        // Test debounce function
        let counter = 0;
        const increment = () => counter++;
        const debouncedIncrement = () => PerformanceUtil.debounce('test', increment, 100);
        
        // Call multiple times rapidly
        debouncedIncrement();
        debouncedIncrement();
        debouncedIncrement();
        
        // Check after delay
        setTimeout(() => {
            logTestResult('Performance Utilities', 'Debounce function', counter === 1);
        }, 200);
        
        // Test throttle function
        let throttleCounter = 0;
        const incrementThrottle = () => throttleCounter++;
        const throttledIncrement = Perfo
(Content truncated due to size limit. Use line ranges to read in chunks)