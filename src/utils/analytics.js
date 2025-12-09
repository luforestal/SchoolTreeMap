// Google Analytics utility functions

/**
 * Initialize Google Analytics
 * @param {string} measurementId - Your Google Analytics measurement ID (G-XXXXXXXXXX)
 */
export const initializeAnalytics = (measurementId) => {
  if (!measurementId) {
    console.warn('Google Analytics measurement ID not provided');
    return;
  }

  // Check if GA script is already loaded
  if (window.gtag) {
    console.log('Google Analytics already initialized');
    return;
  }

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', measurementId, {
    anonymize_ip: true, // Anonymize IP addresses for privacy
    cookie_flags: 'SameSite=None;Secure',
  });

  console.log('Google Analytics initialized');
};

/**
 * Track a custom event
 * @param {string} eventName - Name of the event
 * @param {object} eventParams - Additional parameters for the event
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

/**
 * Track a page view
 * @param {string} pageTitle - Title of the page
 * @param {string} pagePath - Path of the page
 */
export const trackPageView = (pageTitle, pagePath) => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageTitle,
      page_path: pagePath,
    });
  }
};

/**
 * Check if analytics is enabled (user has consented)
 */
export const isAnalyticsEnabled = () => {
  return localStorage.getItem('cookieConsent') === 'accepted';
};
