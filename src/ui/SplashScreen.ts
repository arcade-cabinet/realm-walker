/**
 * Splash Screen & Loading System
 * Gothic fantasy aesthetic with animated intro
 */

export interface SplashScreenConfig {
  container: HTMLElement;
  onComplete?: () => void;
  skipDelay?: number;
  backgroundImage?: string;
}

export class SplashScreen {
  private config: SplashScreenConfig;
  private element?: HTMLElement;
  private skipTimeout?: number;

  constructor(config: SplashScreenConfig) {
    this.config = {
      skipDelay: 3000,
      ...config
    };
  }

  /**
   * Show splash screen
   */
  async show(): Promise<void> {
    this.injectStyles();
    this.element = this.createSplashElement();
    this.config.container.appendChild(this.element);

    // Auto-skip after delay
    if (this.config.skipDelay) {
      this.skipTimeout = window.setTimeout(() => {
        this.hide();
      }, this.config.skipDelay);
    }

    // Allow manual skip
    this.element.addEventListener('click', () => this.hide());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        this.hide();
      }
    }, { once: true });
  }

  /**
   * Hide splash screen
   */
  hide(): void {
    if (this.skipTimeout) {
      clearTimeout(this.skipTimeout);
    }

    if (this.element) {
      this.element.classList.add('fade-out');
      setTimeout(() => {
        this.element?.remove();
        this.config.onComplete?.();
      }, 800);
    }
  }

  /**
   * Inject splash screen styles
   */
  private injectStyles(): void {
    const styleId = 'realm-walker-splash-styles';
    
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .rw-splash-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(180deg, 
          #0a0000 0%, 
          #1a0505 50%, 
          #0a0000 100%
        );
        background-size: 100% 200%;
        animation: gradientShift 4s ease-in-out infinite;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        cursor: pointer;
        transition: opacity 0.8s ease-out;
      }

      .rw-splash-screen.fade-out {
        opacity: 0;
      }

      @keyframes gradientShift {
        0%, 100% { background-position: 0% 0%; }
        50% { background-position: 0% 100%; }
      }

      .rw-splash-logo {
        text-align: center;
        animation: fadeInScale 2s ease-out;
      }

      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .rw-splash-title {
        font-family: 'Cinzel', 'Times New Roman', serif;
        font-size: 5em;
        font-weight: bold;
        color: #FFD700;
        text-shadow: 
          0 0 40px rgba(220, 20, 60, 0.8),
          0 0 80px rgba(220, 20, 60, 0.4),
          4px 4px 8px rgba(0, 0, 0, 0.9);
        letter-spacing: 8px;
        margin-bottom: 20px;
        animation: titleGlow 3s ease-in-out infinite;
      }

      @keyframes titleGlow {
        0%, 100% { 
          text-shadow: 
            0 0 40px rgba(220, 20, 60, 0.8),
            0 0 80px rgba(220, 20, 60, 0.4),
            4px 4px 8px rgba(0, 0, 0, 0.9);
        }
        50% { 
          text-shadow: 
            0 0 60px rgba(220, 20, 60, 1),
            0 0 120px rgba(220, 20, 60, 0.6),
            4px 4px 8px rgba(0, 0, 0, 0.9);
        }
      }

      .rw-splash-subtitle {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 1.8em;
        color: #C0C0C0;
        font-style: italic;
        letter-spacing: 3px;
        margin-bottom: 60px;
      }

      .rw-splash-tagline {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 1.3em;
        color: #8B0000;
        margin-top: 40px;
        max-width: 600px;
        text-align: center;
        line-height: 1.8;
        animation: fadeIn 3s ease-out 1s both;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .rw-splash-prompt {
        position: absolute;
        bottom: 50px;
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 1.2em;
        color: #666;
        animation: blink 2s ease-in-out infinite;
      }

      @keyframes blink {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }

      .rw-splash-ornament {
        width: 200px;
        height: 2px;
        background: linear-gradient(90deg, 
          transparent 0%, 
          #DC143C 50%, 
          transparent 100%
        );
        margin: 20px auto;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Create splash screen element
   */
  private createSplashElement(): HTMLElement {
    const splash = document.createElement('div');
    splash.className = 'rw-splash-screen';
    
    splash.innerHTML = `
      <div class="rw-splash-logo">
        <div class="rw-splash-title">REALM WALKER</div>
        <div class="rw-splash-ornament"></div>
        <div class="rw-splash-subtitle">Story</div>
        <div class="rw-splash-tagline">
          In the eternal twilight, eight Guardians hold the shards of creation.<br>
          You must unmake them all to save reality itself.
        </div>
      </div>
      <div class="rw-splash-prompt">
        Click anywhere or press any key to begin...
      </div>
    `;

    return splash;
  }
}

/**
 * Loading Screen (for asset loading)
 */
export interface LoadingScreenConfig {
  container: HTMLElement;
  message?: string;
}

export class LoadingScreen {
  private config: LoadingScreenConfig;
  private element?: HTMLElement;
  private progressBar?: HTMLElement;
  private progressText?: HTMLElement;

  constructor(config: LoadingScreenConfig) {
    this.config = {
      message: 'Loading...',
      ...config
    };
  }

  /**
   * Show loading screen
   */
  show(): void {
    this.injectStyles();
    this.element = this.createLoadingElement();
    this.config.container.appendChild(this.element);
  }

  /**
   * Update loading progress
   */
  updateProgress(percent: number, message?: string): void {
    if (this.progressBar) {
      this.progressBar.style.width = `${percent}%`;
    }
    if (this.progressText && message) {
      this.progressText.textContent = message;
    }
  }

  /**
   * Hide loading screen
   */
  hide(): void {
    if (this.element) {
      this.element.classList.add('fade-out');
      setTimeout(() => {
        this.element?.remove();
      }, 600);
    }
  }

  /**
   * Inject loading screen styles
   */
  private injectStyles(): void {
    const styleId = 'realm-walker-loading-styles';
    
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .rw-loading-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.6s ease-out;
      }

      .rw-loading-screen.fade-out {
        opacity: 0;
      }

      .rw-loading-content {
        text-align: center;
        max-width: 500px;
        width: 90%;
      }

      .rw-loading-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid rgba(220, 20, 60, 0.3);
        border-top-color: #DC143C;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 30px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .rw-loading-message {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 1.5em;
        color: #C0C0C0;
        margin-bottom: 20px;
      }

      .rw-loading-bar-container {
        width: 100%;
        height: 8px;
        background: rgba(139, 0, 0, 0.3);
        border-radius: 4px;
        overflow: hidden;
        margin-top: 20px;
      }

      .rw-loading-bar {
        height: 100%;
        background: linear-gradient(90deg, #DC143C 0%, #FFD700 100%);
        width: 0%;
        transition: width 0.3s ease;
        box-shadow: 0 0 20px rgba(220, 20, 60, 0.6);
      }

      .rw-loading-percent {
        font-family: monospace;
        font-size: 1.2em;
        color: #FFD700;
        margin-top: 10px;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Create loading screen element
   */
  private createLoadingElement(): HTMLElement {
    const loading = document.createElement('div');
    loading.className = 'rw-loading-screen';
    
    loading.innerHTML = `
      <div class="rw-loading-content">
        <div class="rw-loading-spinner"></div>
        <div class="rw-loading-message">${this.config.message}</div>
        <div class="rw-loading-bar-container">
          <div class="rw-loading-bar" data-progress-bar></div>
        </div>
        <div class="rw-loading-percent" data-progress-text>0%</div>
      </div>
    `;

    this.progressBar = loading.querySelector('[data-progress-bar]') as HTMLElement;
    this.progressText = loading.querySelector('[data-progress-text]') as HTMLElement;

    return loading;
  }
}
