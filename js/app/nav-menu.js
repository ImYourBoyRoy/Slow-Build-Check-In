// ./js/app/nav-menu.js
/**
 * Navigation hamburger menu module for Ready for Us.
 * 
 * Handles the slide-out navigation menu with dynamic phase links and theme selection.
 * Populates menu items from phases.json and manages open/close behavior.
 * 
 * Usage: Automatically initializes when loaded. Call App.initNavMenu() if needed manually.
 */

const AppNavMenu = {
    /**
     * Initialize the navigation hamburger menu.
     */
    initNavMenu() {
        this.setupMenuBehavior();
        this.populateMenu();
    },

    /**
     * Set up menu open/close behavior.
     */
    setupMenuBehavior() {
        const hamburger = document.getElementById('nav-menu-toggle');
        const menu = document.getElementById('nav-menu');
        const overlay = document.getElementById('nav-menu-overlay');
        const closeBtn = document.getElementById('nav-menu-close');

        if (!hamburger || !menu || !overlay) return;

        // Toggle on hamburger click
        hamburger.addEventListener('click', () => {
            this.toggleMenu();
        });

        // Close on overlay click
        overlay.addEventListener('click', () => {
            this.closeMenu();
        });

        // Close on close button click
        closeBtn?.addEventListener('click', () => {
            this.closeMenu();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMenu();
            }
        });

        // Handle menu item clicks (delegated)
        const menuItems = document.getElementById('nav-menu-items');
        if (menuItems) {
            menuItems.addEventListener('click', (e) => {
                const link = e.target.closest('.nav-menu-link');
                if (link) {
                    const action = link.dataset.action;
                    const phaseId = link.dataset.phaseId;
                    const theme = link.dataset.theme;

                    if (theme) {
                        // Theme selection - don't close menu
                        ThemeManager.setTheme(theme);
                        this.updateThemeButtons();
                        return;
                    }

                    this.closeMenu();

                    if (action === 'home') {
                        this.showView('dashboard');
                        this.renderDashboard();
                    } else if (action === 'import') {
                        this.showImportModal();
                    } else if (action === 'about') {
                        window.location.hash = '#/about';
                    } else if (phaseId) {
                        this.selectPhase(phaseId);
                    }
                }
            });
        }
    },

    /**
     * Toggle the menu open/closed.
     */
    toggleMenu() {
        const hamburger = document.getElementById('nav-menu-toggle');
        const menu = document.getElementById('nav-menu');
        const overlay = document.getElementById('nav-menu-overlay');

        const isOpen = menu.classList.toggle('open');
        hamburger?.classList.toggle('open', isOpen);
        overlay?.classList.toggle('open', isOpen);
        hamburger?.setAttribute('aria-expanded', isOpen.toString());
        menu?.setAttribute('aria-hidden', (!isOpen).toString());

        // Prevent body scroll when menu is open
        document.body.style.overflow = isOpen ? 'hidden' : '';

        // Update theme buttons when opening
        if (isOpen) {
            this.updateThemeButtons();
        }
    },

    /**
     * Close the menu.
     */
    closeMenu() {
        const hamburger = document.getElementById('nav-menu-toggle');
        const menu = document.getElementById('nav-menu');
        const overlay = document.getElementById('nav-menu-overlay');

        hamburger?.classList.remove('open');
        menu?.classList.remove('open');
        overlay?.classList.remove('open');
        hamburger?.setAttribute('aria-expanded', 'false');
        menu?.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    },

    /**
     * Populate the menu with items.
     */
    populateMenu() {
        const menuItems = document.getElementById('nav-menu-items');
        if (!menuItems) return;

        const phases = DataLoader.getPhases();

        // Elegant icons mapping
        const icons = {
            home: '◈',      // Diamond
            import: '↓',     // Down arrow
            about: '○',      // Circle
            theme: {
                light: '◐',  // Half circle
                dark: '●',   // Filled circle
                warm: '◑',   // Quarter circle
                nature: '◒'  // Three quarter
            }
        };

        let html = `
            <!-- Home -->
            <li class="nav-menu-item">
                <button class="nav-menu-link" data-action="home">
                    <span class="nav-menu-icon">${icons.home}</span>
                    <span class="nav-menu-label">Home</span>
                </button>
            </li>
            
            <!-- Import -->
            <li class="nav-menu-item">
                <button class="nav-menu-link" data-action="import">
                    <span class="nav-menu-icon">${icons.import}</span>
                    <span class="nav-menu-label">Import Results</span>
                </button>
            </li>
            
            <!-- Divider -->
            <li class="nav-menu-divider" role="separator"></li>
            
            <!-- Section Label -->
            <li class="nav-menu-section">Questionnaires</li>
        `;

        // Add phase links with elegant icons based on phase data
        phases.forEach(phase => {
            // Use refined icons for phases
            const phaseIcon = this.getPhaseIcon(phase.id);
            html += `
                <li class="nav-menu-item">
                    <button class="nav-menu-link" data-phase-id="${phase.id}">
                        <span class="nav-menu-icon">${phaseIcon}</span>
                        <span class="nav-menu-label">${phase.short_title}</span>
                    </button>
                </li>
            `;
        });

        // Divider and About
        html += `
            <!-- Divider -->
            <li class="nav-menu-divider" role="separator"></li>
            
            <!-- About -->
            <li class="nav-menu-item">
                <button class="nav-menu-link" data-action="about">
                    <span class="nav-menu-icon">${icons.about}</span>
                    <span class="nav-menu-label">About</span>
                </button>
            </li>
            
            <!-- Divider -->
            <li class="nav-menu-divider" role="separator"></li>
            
            <!-- Theme Section -->
            <li class="nav-menu-section">Appearance</li>
            <li class="nav-menu-item">
                <div class="nav-menu-themes" id="nav-menu-themes">
                    <button class="theme-btn" data-theme="light" title="Light mode">
                        <span class="theme-btn-icon">☀</span>
                        <span class="theme-btn-label">Light</span>
                    </button>
                    <button class="theme-btn" data-theme="dark" title="Dark mode">
                        <span class="theme-btn-icon">☽</span>
                        <span class="theme-btn-label">Dark</span>
                    </button>
                    <button class="theme-btn" data-theme="warm" title="Warm mode">
                        <span class="theme-btn-icon">◐</span>
                        <span class="theme-btn-label">Warm</span>
                    </button>
                    <button class="theme-btn" data-theme="nature" title="Nature mode">
                        <span class="theme-btn-icon">❧</span>
                        <span class="theme-btn-label">Nature</span>
                    </button>
                </div>
            </li>
        `;

        menuItems.innerHTML = html;

        // Set up theme button listeners
        this.setupThemeButtons();
    },

    /**
     * Get elegant icon for a phase.
     * @param {string} phaseId - Phase ID
     * @returns {string} Icon character
     */
    getPhaseIcon(phaseId) {
        // Use refined typography symbols instead of emojis
        const phaseIcons = {
            'phase_0': '◇',   // Diamond outline - self-discovery
            'phase_1': '❦',   // Floral heart - alignment
            'phase_1.5': '∞'  // Infinity - building together
        };
        return phaseIcons[phaseId] || '•';
    },

    /**
     * Set up theme button listeners.
     */
    setupThemeButtons() {
        const themeContainer = document.getElementById('nav-menu-themes');
        if (!themeContainer) return;

        themeContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.theme-btn');
            if (btn) {
                const theme = btn.dataset.theme;
                if (theme) {
                    ThemeManager.setTheme(theme);
                    this.updateThemeButtons();
                }
            }
        });

        this.updateThemeButtons();
    },

    /**
     * Update theme buttons to show active state.
     */
    updateThemeButtons() {
        const themeContainer = document.getElementById('nav-menu-themes');
        if (!themeContainer) return;

        const currentTheme = ThemeManager.getTheme();
        themeContainer.querySelectorAll('.theme-btn').forEach(btn => {
            const isActive = btn.dataset.theme === currentTheme;
            btn.classList.toggle('active', isActive);
        });
    },

    /**
     * Select a phase from the menu - goes to welcome page for that phase.
     * @param {string} phaseId - Phase ID to select
     */
    async selectPhase(phaseId) {
        // Check if it's already the current phase
        const currentPhaseId = DataLoader.getCurrentPhaseId();

        if (currentPhaseId !== phaseId) {
            // Switch to the new phase
            DataLoader.setCurrentPhase(phaseId);
            StorageManager.setPhase(phaseId);

            // Load phase data
            await DataLoader.load();

            // Update UI
            this.updatePhaseDisplay();
            this.updateModeOptions();
        }

        // Go to welcome page for this phase
        this.showView('welcome');
    },

    /**
     * Refresh the menu (e.g., after adding new phases).
     */
    refreshMenu() {
        this.populateMenu();
    }
};

// Mix into App when loaded
if (typeof App !== 'undefined') {
    Object.assign(App, AppNavMenu);
}
