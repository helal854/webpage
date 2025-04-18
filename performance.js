/**
 * Performance Optimization Utilities
 * Provides lazy loading, debouncing, and other performance enhancements
 */

const PerformanceUtil = (function() {
    // Store references to lazy-loaded components
    const lazyComponents = {};
    
    // Store debounce timers
    const debounceTimers = {};
    
    /**
     * Lazy load a JavaScript component
     * @param {string} componentName - Name of the component to load
     * @param {Function} callback - Callback function to execute after loading
     */
    function lazyLoadComponent(componentName, callback) {
        // If component is already loaded, execute callback immediately
        if (lazyComponents[componentName]) {
            if (callback && typeof callback === 'function') {
                callback();
            }
            return;
        }
        
        // Show loading indicator
        $('#api-loading-indicator').show();
        
        // Determine script path based on component name
        let scriptPath = '';
        switch(componentName) {
            case 'investment-calculator':
                scriptPath = 'assets/js/components/investment-calculator.js';
                break;
            case 'mining-calculator':
                scriptPath = 'assets/js/components/mining-calculator.js';
                break;
            case 'reports':
                scriptPath = 'assets/js/components/reports.js';
                break;
            case 'pdf-export':
                scriptPath = 'assets/js/components/pdf-export.js';
                break;
            default:
                console.error(`Unknown component: ${componentName}`);
                $('#api-loading-indicator').hide();
                return;
        }
        
        // Create script element
        const script = document.createElement('script');
        script.src = scriptPath;
        script.async = true;
        
        // Set up load event
        script.onload = function() {
            console.log(`Component ${componentName} loaded successfully`);
            lazyComponents[componentName] = true;
            
            // Hide loading indicator
            $('#api-loading-indicator').hide();
            
            // Execute callback if provided
            if (callback && typeof callback === 'function') {
                callback();
            }
        };
        
        // Set up error event
        script.onerror = function() {
            console.error(`Failed to load component: ${componentName}`);
            $('#api-loading-indicator').hide();
        };
        
        // Append script to document
        document.body.appendChild(script);
    }
    
    /**
     * Debounce a function call
     * @param {string} id - Unique identifier for the debounce timer
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     */
    function debounce(id, func, delay = 300) {
        // Clear existing timer if any
        if (debounceTimers[id]) {
            clearTimeout(debounceTimers[id]);
        }
        
        // Set new timer
        debounceTimers[id] = setTimeout(function() {
            func();
            delete debounceTimers[id];
        }, delay);
    }
    
    /**
     * Throttle a function call
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in milliseconds
     * @returns {Function} - Throttled function
     */
    function throttle(func, limit = 300) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * Optimize image loading with lazy loading
     */
    function setupLazyImageLoading() {
        // Check if IntersectionObserver is supported
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                        }
                        
                        observer.unobserve(img);
                    }
                });
            });
            
            // Observe all images with data-src attribute
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            });
        }
    }
    
    /**
     * Cache API responses
     * @param {string} url - API URL
     * @param {object} data - Data to cache
     * @param {number} duration - Cache duration in milliseconds
     */
    function cacheApiResponse(url, data, duration = 5 * 60 * 1000) {
        const cache = {
            data: data,
            timestamp: Date.now(),
            expiry: Date.now() + duration
        };
        
        // Store in sessionStorage
        try {
            sessionStorage.setItem(`api_cache_${url}`, JSON.stringify(cache));
        } catch (e) {
            console.warn('Failed to cache API response:', e);
        }
    }
    
    /**
     * Get cached API response
     * @param {string} url - API URL
     * @returns {object|null} - Cached data or null if not found or expired
     */
    function getCachedApiResponse(url) {
        try {
            const cacheJson = sessionStorage.getItem(`api_cache_${url}`);
            if (!cacheJson) return null;
            
            const cache = JSON.parse(cacheJson);
            
            // Check if cache is expired
            if (cache.expiry < Date.now()) {
                sessionStorage.removeItem(`api_cache_${url}`);
                return null;
            }
            
            return cache.data;
        } catch (e) {
            console.warn('Failed to retrieve cached API response:', e);
            return null;
        }
    }
    
    /**
     * Initialize performance optimizations
     */
    function init() {
        // Set up lazy image loading
        setupLazyImageLoading();
        
        // Add event delegation for common events to reduce listeners
        setupEventDelegation();
        
        // Optimize scroll events
        optimizeScrollEvents();
    }
    
    /**
     * Set up event delegation for common events
     */
    function setupEventDelegation() {
        // Use event delegation for button clicks
        $(document).on('click', '.btn', function(e) {
            // Add ripple effect for touch feedback
            if ($(this).hasClass('btn-primary') || $(this).hasClass('btn-success')) {
                const ripple = $('<span class="ripple"></span>');
                const rippleContainer = $('<span class="ripple-container"></span>');
                
                rippleContainer.append(ripple);
                $(this).append(rippleContainer);
                
                const d = Math.max($(this).outerWidth(), $(this).outerHeight());
                ripple.css({
                    height: d,
                    width: d
                });
                
                const x = e.pageX - $(this).offset().left - ripple.width() / 2;
                const y = e.pageY - $(this).offset().top - ripple.height() / 2;
                
                ripple.css({
                    top: y + 'px',
                    left: x + 'px'
                }).addClass('animate');
                
                setTimeout(() => {
                    rippleContainer.remove();
                }, 600);
            }
        });
    }
    
    /**
     * Optimize scroll events
     */
    function optimizeScrollEvents() {
        // Use requestAnimationFrame for scroll events
        let ticking = false;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    // Handle scroll event
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    // Public API
    return {
        lazyLoadComponent,
        debounce,
        throttle,
        cacheApiResponse,
        getCachedApiResponse,
        init
    };
})();

// Initialize performance optimizations when DOM is ready
$(document).ready(function() {
    PerformanceUtil.init();
});
