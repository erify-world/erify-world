/**
 * ERIFY™ Feed Screen
 * Social feed with ERIFY website promotion elements
 */

class FeedScreen {
  constructor() {
    this.bindEvents();
  }

  render() {
    return `
      <div class="screen">
        <div class="screen__container">
          <header class="screen__header">
            <h1 class="screen__title">Feed</h1>
            <p class="screen__subtitle">Luxury content, curated for you</p>
          </header>

          <!-- ERIFY Website Promotion Card -->
          <section class="screen__section" style="background: linear-gradient(135deg, var(--erify-elev-1) 0%, var(--erify-elev-2) 100%); border: 2px solid var(--erify-blue); box-shadow: 0 0 18px 4px var(--erify-blue);">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--erify-blue) 0%, var(--erify-blue-electric) 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px var(--erify-blue);">
                <span style="font-size: 1.5rem; color: var(--erify-black);">🌐</span>
              </div>
              <div>
                <h3 style="margin: 0; color: var(--erify-text); font-size: 1.2rem;">Discover ERIFY™ Universe</h3>
                <p style="margin: 0.25rem 0 0 0; color: var(--erify-text-muted); font-size: 0.9rem;">Sponsored</p>
              </div>
            </div>
            <p style="color: var(--erify-text-muted); margin-bottom: 1.5rem; line-height: 1.5;">
              Experience the full power of ERIFY across all platforms. Discover luxury digital experiences, 
              AI-powered features, and exclusive content on our official website.
            </p>
            <button class="btn btn--website" id="feedVisitWebsiteBtn" style="width: 100%;">
              <span>Visit ERIFY Website</span>
              <span>🌐</span>
            </button>
          </section>

          <!-- Create Post Section -->
          <section class="screen__section">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--erify-blue) 0%, var(--erify-blue-electric) 100%); display: flex; align-items: center; justify-content: center;">
                <span style="color: var(--erify-black);">👤</span>
              </div>
              <input 
                class="field" 
                placeholder="Share your luxury moment..." 
                style="flex: 1; border-radius: 999px;"
              />
            </div>
            <div style="display: flex; gap: 1rem; justify-content: space-between; align-items: center;">
              <div style="display: flex; gap: 1rem;">
                <button class="btn-icon">📷</button>
                <button class="btn-icon">🎥</button>
                <button class="btn-icon">🎵</button>
                <button class="btn-icon">📍</button>
              </div>
              <button class="btn btn--glow">Post</button>
            </div>
          </section>

          <!-- Feed Posts -->
          <section class="screen__section">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--erify-orange) 0%, var(--erify-orange-warm) 100%); display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-weight: bold;">DC</span>
              </div>
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="color: var(--erify-text); font-weight: 600;">DC ERIFY</span>
                  <span style="color: var(--erify-blue); font-size: 1.2rem;">✓</span>
                  <span style="color: var(--erify-text-muted); font-size: 0.9rem;">@dcerify • 2h</span>
                </div>
                <p style="margin: 0.5rem 0 0 0; color: var(--erify-text-muted); font-size: 0.9rem;">Founder • ERIFY Technologies</p>
              </div>
              <button class="btn-icon">⋯</button>
            </div>
            
            <p style="color: var(--erify-text); margin-bottom: 1rem; line-height: 1.6;">
              Just launched the new ERIFY™ Glow Kit 💎🔥 Our design system now supports luxury experiences 
              across all platforms. From mobile apps to web interfaces - everything now has that signature ERIFY glow.
              <br><br>
              #ERIFY #LuxuryTech #DesignSystem #UI #UX
            </p>
            
            <div style="background: var(--erify-elev-2); border-radius: 12px; overflow: hidden; margin-bottom: 1rem;">
              <div style="width: 100%; height: 200px; background: linear-gradient(135deg, var(--erify-blue) 0%, var(--erify-orange) 100%); display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 3rem;">💎✨</span>
              </div>
              <div style="padding: 1rem;">
                <h4 style="margin: 0 0 0.5rem 0; color: var(--erify-text);">ERIFY™ Glow Kit v1.0</h4>
                <p style="margin: 0; color: var(--erify-text-muted); font-size: 0.9rem;">Complete design system for luxury digital experiences</p>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--erify-elev-2);">
              <div style="display: flex; gap: 2rem;">
                <button style="background: none; border: none; color: var(--erify-text-muted); display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <span>💎</span>
                  <span>142</span>
                </button>
                <button style="background: none; border: none; color: var(--erify-text-muted); display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <span>💬</span>
                  <span>24</span>
                </button>
                <button style="background: none; border: none; color: var(--erify-text-muted); display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <span>📤</span>
                  <span>18</span>
                </button>
              </div>
              <button class="btn-icon">🔖</button>
            </div>
          </section>

          <section class="screen__section">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--erify-success); display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-weight: bold;">EM</span>
              </div>
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="color: var(--erify-text); font-weight: 600;">ERIFY Member</span>
                  <span style="color: var(--erify-text-muted); font-size: 0.9rem;">@erifymember • 4h</span>
                </div>
                <p style="margin: 0.5rem 0 0 0; color: var(--erify-text-muted); font-size: 0.9rem;">Premium Member</p>
              </div>
              <button class="btn-icon">⋯</button>
            </div>
            
            <p style="color: var(--erify-text); margin-bottom: 1rem; line-height: 1.6;">
              The ERIFY experience is absolutely incredible! 🚀 The level of polish and attention to detail 
              in every interaction is what sets this platform apart. Truly luxury digital experience.
            </p>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--erify-elev-2);">
              <div style="display: flex; gap: 2rem;">
                <button style="background: none; border: none; color: var(--erify-text-muted); display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <span>💎</span>
                  <span>89</span>
                </button>
                <button style="background: none; border: none; color: var(--erify-text-muted); display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <span>💬</span>
                  <span>12</span>
                </button>
                <button style="background: none; border: none; color: var(--erify-text-muted); display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <span>📤</span>
                  <span>7</span>
                </button>
              </div>
              <button class="btn-icon">🔖</button>
            </div>
          </section>

          <!-- Website Promotion in Feed -->
          <section class="screen__section" style="background: linear-gradient(45deg, var(--erify-elev-1) 0%, var(--erify-elev-2) 50%, var(--erify-elev-1) 100%); border: 1px solid var(--erify-orange);">
            <div style="text-align: center; padding: 1rem;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">🌐✨</div>
              <h3 style="margin: 0 0 0.5rem 0; color: var(--erify-text);">Join the ERIFY Community</h3>
              <p style="margin: 0 0 1.5rem 0; color: var(--erify-text-muted);">
                Connect with creators, discover exclusive content, and be part of the luxury digital revolution.
              </p>
              <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button class="btn btn--website" id="feedPromotionWebsiteBtn">
                  Visit Website 🌐
                </button>
                <button class="btn btn--ghost" onclick="window.open('https://x.com/erifyteam', '_blank')">
                  Follow Us 🐦
                </button>
              </div>
            </div>
          </section>

          <section class="screen__section">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--erify-warning); display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-weight: bold;">CC</span>
              </div>
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="color: var(--erify-text); font-weight: 600;">Creative Community</span>
                  <span style="color: var(--erify-text-muted); font-size: 0.9rem;">@creativecommunity • 6h</span>
                </div>
                <p style="margin: 0.5rem 0 0 0; color: var(--erify-text-muted); font-size: 0.9rem;">Verified Creator</p>
              </div>
              <button class="btn-icon">⋯</button>
            </div>
            
            <p style="color: var(--erify-text); margin-bottom: 1rem; line-height: 1.6;">
              Working on something amazing with the ERIFY design system. The glow effects and luxury aesthetics 
              make every project feel premium. Can't wait to share what we're building! 🔥
            </p>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--erify-elev-2);">
              <div style="display: flex; gap: 2rem;">
                <button style="background: none; border: none; color: var(--erify-text-muted); display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <span>💎</span>
                  <span>156</span>
                </button>
                <button style="background: none; border: none; color: var(--erify-text-muted); display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <span>💬</span>
                  <span>31</span>
                </button>
                <button style="background: none; border: none; color: var(--erify-text-muted); display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <span>📤</span>
                  <span>22</span>
                </button>
              </div>
              <button class="btn-icon">🔖</button>
            </div>
          </section>
        </div>
      </div>

      <!-- Website Modal (shared) -->
      <div class="modal modal--hidden" id="feedWebsiteModal">
        <div class="modal__content">
          <button class="modal__close" id="feedCloseModalBtn">&times;</button>
          <div class="modal__header">
            <h2 class="modal__title">ERIFY™ Official Website</h2>
            <p class="text-muted">Explore the full ERIFY ecosystem</p>
          </div>
          <iframe 
            class="modal__webview" 
            id="feedWebsiteFrame"
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
      if (e.target.id === 'feedVisitWebsiteBtn' || e.target.closest('#feedVisitWebsiteBtn') ||
          e.target.id === 'feedPromotionWebsiteBtn' || e.target.closest('#feedPromotionWebsiteBtn')) {
        e.preventDefault();
        this.openWebsiteModal();
      }
      
      if (e.target.id === 'feedCloseModalBtn' || e.target.closest('#feedCloseModalBtn')) {
        e.preventDefault();
        this.closeWebsiteModal();
      }
    });

    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target.id === 'feedWebsiteModal') {
        this.closeWebsiteModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('feedWebsiteModal');
        if (modal && !modal.classList.contains('modal--hidden')) {
          this.closeWebsiteModal();
        }
      }
    });
  }

  openWebsiteModal() {
    const modal = document.getElementById('feedWebsiteModal');
    const websiteFrame = document.getElementById('feedWebsiteFrame');

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
    const modal = document.getElementById('feedWebsiteModal');
    const websiteFrame = document.getElementById('feedWebsiteFrame');
    
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
  module.exports = FeedScreen;
}

// Auto-initialize if this script is loaded directly
if (typeof window !== 'undefined') {
  window.FeedScreen = FeedScreen;
}