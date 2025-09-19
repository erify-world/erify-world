/**
 * ERIFY™ Profile Screen
 * User profile with ERIFY website integration
 */

class ProfileScreen {
  constructor() {
    this.bindEvents();
  }

  render() {
    return `
      <div class="screen">
        <div class="screen__container">
          <header class="screen__header">
            <h1 class="screen__title">Profile</h1>
            <p class="screen__subtitle">Your ERIFY identity</p>
          </header>

          <section class="screen__section">
            <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem;">
              <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--erify-blue) 0%, var(--erify-blue-electric) 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px 4px var(--erify-blue);">
                <span style="font-size: 2rem; color: var(--erify-black);">👤</span>
              </div>
              <div>
                <h2 style="margin: 0; color: var(--erify-text); font-size: 1.5rem;">ERIFY User</h2>
                <p style="margin: 0.25rem 0 0 0; color: var(--erify-text-muted);">@erifyuser</p>
                <p style="margin: 0.25rem 0 0 0; color: var(--erify-text-muted); font-size: 0.9rem;">Member since 2024</p>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
              <div style="text-align: center; padding: 1rem; background: var(--erify-elev-2); border-radius: 12px;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--erify-blue);">42</div>
                <div style="font-size: 0.8rem; color: var(--erify-text-muted);">Posts</div>
              </div>
              <div style="text-align: center; padding: 1rem; background: var(--erify-elev-2); border-radius: 12px;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--erify-orange);">128</div>
                <div style="font-size: 0.8rem; color: var(--erify-text-muted);">Followers</div>
              </div>
              <div style="text-align: center; padding: 1rem; background: var(--erify-elev-2); border-radius: 12px;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--erify-success);">95</div>
                <div style="font-size: 0.8rem; color: var(--erify-text-muted);">Following</div>
              </div>
            </div>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <button class="btn btn--glow">
                ✏️ Edit Profile
              </button>
              <button class="btn btn--ghost">
                📤 Share Profile
              </button>
            </div>
          </section>

          <section class="screen__section">
            <h2 class="screen__section-title">ERIFY Connect</h2>
            <p style="color: var(--erify-text-muted); margin-bottom: 1rem;">
              Discover more about ERIFY and connect with our community across all platforms.
            </p>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <button class="btn btn--website" id="profileVisitWebsiteBtn">
                <span>Explore ERIFY Website</span>
                <span>🌐</span>
              </button>
              <button class="btn btn--ghost" onclick="window.open('https://x.com/erifyteam', '_blank')">
                <span>Follow on X (Twitter)</span>
                <span>🐦</span>
              </button>
              <button class="btn btn--ghost" onclick="window.open('https://www.youtube.com/@erifyworld', '_blank')">
                <span>Subscribe on YouTube</span>
                <span>📺</span>
              </button>
            </div>
          </section>

          <section class="screen__section">
            <h2 class="screen__section-title">Recent Activity</h2>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--erify-elev-2); border-radius: 12px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--erify-blue); display: flex; align-items: center; justify-content: center;">
                  <span style="color: var(--erify-black);">💎</span>
                </div>
                <div style="flex: 1;">
                  <div style="color: var(--erify-text); font-weight: 500;">Posted a luxury content</div>
                  <div style="color: var(--erify-text-muted); font-size: 0.9rem;">2 hours ago</div>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--erify-elev-2); border-radius: 12px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--erify-orange); display: flex; align-items: center; justify-content: center;">
                  <span style="color: white;">🔥</span>
                </div>
                <div style="flex: 1;">
                  <div style="color: var(--erify-text); font-weight: 500;">Joined ERIFY Premium</div>
                  <div style="color: var(--erify-text-muted); font-size: 0.9rem;">1 day ago</div>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--erify-elev-2); border-radius: 12px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--erify-success); display: flex; align-items: center; justify-content: center;">
                  <span style="color: white;">✨</span>
                </div>
                <div style="flex: 1;">
                  <div style="color: var(--erify-text); font-weight: 500;">Profile verified</div>
                  <div style="color: var(--erify-text-muted); font-size: 0.9rem;">3 days ago</div>
                </div>
              </div>
            </div>
          </section>

          <section class="screen__section">
            <h2 class="screen__section-title">Achievements</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
              <div style="text-align: center; padding: 1.5rem; background: var(--erify-elev-2); border-radius: 12px; border: 2px solid var(--erify-blue);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏆</div>
                <div style="color: var(--erify-text); font-weight: 600; margin-bottom: 0.25rem;">Early Adopter</div>
                <div style="color: var(--erify-text-muted); font-size: 0.8rem;">First 1000 users</div>
              </div>
              
              <div style="text-align: center; padding: 1.5rem; background: var(--erify-elev-2); border-radius: 12px; border: 2px solid var(--erify-orange);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔥</div>
                <div style="color: var(--erify-text); font-weight: 600; margin-bottom: 0.25rem;">Content Creator</div>
                <div style="color: var(--erify-text-muted); font-size: 0.8rem;">25+ quality posts</div>
              </div>
              
              <div style="text-align: center; padding: 1.5rem; background: var(--erify-elev-2); border-radius: 12px; border: 2px solid var(--erify-success);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">💎</div>
                <div style="color: var(--erify-text); font-weight: 600; margin-bottom: 0.25rem;">Luxury Member</div>
                <div style="color: var(--erify-text-muted); font-size: 0.8rem;">Premium subscriber</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Website Modal (shared) -->
      <div class="modal modal--hidden" id="profileWebsiteModal">
        <div class="modal__content">
          <button class="modal__close" id="profileCloseModalBtn">&times;</button>
          <div class="modal__header">
            <h2 class="modal__title">ERIFY™ Official Website</h2>
            <p class="text-muted">Discover the full ERIFY experience</p>
          </div>
          <iframe 
            class="modal__webview" 
            id="profileWebsiteFrame"
            src="about:blank"
            title="ERIFY Website"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          ></iframe>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Use event delegation for dynamic content
    document.addEventListener('click', (e) => {
      if (e.target.id === 'profileVisitWebsiteBtn' || e.target.closest('#profileVisitWebsiteBtn')) {
        e.preventDefault();
        this.openWebsiteModal();
      }
      
      if (e.target.id === 'profileCloseModalBtn' || e.target.closest('#profileCloseModalBtn')) {
        e.preventDefault();
        this.closeWebsiteModal();
      }
    });

    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target.id === 'profileWebsiteModal') {
        this.closeWebsiteModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('profileWebsiteModal');
        if (modal && !modal.classList.contains('modal--hidden')) {
          this.closeWebsiteModal();
        }
      }
    });
  }

  openWebsiteModal() {
    const modal = document.getElementById('profileWebsiteModal');
    const websiteFrame = document.getElementById('profileWebsiteFrame');

    if (!modal || !websiteFrame) return;

    // Set the website URL
    const websiteUrl = 'https://erifyworldwide.com';
    websiteFrame.src = websiteUrl;
    
    modal.classList.remove('modal--hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Focus trap for accessibility
    modal.focus();
  }

  closeWebsiteModal() {
    const modal = document.getElementById('profileWebsiteModal');
    const websiteFrame = document.getElementById('profileWebsiteFrame');
    
    if (!modal) return;
    
    modal.classList.add('modal--hidden');
    document.body.style.overflow = ''; // Restore scrolling
    
    // Clear the iframe src to stop loading
    if (websiteFrame) {
      websiteFrame.src = 'about:blank';
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProfileScreen;
}

// Auto-initialize if this script is loaded directly
if (typeof window !== 'undefined') {
  window.ProfileScreen = ProfileScreen;
}