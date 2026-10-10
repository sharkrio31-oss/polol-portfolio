export class UI {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.progressBar = document.getElementById('progress-bar');
        this.loadingText = document.getElementById('loading-text');
        this.uiLayer = document.getElementById('ui-layer');
        this.tooltip = document.getElementById('tooltip');
        
        this.panels = {
            'projects': document.getElementById('panel-projects'),
            'about': document.getElementById('panel-about'),
            'gd': document.getElementById('panel-gd'),
            'bs': document.getElementById('panel-bs'),
            'genshin': document.getElementById('panel-genshin'),
            'roblox': document.getElementById('panel-roblox'),
            'math': document.getElementById('panel-math'),
            'physics': document.getElementById('panel-physics'),
            'pc': document.getElementById('panel-pc'),
            'ai': document.getElementById('panel-ai'),
            'music': document.getElementById('panel-music'),
            'cat': document.getElementById('panel-cat')
        };

        this.catMessages = [
            "Hi, I'm Polol! I like building cozy things on the internet.",
            "Meow! Have you explored my side quests yet?",
            "I'm probably tinkering with some AI right now...",
            "Click on the glowing stars to collect them!",
            "I should be sleeping, but I'm coding instead."
        ];

        this.helpPanel = document.getElementById('help-panel');
        this.starCountEl = document.getElementById('star-count');
        
        this.isPanelOpen = false;
        this.starsCollected = 0;

        this.initEvents();
    }

    initEvents() {
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeAllPanels();
            });
        });

        document.getElementById('help-btn').addEventListener('click', () => {
            this.helpPanel.classList.toggle('hidden');
        });

        document.getElementById('reset-cam-btn').addEventListener('click', () => {
            window.dispatchEvent(new Event('focusCamera'));
            this.helpPanel.classList.add('hidden');
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllPanels();
                this.helpPanel.classList.add('hidden');
            }
        });

        // Nav menu buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.getAttribute('data-target');
                if(target) {
                    // For nav menu, just dispatch event to move camera
                    // and maybe open main panels
                    window.dispatchEvent(new CustomEvent('focusCamera', { detail: target }));
                }
            });
        });
    }

    updateProgress(percent, text) {
        this.progressBar.style.width = `${percent}%`;
        this.loadingText.textContent = text;
    }

    hideLoadingScreen() {
        this.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            this.loadingScreen.style.visibility = 'hidden';
            this.uiLayer.classList.remove('hidden');
        }, 1000);
    }

    showTooltip(text) {
        this.tooltip.textContent = text;
        this.tooltip.classList.remove('hidden');
    }

    hideTooltip() {
        this.tooltip.classList.add('hidden');
    }

    collectStar() {
        this.starsCollected++;
        this.starCountEl.textContent = this.starsCollected;
        
        // Visual pop effect
        const counter = document.getElementById('star-counter');
        counter.style.transform = 'scale(1.5)';
        setTimeout(() => {
            counter.style.transform = 'scale(1)';
        }, 200);
    }

    showPanel(id) {
        let targetId = id;
        
        if (id === 'cat') {
            // Randomize cat message
            const msg = this.catMessages[Math.floor(Math.random() * this.catMessages.length)];
            document.getElementById('cat-text').textContent = `"${msg}"`;
        }

        if (this.panels[targetId]) {
            this.closeAllPanels(targetId);
            
            const panel = this.panels[targetId];
            panel.classList.remove('hidden');
            // Force reflow to ensure transition runs
            void panel.offsetWidth;
            panel.classList.add('active');
            
            this.isPanelOpen = true;
            this.hideTooltip();
        }
    }

    closeAllPanels(exceptId = null) {
        Object.keys(this.panels).forEach(key => {
            if (key === exceptId) return;
            const panel = this.panels[key];
            if (panel && !panel.classList.contains('hidden')) {
                panel.classList.remove('active');
                setTimeout(() => {
                    if (!panel.classList.contains('active')) {
                        panel.classList.add('hidden');
                    }
                }, 300);
            }
        });
        
        if (!exceptId) {
            this.isPanelOpen = false;
        }
    }
}
