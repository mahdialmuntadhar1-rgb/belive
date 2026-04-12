// PWA Install Handler
// Manages the "Install App" button and handles beforeinstallprompt events
// Works across Android (Chrome), iOS (Safari), and desktop Chrome/Edge

(function() {
  'use strict';

  // DOM elements
  let installButton = null;
  let installButtonContainer = null;
  let deferredPrompt = null;

  // Check if running on iOS
  function isIOS() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }

  // Check if running on iPadOS (which identifies as Macintosh)
  function isIPadOS() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /macintosh/.test(userAgent) && 'ontouchend' in document;
  }

  // Check if app is already installed (running in standalone mode)
  function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  // Create the install button
  function createInstallButton() {
    // Check if button already exists
    if (document.getElementById('pwa-install-button')) {
      return;
    }

    // Create button container
    installButtonContainer = document.createElement('div');
    installButtonContainer.id = 'pwa-install-container';
    installButtonContainer.className = 'pwa-install-container';
    installButtonContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    `;

    // Create the button
    installButton = document.createElement('button');
    installButton.id = 'pwa-install-button';
    installButton.className = 'pwa-install-button';
    installButton.innerHTML = `
      <span class="pwa-install-icon">📱</span>
      <span class="pwa-install-text">Install App</span>
    `;

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
    if (isIOS() || isIPadOS()) {
      // iOS doesn't support beforeinstallprompt, show instructions
      showIOSInstructions();
    } else if (deferredPrompt) {
      // Android/Desktop Chrome/Edge - trigger the install prompt
      deferredPrompt.prompt();
      
      // Wait for user to respond
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted the install prompt');
          updateButtonText('Installing...');
          // Hide the button after successful installation
          setTimeout(() => {
            hideInstallButton();
          }, 2000);
        } else {
          console.log('[PWA] User dismissed the install prompt');
        }
        
        // Clear the deferredPrompt
        deferredPrompt = null;
      }).catch((error) => {
        console.error('[PWA] Error during install prompt:', error);
        updateButtonText('Install Failed');
      });
    } else {
      // No deferred prompt available
      console.log('[PWA] No install prompt available');
      updateButtonText('Not Available');
    }
  }

  // Show iOS installation instructions
  function showIOSInstructions() {
    // Create modal for iOS instructions
    const modal = document.createElement('div');
    modal.id = 'pwa-ios-modal';
    modal.className = 'pwa-ios-modal';
    modal.innerHTML = `
      <div class="pwa-ios-modal-content">
        <div class="pwa-ios-modal-header">
          <h3>Install on iOS</h3>
          <button class="pwa-ios-modal-close" onclick="document.getElementById('pwa-ios-modal').remove()">×</button>
        </div>
        <div class="pwa-ios-modal-body">
          <ol>
            <li>Tap the <strong>Share</strong> button <span class="pwa-share-icon">⎋</span> in your browser's toolbar</li>
            <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
            <li>Tap <strong>Add</strong> in the top right corner</li>
          </ol>
          <p>The app will appear on your home screen like a native app.</p>
        </div>
      </div>
    `;

    // Add modal styles
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    // Add content styles
    const content = modal.querySelector('.pwa-ios-modal-content');
    content.style.cssText = `
      background: white;
      border-radius: 12px;
      max-width: 400px;
      width: 100%;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    `;

    // Add header styles
    const header = modal.querySelector('.pwa-ios-modal-header');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    `;

    const headerTitle = modal.querySelector('h3');
    headerTitle.style.cssText = `
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    `;

    const closeButton = modal.querySelector('.pwa-ios-modal-close');
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 28px;
      line-height: 1;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      width: 32px;
      height: 32px;
    `;

    // Add body styles
    const body = modal.querySelector('.pwa-ios-modal-body');
    body.style.cssText = `
      padding: 20px;
    `;

    const list = modal.querySelector('ol');
    list.style.cssText = `
      margin: 0 0 16px 0;
      padding-left: 24px;
      line-height: 1.6;
    `;

    const listItems = modal.querySelectorAll('li');
    listItems.forEach(item => {
      item.style.cssText = `
        margin-bottom: 12px;
        color: #374151;
      `;
    });

    const paragraph = modal.querySelector('p');
    paragraph.style.cssText = `
      margin: 16px 0 0 0;
      color: #6b7280;
      font-size: 14px;
    `;

    document.body.appendChild(modal);

    // Hide install button temporarily
    if (installButton) {
      installButton.style.display = 'none';
    }

    // Show install button again when modal is closed
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        if (installButton) {
          installButton.style.display = 'flex';
        }
      }
    });
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
    }
  }

  // Show the install button
  function showInstallButton() {
    if (installButtonContainer) {
      installButtonContainer.style.display = 'block';
    }
  }

  // Initialize the PWA install handler
  function init() {
    console.log('[PWA] Initializing install handler...');

    // Check if app is already installed
    if (isAppInstalled()) {
      console.log('[PWA] App is already installed in standalone mode');
      return;
    }

    // Listen for beforeinstallprompt event (Chrome/Edge/Android)
    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('[PWA] beforeinstallprompt event fired');
      
      // Prevent the default browser install prompt
      event.preventDefault();
      
      // Store the event for later use
      deferredPrompt = event;
      
      // Show the install button
      createInstallButton();
      
      // Update button text to indicate install is available
      updateButtonText('Install App');
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App was installed');
      deferredPrompt = null;
      hideInstallButton();
    });

    // For iOS, show the install button after a delay
    if (isIOS() || isIPadOS()) {
      console.log('[PWA] iOS/iPadOS detected - showing install button with instructions');
      
      // Wait for page to load before showing button
      window.addEventListener('load', () => {
        setTimeout(() => {
          createInstallButton();
          updateButtonText('Install App');
        }, 2000);
      });
    }

    // Listen for display mode changes (to detect if app was launched from home screen)
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (event) => {
      if (event.matches) {
        console.log('[PWA] Display mode changed to standalone');
        hideInstallButton();
      } else {
        console.log('[PWA] Display mode changed to browser');
        showInstallButton();
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
