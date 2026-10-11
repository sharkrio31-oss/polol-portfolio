import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { World } from './world.js';
import { WorldVoid } from './world_void.js';
import { InteractionManager } from './interactions.js';
import { UI } from './ui.js';

class App {
    constructor() {
        this.container = document.querySelector('#webgl-canvas');
        this.clock = new THREE.Clock();
        
        this.currentTheme = sessionStorage.getItem('polol_theme') || 'pastel';
        this.isSwitching = false;
        
        this.initThree();
        this.initApp();
        this.setupThemeUI();
        
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    initThree() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.set(25, 20, 25);
        this.camera.lookAt(0, 2, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: this.container, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05; 
        this.controls.minDistance = 5;
        this.controls.maxDistance = 85;
        this.controls.target.set(0, 2, 0);

        // Post-processing
        const renderScene = new RenderPass(this.scene, this.camera);
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.6, 0.4, 0.85 
        );

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(this.bloomPass);

        this.lightGroup = new THREE.Group();
        this.scene.add(this.lightGroup);

        this.applyThemeEnvironment();
    }

    applyThemeEnvironment() {
        // Clear previous lights
        while (this.lightGroup.children.length > 0) {
            this.lightGroup.remove(this.lightGroup.children[0]);
        }

        if (this.currentTheme === 'pastel') {
            document.documentElement.classList.remove('void-mode');
            this.scene.background = new THREE.Color(0xFFB6C1);
            this.scene.fog = new THREE.FogExp2(0xFFB6C1, 0.015);
            this.bloomPass.strength = 0.6;
            this.bloomPass.threshold = 0.85;
            this.bloomPass.radius = 0.4;

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            this.dirLight = new THREE.DirectionalLight(0xfffdd0, 1.2); 
            this.dirLight.position.set(20, 30, -10);
            this.dirLight.castShadow = true;
            this.dirLight.shadow.mapSize.width = 2048;
            this.dirLight.shadow.mapSize.height = 2048;
            this.dirLight.shadow.camera.left = -25;
            this.dirLight.shadow.camera.right = 25;
            this.dirLight.shadow.camera.top = 25;
            this.dirLight.shadow.camera.bottom = -25;
            this.dirLight.shadow.camera.far = 100;
            this.dirLight.shadow.bias = -0.0005;
            
            const hemiLight = new THREE.HemisphereLight(0x89cff0, 0xffb6c1, 0.6); 
            this.lightGroup.add(ambientLight, this.dirLight, hemiLight);
            
        } else {
            document.documentElement.classList.add('void-mode');
            this.scene.background = new THREE.Color(0x030306);
            this.scene.fog = new THREE.FogExp2(0x030306, 0.016);
            this.bloomPass.strength = 1.35;
            this.bloomPass.threshold = 0.22;
            this.bloomPass.radius = 0.6;

            const ambientLight = new THREE.AmbientLight(0x14141e, 0.6); 
            
            // Dramatic crimson key light
            this.dirLight = new THREE.DirectionalLight(0xff1544, 1.4); 
            this.dirLight.position.set(-25, 35, 18);
            this.dirLight.castShadow = true;
            this.dirLight.shadow.mapSize.width = 2048;
            this.dirLight.shadow.mapSize.height = 2048;
            this.dirLight.shadow.camera.left = -30;
            this.dirLight.shadow.camera.right = 30;
            this.dirLight.shadow.camera.top = 30;
            this.dirLight.shadow.camera.bottom = -30;
            this.dirLight.shadow.camera.far = 120;
            this.dirLight.shadow.bias = -0.0008;

            // Icy cyan backlight
            const rimLight = new THREE.DirectionalLight(0x00e5ff, 0.8);
            rimLight.position.set(25, 20, -25);

            // Subtle electric violet hemisphere
            const hemiLight = new THREE.HemisphereLight(0x28183c, 0x04040a, 0.5); 
            this.lightGroup.add(ambientLight, this.dirLight, rimLight, hemiLight);
        }
    }

