/* Vercel Web Analytics initialization */
(function() {
  'use strict';
  
  // Vercel Analytics web vitals tracking script
  // This initializes the analytics tracking for page views and web vitals
  
  window.va = window.va || function () { 
    (window.vaq = window.vaq || []).push(arguments); 
  };
  
  // Load the Vercel Analytics script
  var script = document.createElement('script');
  script.src = '/_vercel/insights/script.js';
  script.defer = true;
  document.head.appendChild(script);
})();
