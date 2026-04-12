// PWA Install Handler
// Manages the "Install App" button and handles beforeinstallprompt events
// Platform-specific instructions for Android Chrome, Android Firefox, iPhone Safari
// Arabic language support
// Comprehensive debugging logs
// Configured for GitHub Pages subdirectory: /belive/

(function() {
  'use strict';

  // DOM elements
  let installButton = null;
  let installButtonContainer = null;
  let deferredPrompt = null;
  let detectedPlatform = null;
  let detectedBrowser = null;
  let isArabic = false;

  // Platform and browser detection with logging
  function detectPlatformAndBrowser() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const platform = window.navigator.platform;
    
    // Detect platform
    if (/iphone|ipad|ipod/.test(userAgent)) {
      detectedPlatform = 'ios';
      console.log('[PWA] Platform detected: iOS');
    } else if (/android/.test(userAgent)) {
      detectedPlatform = 'android';
      console.log('[PWA] Platform detected: Android');
    } else if (/macintosh/.test(userAgent) && 'ontouchend' in document) {
      detectedPlatform = 'ipados';
      console.log('[PWA] Platform detected: iPadOS');
    } else if (/win/.test(platform)) {
      detectedPlatform = 'windows';
      console.log('[PWA] Platform detected: Windows');
    } else if (/mac/.test(platform)) {
      detectedPlatform = 'macos';
      console.log('[PWA] Platform detected: macOS');
    } else if (/linux/.test(platform)) {
      detectedPlatform = 'linux';
      console.log('[PWA] Platform detected: Linux');
    } else {
      detectedPlatform = 'unknown';
      console.log('[PWA] Platform detected: Unknown');
    }

    // Detect browser
    if (/chrome/.test(userAgent) && !/edge|edg|opr/.test(userAgent)) {
      detectedBrowser = 'chrome';
      console.log('[PWA] Browser detected: Chrome');
    } else if (/firefox/.test(userAgent)) {
      detectedBrowser = 'firefox';
      console.log('[PWA] Browser detected: Firefox');
    } else if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
      detectedBrowser = 'safari';
      console.log('[PWA] Browser detected: Safari');
    } else if (/edge|edg/.test(userAgent)) {
      detectedBrowser = 'edge';
      console.log('[PWA] Browser detected: Edge');
    } else if (/opr|opera/.test(userAgent)) {
      detectedBrowser = 'opera';
      console.log('[PWA] Browser detected: Opera');
    } else if (/samsung/.test(userAgent)) {
      detectedBrowser = 'samsung';
      console.log('[PWA] Browser detected: Samsung Internet');
    } else {
      detectedBrowser = 'unknown';
      console.log('[PWA] Browser detected: Unknown');
    }

    // Detect Arabic language
    isArabic = document.documentElement.lang === 'ar' || 
               document.documentElement.lang.startsWith('ar-') ||
               window.navigator.language.startsWith('ar');
    console.log('[PWA] Arabic language detected:', isArabic);
  }

  // Check if running on iOS
  function isIOS() {
    return detectedPlatform === 'ios' || detectedPlatform === 'ipados';
  }

  // Check if running on Android
  function isAndroid() {
    return detectedPlatform === 'android';
  }

  // Check if running on Android Firefox
  function isAndroidFirefox() {
    return isAndroid() && detectedBrowser === 'firefox';
  }

  // Check if running on Android Chrome or Samsung Internet
  function isAndroidChromeOrSamsung() {
    return isAndroid() && (detectedBrowser === 'chrome' || detectedBrowser === 'samsung');
  }

  // Check if app is already installed (running in standalone mode)
  function isAppInstalled() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = window.navigator.standalone === true;
    const installed = isStandalone || isIOSStandalone;
    console.log('[PWA] App installed check - standalone:', isStandalone, 'iOS standalone:', isIOSStandalone, 'result:', installed);
    return installed;
  }

  // Check if browser supports PWA installation
  function supportsPWAInstallation() {
    const supports = 'beforeinstallprompt' in window;
    console.log('[PWA] beforeinstallprompt supported:', supports);
    return supports;
  }

  // Get localized text based on language
  function getLocalizedText(key) {
    const texts = {
      installButton: isArabic ? 'تثبيت التطبيق' : 'Install App',
      installing: isArabic ? 'جاري التثبيت...' : 'Installing...',
      installFailed: isArabic ? 'فشل التثبيت' : 'Install Failed',
      notAvailable: isArabic ? 'غير متاح' : 'Not Available',
      modalTitle: isArabic ? 'كيفية التثبيت' : 'How to Install',
      modalClose: isArabic ? 'إغلاق' : 'Close',
      modalDescription: isArabic ? 'أضف هذا التطبيق إلى شاشتك الرئيسية للوصول السريع' : 'Add this app to your home screen for quick access',
      androidChromeTitle: isArabic ? 'تثبيت على أندرويد (كروم)' : 'Install on Android (Chrome)',
      androidChromeStep1: isArabic ? 'اضغط على قائمة المتصفح (⋮)' : 'Tap the browser menu (⋮)',
      androidChromeStep2: isArabic ? 'اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"' : 'Choose "Install app" or "Add to Home screen"',
      androidFirefoxTitle: isArabic ? 'تثبيت على أندرويد (فايرفوكس)' : 'Install on Android (Firefox)',
      androidFirefoxStep1: isArabic ? 'اضغط على قائمة المتصفح (⋮)' : 'Tap the browser menu (⋮)',
      androidFirefoxStep2: isArabic ? 'اختر "إضافة إلى الشاشة الرئيسية" إذا كان متاحاً' : 'Choose "Add to Home screen" if available',
      androidFirefoxNote: isArabic ? 'لأفضل تجربة تثبيت، افتح هذا الموقع في كروم' : 'For the best install experience, open this site in Chrome',
      iosTitle: isArabic ? 'تثبيت على iOS' : 'Install on iOS',
      iosStep1: isArabic ? 'اضغط على زر المشاركة' : 'Tap the Share button',
      iosStep2: isArabic ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Choose "Add to Home Screen"',
      iosStep3: isArabic ? 'اضغط "إضافة" في الزاوية العلوية' : 'Tap "Add" in the top right corner',
      iosNote: isArabic ? 'سيظهر التطبيق على شاشتك الرئيسية مثل التطبيقات الأخرى' : 'The app will appear on your home screen like other apps',
      fallbackTitle: isArabic ? 'تثبيت التطبيق' : 'Install App',
      fallbackNote: isArabic ? 'متصفحك لا يدعم التثبيت المباشر. استخدم التعليمات أدناه.' : 'Your browser does not support direct installation. Use the instructions below.'
    };
    return texts[key] || key;
  }

  // Create the install button
  function createInstallButton() {
    // Check if button already exists
    if (document.getElementById('pwa-install-button')) {
      return;
    }

    // Check if app is already installed
    if (isAppInstalled()) {
      console.log('[PWA] App is already running in standalone mode - hiding install button');
      return;
    }

    // Create button container
    installButtonContainer = document.createElement('div');
    installButtonContainer.id = 'pwa-install-container';
    installButtonContainer.className = 'pwa-install-container';

    // Create the button
    installButton = document.createElement('button');
    installButton.id = 'pwa-install-button';
    installButton.className = 'pwa-install-button';
    installButton.innerHTML = `
      <span class="pwa-install-icon">📱</span>
      <span class="pwa-install-text">${getLocalizedText('installButton')}</span>
    `;
    installButton.setAttribute('aria-label', getLocalizedText('installButton'));

    // Add click handler
    installButton.addEventListener('click', handleInstallClick);

    // Append button to container
    installButtonContainer.appendChild(installButton);

    // Append container to body
    document.body.appendChild(installButtonContainer);

    console.log('[PWA] Install button created');
  }

  // Handle install button click
  function handleInstallClick() {
    console.log('[PWA] Install button clicked');
    console.log('[PWA] Platform:', detectedPlatform, 'Browser:', detectedBrowser);

    if (deferredPrompt) {
      // Native install prompt available (Chrome/Edge/Android)
      console.log('[PWA] Triggering native install prompt');
      deferredPrompt.prompt();
      
      // Wait for user to respond
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted the install prompt');
          updateButtonText(getLocalizedText('installing'));
          // Hide the button after successful installation
          setTimeout(() => {
            hideInstallButton();
          }, 2000);
        } else {
          console.log('[PWA] User dismissed the install prompt - showing fallback instructions');
          showPlatformInstructions();
        }
        
        // Clear the deferredPrompt
        deferredPrompt = null;
      }).catch((error) => {
        console.error('[PWA] Error during install prompt:', error);
        console.log('[PWA] Showing fallback instructions due to error');
        showPlatformInstructions();
        updateButtonText(getLocalizedText('installFailed'));
      });
    } else {
      // No deferred prompt available - show platform-specific instructions
      console.log('[PWA] No native install prompt available - showing fallback instructions');
      console.log('[PWA] Reason:', supportsPWAInstallation() ? 'beforeinstallprompt not fired yet' : 'browser does not support beforeinstallprompt');
      showPlatformInstructions();
    }
  }

  // Show platform-specific installation instructions
  function showPlatformInstructions() {
    console.log('[PWA] Showing platform-specific instructions for:', detectedPlatform, detectedBrowser);
    
    let instructions = '';
    let title = '';
    let note = '';

    if (isAndroidChromeOrSamsung()) {
      // Android Chrome / Samsung Internet
      title = getLocalizedText('androidChromeTitle');
      instructions = `
        <ol>
          <li>${getLocalizedText('androidChromeStep1')}</li>
          <li>${getLocalizedText('androidChromeStep2')}</li>
        </ol>
      `;
    } else if (isAndroidFirefox()) {
      // Android Firefox
      title = getLocalizedText('androidFirefoxTitle');
      instructions = `
        <ol>
          <li>${getLocalizedText('androidFirefoxStep1')}</li>
          <li>${getLocalizedText('androidFirefoxStep2')}</li>
        </ol>
        <p class="pwa-instruction-note">${getLocalizedText('androidFirefoxNote')}</p>
      `;
    } else if (isIOS()) {
      // iPhone/iPad Safari
      title = getLocalizedText('iosTitle');
      instructions = `
        <ol>
          <li>${getLocalizedText('iosStep1')} <span class="pwa-share-icon">⎋</span></li>
          <li>${getLocalizedText('iosStep2')}</li>
          <li>${getLocalizedText('iosStep3')}</li>
        </ol>
        <p>${getLocalizedText('iosNote')}</p>
      `;
    } else {
      // Fallback for other platforms
      title = getLocalizedText('fallbackTitle');
      note = getLocalizedText('fallbackNote');
      instructions = `
        <p>${note}</p>
        <ol>
          <li>${getLocalizedText('androidChromeStep1')}</li>
          <li>${getLocalizedText('androidChromeStep2')}</li>
        </ol>
      `;
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'pwa-install-modal';
    modal.className = 'pwa-install-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'pwa-modal-title');
    modal.innerHTML = `
      <div class="pwa-modal-content">
        <div class="pwa-modal-header">
          <h2 id="pwa-modal-title">${title}</h2>
          <button class="pwa-modal-close" aria-label="${getLocalizedText('modalClose')}">×</button>
        </div>
        <div class="pwa-modal-body">
          <p class="pwa-modal-description">${getLocalizedText('modalDescription')}</p>
          ${instructions}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    const closeButton = modal.querySelector('.pwa-modal-close');
    closeButton.addEventListener('click', () => {
      modal.remove();
      if (installButton) {
        installButton.style.display = 'flex';
      }
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        if (installButton) {
          installButton.style.display = 'flex';
        }
      }
    });

    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escapeHandler);
        if (installButton) {
          installButton.style.display = 'flex';
        }
      }
    };
    document.addEventListener('keydown', escapeHandler);

    // Hide install button temporarily
    if (installButton) {
      installButton.style.display = 'none';
    }

    console.log('[PWA] Install instructions modal shown');
  }

  // Update button text
  function updateButtonText(text) {
    if (installButton) {
      const textElement = installButton.querySelector('.pwa-install-text');
      if (textElement) {
        textElement.textContent = text;
      }
    }
  }

  // Hide the install button
  function hideInstallButton() {
    if (installButtonContainer) {
      installButtonContainer.style.display = 'none';
      console.log('[PWA] Install button hidden');
    }
  }

  // Show the install button
  function showInstallButton() {
    if (installButtonContainer) {
      installButtonContainer.style.display = 'block';
      console.log('[PWA] Install button shown');
    }
  }

  // Initialize the PWA install handler
  function init() {
    console.log('[PWA] ===========================================');
    console.log('[PWA] Initializing install handler...');
    console.log('[PWA] ===========================================');

    // Detect platform and browser
    detectPlatformAndBrowser();

    // Check if app is already installed
    if (isAppInstalled()) {
      console.log('[PWA] App is already installed in standalone mode - not showing install button');
      return;
    }

    // Listen for beforeinstallprompt event (Chrome/Edge/Android)
    if (supportsPWAInstallation()) {
      window.addEventListener('beforeinstallprompt', (event) => {
        console.log('[PWA] ===========================================');
        console.log('[PWA] beforeinstallprompt event fired');
        console.log('[PWA] Platform:', detectedPlatform, 'Browser:', detectedBrowser);
        console.log('[PWA] ===========================================');
        
        // Prevent the default browser install prompt
        event.preventDefault();
        
        // Store the event for later use
        deferredPrompt = event;
        
        // Show the install button
        createInstallButton();
        
        // Update button text to indicate install is available
        updateButtonText(getLocalizedText('installButton'));
        console.log('[PWA] Install button shown due to beforeinstallprompt');
      });
    } else {
      console.log('[PWA] beforeinstallprompt not supported - will show install button with manual instructions');
      // Show install button with manual instructions for browsers that don't support beforeinstallprompt
      window.addEventListener('load', () => {
        setTimeout(() => {
          createInstallButton();
          console.log('[PWA] Install button shown for manual installation');
        }, 2000);
      });
    }

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] ===========================================');
      console.log('[PWA] App was installed successfully');
      console.log('[PWA] ===========================================');
      deferredPrompt = null;
      hideInstallButton();
    });

    // Listen for display mode changes (to detect if app was launched from home screen)
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (event) => {
      if (event.matches) {
        console.log('[PWA] Display mode changed to standalone - hiding install button');
        hideInstallButton();
      } else {
        console.log('[PWA] Display mode changed to browser - showing install button');
        showInstallButton();
      }
    });

    console.log('[PWA] Install handler initialization complete');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
