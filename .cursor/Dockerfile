FROM node:22-bookworm-slim

# Display for GUI-based tests
ENV DISPLAY=:99

# Install system dependencies for browsers, builds, Electron, and Android tooling
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Build essentials (native Node modules like better-sqlite3)
    git \
    git-lfs \
    curl \
    wget \
    build-essential \
    pkg-config \
    python3 \
    python3-pip \
    # X11 libraries for GUI testing
    xvfb \
    x11-utils \
    libx11-dev \
    libxext-dev \
    libxrender-dev \
    libxinerama-dev \
    # Browser testing dependencies (Chromium + ChromeDriver)
    chromium \
    chromium-driver \
    # Headless browser support libraries (Playwright/Chromium)
    libgbm1 \
    libgbm-dev \
    libdrm2 \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgtk-3-dev \
    libnotify-dev \
    libnss3 \
    libnss3-dev \
    libxss1 \
    libxtst6 \
    xdg-utils \
    libatspi2.0-0 \
    libsecret-1-0 \
    libcups2 \
    libnspr4 \
    fonts-liberation \
    # Additional common browser deps
    libglib2.0-0 \
    libgdk-pixbuf2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxkbcommon0 \
    libxshmfence1 \
    libpango-1.0-0 \
    ffmpeg \
    # SDL2 for game testing
    libsdl2-dev \
    libsdl2-image-dev \
    libsdl2-mixer-dev \
    libsdl2-ttf-dev \
    # OpenGL/WebGL testing
    libgl1-mesa-dev \
    libglu1-mesa-dev \
    mesa-utils \
    # Android/Capacitor build prerequisites
    openjdk-17-jdk \
    unzip \
    gradle \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Initialize git-lfs in the image environment with SMUDGE FILTER DISABLED
# This prevents crashes when loading repos with 600+ LFS objects
# LFS files will appear as pointers, which is fine for Cursor/AI analysis
# Actual LFS operations (checkout, pull) happen in GitHub Actions
RUN git lfs install --system --skip-smudge

# Note: git-lfs package is installed above (line 10)
# CRITICAL: --skip-smudge prevents workspace crashes with large LFS repos
# All .glb files (3D models) are tracked via LFS (configured in .gitattributes)
# GitHub Actions workflows handle actual LFS file operations

# Install just command runner
RUN curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

# Install Redis for agent fleet task queue
RUN apt-get update && apt-get install -y redis-server supervisor && rm -rf /var/lib/apt/lists/*

# pnpm via Corepack (MANDATORY package manager)
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate && pnpm --version

# Playwright: install required OS deps and cache Chromium browser
RUN pnpm dlx playwright install-deps
RUN pnpm dlx playwright install chromium

# Android SDK (for Capacitor Android tasks)
# Use a variable for the command line tools version for easier updates.
# Last tested/compatible version as of 2024-06. Update as needed.
ENV ANDROID_CMDLINE_TOOLS_VERSION=11076708
ENV ANDROID_SDK_ROOT=/opt/android-sdk ANDROID_HOME=/opt/android-sdk
ENV PATH="$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools"
RUN mkdir -p /opt/android-sdk/cmdline-tools \
    && curl -sSL -o /tmp/cmdtools.zip "https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_CMDLINE_TOOLS_VERSION}_latest.zip" \
    && unzip -q /tmp/cmdtools.zip -d /opt/android-sdk/cmdline-tools \
    && mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest \
    && rm -f /tmp/cmdtools.zip

RUN yes | sdkmanager --licenses && sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# Useful envs for Selenium
ENV CHROME_BIN=/usr/bin/chromium CHROMEDRIVER_PATH=/usr/bin/chromedriver

WORKDIR /workspace