    async initApp() {
        this.ui = new UI();
        
        await this.loadWorld();
        
        this.interactions = new InteractionManager(this.scene, this.camera, this.world.interactables, this.ui, this.controls);

        this.targetCameraPos = new THREE.Vector3(25, 20, 25);
        this.targetLookAt = new THREE.Vector3(0, 2, 0);
        this.isTransitioning = false;

        this.controls.addEventListener('start', () => {
            this.isTransitioning = false;
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                    window.dispatchEvent(new CustomEvent('focusCamera', { detail: 'reset' }));
                }
            }
        });

        // Precise landmark coordinates for both worlds
        window.addEventListener('focusCamera', (e) => {
            const target = e.detail;
            const isVoid = this.currentTheme === 'void';
            
            if (target === 'about') {
                this.isTransitioning = true;
                if (isVoid) {
                    this.targetLookAt.set(0, 2.5, 0);
                    this.targetCameraPos.set(13, 11, 13);
                } else {
                    this.targetLookAt.set(-9, 1, -7);
                    this.targetCameraPos.set(-2, 10, 2);
                }
            } else if (target === 'projects') {
                this.isTransitioning = true;
                if (isVoid) {
                    this.targetLookAt.set(-14, 4.5, -12);
                    this.targetCameraPos.set(-5, 11, -3);
                } else {
                    this.targetLookAt.set(-3, 3, -9);
                    this.targetCameraPos.set(6, 12, 0);
                }
            } else if (target === 'games') {
                this.isTransitioning = true;
                if (isVoid) {
                    this.targetLookAt.set(15, 3.5, 12);
                    this.targetCameraPos.set(8, 11, 23);
                } else {
                    this.targetLookAt.set(-9, 1, 4);
                    this.targetCameraPos.set(-2, 10, 12);
                }
            } else if (target === 'sidequests') {
                this.isTransitioning = true;
                if (isVoid) {
                    this.targetLookAt.set(-15, 4.0, 13);
                    this.targetCameraPos.set(-6, 12, 22);
                } else {
                    this.targetLookAt.set(2, 1, -8);
                    this.targetCameraPos.set(10, 10, 0);
                }
            } else if (target === 'reset') {
                this.isTransitioning = true;
                this.targetLookAt.set(0, 2, 0);
                this.targetCameraPos.set(25, 20, 25);
            }
        });

        window.addEventListener('focusObject', (e) => {
            const pos = e.detail;
            this.isTransitioning = true;
            this.targetLookAt.copy(pos);
            this.targetCameraPos.set(pos.x + 8, pos.y + 6, pos.z + 8);
        });

        setTimeout(() => {
            this.ui.hideLoadingScreen();
            this.animate();
        }, 800);
    }

    setupThemeUI() {
        const btnPastel = document.getElementById('theme-pastel');
        const btnVoid = document.getElementById('theme-void');

        const updateButtons = () => {
            if (this.currentTheme === 'pastel') {
                btnPastel.classList.add('active');
                btnVoid.classList.remove('active');
            } else {
                btnPastel.classList.remove('active');
                btnVoid.classList.add('active');
            }
        };
        updateButtons();

        btnPastel.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.currentTheme !== 'pastel' && !this.isSwitching) {
                this.switchTheme('pastel');
            }
        });

        btnVoid.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.currentTheme !== 'void' && !this.isSwitching) {
                this.switchTheme('void');
            }
        });
    }

    async switchTheme(newTheme) {
        if (this.isSwitching || this.currentTheme === newTheme) return;
        this.isSwitching = true;
        this.currentTheme = newTheme;
        sessionStorage.setItem('polol_theme', newTheme);
        
        // Update button visual state immediately
        const btnPastel = document.getElementById('theme-pastel');
        const btnVoid = document.getElementById('theme-void');
        if (newTheme === 'pastel') {
            btnPastel.classList.add('active');
            btnVoid.classList.remove('active');
        } else {
            btnPastel.classList.remove('active');
            btnVoid.classList.add('active');
        }

        // Smooth transition overlay
        const overlay = document.createElement('div');
        overlay.id = 'theme-transition-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = '#030306';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.35s ease-in-out';
        overlay.style.zIndex = '9999';
        overlay.style.pointerEvents = 'all';
        document.body.appendChild(overlay);

        // Fade out
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });

        setTimeout(async () => {
            // Clean up previous world
            if (this.world) {
                if (typeof this.world.destroy === 'function') {
                    this.world.destroy();
                }
                
                // Remove all non-light objects from the scene
                const objectsToRemove = [];
                this.scene.children.forEach(child => {
                    if (child !== this.lightGroup) {
                        objectsToRemove.push(child);
                    }
                });
                objectsToRemove.forEach(obj => this.scene.remove(obj));
            }

            // Apply environment lighting & fog
            this.applyThemeEnvironment();

            // Load new world
            await this.loadWorld();
            
            // Connect interactables
            if (this.interactions) {
                this.interactions.interactables = this.world.interactables;
                this.interactions.resetHover();
            }

            // Close any open panels from previous world
            if (this.ui) {
                this.ui.closeAllPanels();
            }

            // Reset camera to default view smoothly
            this.targetLookAt.set(0, 2, 0);
            this.targetCameraPos.set(25, 20, 25);
            this.isTransitioning = true;

            // Fade back in
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                this.isSwitching = false;
            }, 350);

        }, 350);
    }

    async loadWorld() {
        if (this.currentTheme === 'pastel') {
            this.world = new World(this.scene);
        } else {
            this.world = new WorldVoid(this.scene);
        }
        await this.world.generate();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const deltaTime = this.clock.getDelta();

        if (this.isTransitioning && this.targetCameraPos && this.targetLookAt) {
            this.camera.position.lerp(this.targetCameraPos, 0.05);
            this.controls.target.lerp(this.targetLookAt, 0.05);

            if (this.camera.position.distanceTo(this.targetCameraPos) < 0.1) {
                this.isTransitioning = false;
            }
        }

        this.controls.update();

        if (this.world) this.world.update(deltaTime);
        if (this.interactions) this.interactions.update();

        this.composer.render();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new App();
});
