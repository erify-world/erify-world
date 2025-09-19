/**
 * ERIFY™ Settings Screen
 * Includes glowing neon blue "Visit ERIFY Website 🌐" button with modal functionality
 */

class SettingsScreen {
  constructor() {
    this.initializeModal();
    this.bindEvents();
  }

  render() {
    return `
      <div class="screen">
        <div class="screen__container">
          <header class="screen__header">
            <h1 class="screen__title">Settings</h1>
            <p class="screen__subtitle">Manage your ERIFY experience</p>
          </header>

          <section class="screen__section">
            <h2 class="screen__section-title">Account Settings</h2>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <button class="btn btn--ghost">
                👤 Edit Profile
              </button>
              <button class="btn btn--ghost">
                🔔 Notifications
              </button>
              <button class="btn btn--ghost">
                🔒 Privacy & Security
              </button>
            </div>
          </section>

          <section class="screen__section">
            <h2 class="screen__section-title">ERIFY Universe</h2>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <button class="btn btn--website" id="visitWebsiteBtn">
                <span>Visit ERIFY Website</span>
                <span>🌐</span>
              </button>
              <button class="btn btn--ghost">
                📱 Download Mobile App
              </button>
              <button class="btn btn--ghost">
                💎 ERIFY Premium
              </button>
            </div>
          </section>

          <section class="screen__section">
            <h2 class="screen__section-title">Support</h2>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <button class="btn btn--ghost">
                💬 Help & Support
              </button>
              <button class="btn btn--ghost">
                📄 Terms of Service
              </button>
              <button class="btn btn--ghost">
                🛡️ Privacy Policy
              </button>
            </div>
          </section>

          <section class="screen__section">
            <h2 class="screen__section-title">Dangerous Zone</h2>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <button class="btn btn--danger">
                🚪 Sign Out
              </button>
              <button class="btn btn--danger">
                🗑️ Delete Account
              </button>
            </div>
          </section>
        </div>
      </div>

      <!-- Website Modal -->
      <div class="modal modal--hidden" id="websiteModal">
        <div class="modal__content">
          <button class="modal__close" id="closeModalBtn">&times;</button>
          <div class="modal__header">
            <h2 class="modal__title">ERIFY™ Official Website</h2>
            <p class="text-muted">Experience the luxury of ERIFY across all platforms</p>
          </div>
          <iframe 
            class="modal__webview" 
            id="websiteFrame"
            src="about:blank"
            title="ERIFY Website"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          ></iframe>
        </div>
      </div>
    `;
  }

  initializeModal() {
    // This method will be called after the DOM is ready
    setTimeout(() => {
      this.modal = document.getElementById('websiteModal');
      this.websiteFrame = document.getElementById('websiteFrame');
      this.visitWebsiteBtn = document.getElementById('visitWebsiteBtn');
      this.closeModalBtn = document.getElementById('closeModalBtn');
    }, 0);
  }

  bindEvents() {
    // Use event delegation for dynamic content
    document.addEventListener('click', (e) => {
      if (e.target.id === 'visitWebsiteBtn' || e.target.closest('#visitWebsiteBtn')) {
        e.preventDefault();
        this.openWebsiteModal();
      }
      
      if (e.target.id === 'closeModalBtn' || e.target.closest('#closeModalBtn')) {
        e.preventDefault();
        this.closeWebsiteModal();
      }
    });

    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeWebsiteModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && !this.modal.classList.contains('modal--hidden')) {
        this.closeWebsiteModal();
      }
    });
  }

  openWebsiteModal() {
    if (!this.modal) {
      this.modal = document.getElementById('websiteModal');
      this.websiteFrame = document.getElementById('websiteFrame');
    }

    // Set the website URL - you can customize this
    const websiteUrl = 'https://erifyworldwide.com';
    this.websiteFrame.src = websiteUrl;
    
    this.modal.classList.remove('modal--hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Focus trap for accessibility
    this.modal.focus();
  }

  closeWebsiteModal() {
    if (!this.modal) return;
    
    this.modal.classList.add('modal--hidden');
    document.body.style.overflow = ''; // Restore scrolling
    
    // Clear the iframe src to stop loading
    this.websiteFrame.src = 'about:blank';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsScreen;
}

// Auto-initialize if this script is loaded directly
if (typeof window !== 'undefined') {
  window.SettingsScreen = SettingsScreen;
}