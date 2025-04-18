/**
 * Main Application Script with Responsive Enhancements
 * Handles page navigation, component loading, global app state, and responsive behavior
 */

$(document).ready(function() {
    // Global app state
    const appState = {
        currentPage: 'home',
        isLoading: false,
        selectedCurrency: StorageUtil.loadCurrency(),
        theme: StorageUtil.loadTheme(),
        isMobile: window.innerWidth < 768
    };
    
    // Initialize loading indicator
    $('body').append('<div id="api-loading-indicator" class="spinner-container" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:rgba(255,255,255,0.8);width:100%;height:100%;"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>');
    
    // Add skip to content link for accessibility
    $('body').prepend('<a href="#content-area" class="skip-to-content">Skip to content</a>');
    
    // Apply saved theme if available
    applyTheme(appState.theme);
    
    // Navigation event handlers
    $('#nav-investment, #btn-investment').on('click', function(e) {
        e.preventDefault();
        loadPage('investment-calculator');
    });
    
    $('#nav-mining, #btn-mining').on('click', function(e) {
        e.preventDefault();
        loadPage('mining-calculator');
    });
    
    $('#nav-reports, #btn-reports').on('click', function(e) {
        e.preventDefault();
        loadPage('reports');
    });
    
    $('#nav-export, #btn-export').on('click', function(e) {
        e.preventDefault();
        loadPage('pdf-export');
    });
    
    // Home link (logo)
    $('.navbar-brand').on('click', function(e) {
        e.preventDefault();
        loadPage('home');
    });
    
    // Handle responsive behavior
    $(window).on('resize', function() {
        const isMobile = window.innerWidth < 768;
        
        // Update state if changed
        if (isMobile !== appState.isMobile) {
            appState.isMobile = isMobile;
            handleResponsiveChanges();
        }
    });
    
    /**
     * Handle responsive layout changes
     */
    function handleResponsiveChanges() {
        // Collapse navbar on mobile after click
        if (appState.isMobile) {
            $('.navbar-nav .nav-link').on('click', function() {
                $('.navbar-collapse').collapse('hide');
            });
            
            // Adjust chart heights for mobile
            $('.chart-container').css('height', '250px');
        } else {
            // Reset chart heights for desktop
            $('.chart-container').css('height', '300px');
        }
        
        // Refresh any active charts
        if (window.reportChart) {
            window.reportChart.resize();
        }
    }
    
    /**
     * Load page content
     * @param {string} page - Page name to load
     */
    function loadPage(page) {
        // Don't reload the current page
        if (page === appState.currentPage) return;
        
        // Update state
        appState.currentPage = page;
        appState.isLoading = true;
        
        // Show loading indicator
        $('#api-loading-indicator').show();
        
        // Update active nav link
        $('.nav-link').removeClass('active');
        $(`#nav-${page}`).addClass('active');
        
        // Load page content
        if (page === 'home') {
            // Home page is already in index.html
            $('#content-area').html(`
                <div class="text-center py-5">
                    <h1>Welcome to Crypto Platform</h1>
                    <p class="lead">Your comprehensive cryptocurrency calculator hub</p>
                    <div class="row mt-5">
                        <div class="col-md-6 col-lg-3 mb-4">
                            <div class="card h-100">
                                <div class="card-body text-center">
                                    <h5 class="card-title">Investment Calculator</h5>
                                    <p class="card-text">Calculate projected returns using compound interest for cryptocurrencies.</p>
                                    <button class="btn btn-primary" id="btn-investment">Get Started</button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-3 mb-4">
                            <div class="card h-100">
                                <div class="card-body text-center">
                                    <h5 class="card-title">Mining Calculator</h5>
                                    <p class="card-text">Estimate mining profitability based on hash rate, electricity costs, and network difficulty.</p>
                                    <button class="btn btn-primary" id="btn-mining">Get Started</button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-3 mb-4">
                            <div class="card h-100">
                                <div class="card-body text-center">
                                    <h5 class="card-title">Interactive Reports</h5>
                                    <p class="card-text">Generate customizable reports with dynamic charts and filters.</p>
                                    <button class="btn btn-primary" id="btn-reports">Get Started</button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-3 mb-4">
                            <div class="card h-100">
                                <div class="card-body text-center">
                                    <h5 class="card-title">PDF Export</h5>
                                    <p class="card-text">Export reports to PDF with custom branding and interactive elements.</p>
                                    <button class="btn btn-primary" id="btn-export">Get Started</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            
            // Reattach event handlers for buttons
            $('#btn-investment').on('click', function() { loadPage('investment-calculator'); });
            $('#btn-mining').on('click', function() { loadPage('mining-calculator'); });
            $('#btn-reports').on('click', function() { loadPage('reports'); });
            $('#btn-export').on('click', function() { loadPage('pdf-export'); });
            
            appState.isLoading = false;
            $('#api-loading-indicator').hide();
        } else {
            // Load component HTML from pages directory
            $.ajax({
                url: `pages/${page}.html`,
                dataType: 'html',
                success: function(response) {
                    $('#content-area').html(response);
                    
                    // Initialize component
                    switch(page) {
                        case 'investment-calculator':
                            if (typeof InvestmentCalculator !== 'undefined') {
                                InvestmentCalculator.init();
                            }
                            break;
                        case 'mining-calculator':
                            if (typeof MiningCalculator !== 'undefined') {
                                MiningCalculator.init();
                            }
                            break;
                        case 'reports':
                            if (typeof ReportsComponent !== 'undefined') {
                                ReportsComponent.init();
                            }
                            break;
                        case 'pdf-export':
                            if (typeof PdfExportComponent !== 'undefined') {
                                PdfExportComponent.init();
                            }
                            break;
                    }
                    
                    // Apply responsive adjustments
                    handleResponsiveChanges();
                    
                    appState.isLoading = false;
                    $('#api-loading-indicator').hide();
                    
                    // Scroll to top when changing pages
                    window.scrollTo(0, 0);
                },
                error: function(xhr, status, error) {
                    console.error(`Error loading ${page}:`, error);
                    $('#content-area').html(`
                        <div class="alert alert-danger m-5" role="alert">
                            <h4 class="alert-heading">Error Loading Page</h4>
                            <p>There was a problem loading the requested page. Please try again later.</p>
                            <hr>
                            <p class="mb-0">Error details: ${error}</p>
                        </div>
                    `);
                    
                    appState.isLoading = false;
                    $('#api-loading-indicator').hide();
                }
            });
        }
    }
    
    /**
     * Apply theme to the application
     * @param {string} theme - Theme name
     */
    function applyTheme(theme) {
        // Remove any existing theme classes
        $('body').removeClass('theme-dark theme-light theme-blue');
        
        // Apply selected theme
        if (theme && theme !== 'default') {
            $('body').addClass(`theme-${theme}`);
            
            // Update loading indicator background for dark theme
            if (theme === 'dark') {
                $('#api-loading-indicator').css('background', 'rgba(0,0,0,0.8)');
                $('#api-loading-indicator .spinner-border').addClass('text-light');
            }
        }
        
        // Save theme preference
        StorageUtil.saveTheme(theme);
    }
    
    // Add theme toggle in navbar
    $('.navbar-nav').append(`
        <li class="nav-item dropdown ms-lg-3">
            <a class="nav-link dropdown-toggle" href="#" id="themeDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-palette"></i> Theme
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="themeDropdown">
                <li><a class="dropdown-item" href="#" data-theme="default">Light</a></li>
                <li><a class="dropdown-item" href="#" data-theme="dark">Dark</a></li>
                <li><a class="dropdown-item" href="#" data-theme="blue">Blue</a></li>
            </ul>
        </li>
    `);
    
    // Theme selection event handler
    $('.dropdown-item[data-theme]').on('click', function(e) {
        e.preventDefault();
        const theme = $(this).data('theme');
        applyTheme(theme);
    });
    
    // Expose global functions
    window.App = {
        loadPage: loadPage,
        applyTheme: applyTheme,
        getState: function() { return {...appState}; },
        setCurrency: function(currency) {
            appState.selectedCurrency = currency;
            StorageUtil.saveCurrency(currency);
        },
        isMobile: function() {
            return appState.isMobile;
        }
    };
    
    // Check if localStorage is available and show warning if not
    if (!StorageUtil.isAvailable()) {
        console.warn('localStorage is not available. User preferences will not be saved.');
        $('body').append(`
            <div class="alert alert-warning alert-dismissible fade show" role="alert" style="position:fixed;bottom:20px;right:20px;max-width:350px;z-index:9999;">
                <strong>Warning!</strong> Local storage is not available. Your preferences will not be saved.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `);
    }
    
    // Initialize Web Worker for heavy calculations if supported
    if (window.Worker) {
        try {
            window.calculationWorker = new Worker('assets/js/utils/workers/calculation-worker.js');
            console.log('Web Worker initialized for calculations');
        } catch (e) {
            console.warn('Failed to initialize Web Worker:', e);
        }
    }
    
    // Initial responsive adjustments
    handleResponsiveChanges();
});
