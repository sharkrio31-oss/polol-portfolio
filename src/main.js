import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { World } from './world.js';
import { InteractionManager } from './interactions.js';
import { UI } from './ui.js';

class App {
    constructor() {
        this.container = document.querySelector('#webgl-canvas');
        this.clock = new THREE.Clock();
        
        this.initThree();
        this.initApp();
        
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    initThree() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xFFB6C1); // Soft pink background
        this.scene.fog = new THREE.FogExp2(0xFFB6C1, 0.015);

        // Camera (Isometric perspective)
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.set(25, 20, 25);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: this.container, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Controls (Orbit)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below ground
        this.controls.minDistance = 5;
        this.controls.maxDistance = 80;
        this.controls.target.set(0, 2, 0);

        // Post-processing
        const renderScene = new RenderPass(this.scene, this.camera);
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.6,  // strength
            0.4,  // radius
            0.85  // threshold
        );

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Main sunset directional light
        this.dirLight = new THREE.DirectionalLight(0xfffdd0, 1.2); 
        this.dirLight.position.set(20, 30, -10);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 2048;
        this.dirLight.shadow.mapSize.height = 2048;
        const d = 25;
        this.dirLight.shadow.camera.left = -d;
        this.dirLight.shadow.camera.right = d;
        this.dirLight.shadow.camera.top = d;
        this.dirLight.shadow.camera.bottom = -d;
        this.dirLight.shadow.camera.far = 100;
        this.dirLight.shadow.bias = -0.0005;
        this.scene.add(this.dirLight);

        // Fill light
        const hemiLight = new THREE.HemisphereLight(0x89cff0, 0xffb6c1, 0.6); 
        this.scene.add(hemiLight);
    }

    async initApp() {
        this.ui = new UI();
        
        this.ui.updateProgress(10, "Building diorama...");
        this.world = new World(this.scene);
        await this.world.generate();
        
        this.ui.updateProgress(70, "Setting up interactions...");
        this.interactions = new InteractionManager(this.scene, this.camera, this.world.interactables, this.ui, this.controls);

        this.ui.updateProgress(100, "Done!");
        
        this.targetCameraPos = new THREE.Vector3(25, 20, 25);
        this.targetLookAt = new THREE.Vector3(0, 2, 0);
        this.isTransitioning = false;

        // Stop transitions if the user manually moves the camera
        this.controls.addEventListener('start', () => {
            this.isTransitioning = false;
        });

        // Press 'R' to reset camera
        window.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                // Ensure no inputs are focused before resetting (e.g. if we had a form)
                if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                    window.dispatchEvent(new CustomEvent('focusCamera', { detail: 'reset' }));
                }
            }
        });

        // Listen for camera focus events from UI
        window.addEventListener('focusCamera', (e) => {
            const target = e.detail;
            if (target === 'about') {
                this.isTransitioning = true;
                this.targetLookAt.set(-9, 1, -7);
                this.targetCameraPos.set(-2, 10, 2);
            } else if (target === 'projects') {
                this.isTransitioning = true;
                this.targetLookAt.set(-3, 3, -9);
                this.targetCameraPos.set(6, 12, 0);
            } else if (target === 'games') {
                this.isTransitioning = true;
                this.targetLookAt.set(-9, 1, 4);
                this.targetCameraPos.set(-2, 10, 12);
            } else if (target === 'sidequests') {
                this.isTransitioning = true;
                this.targetLookAt.set(2, 1, -8);
                this.targetCameraPos.set(10, 10, 0);
            } else if (target === 'reset') {
                this.isTransitioning = true;
                this.targetLookAt.set(0, 2, 0);
                this.targetCameraPos.set(25, 20, 25);
            }
        });

        // Listen for double-click focus events on objects
        window.addEventListener('focusObject', (e) => {
            const pos = e.detail;
            this.isTransitioning = true;
            this.targetLookAt.copy(pos);
            // Move camera slightly above and away from the object for a good view
            this.targetCameraPos.set(pos.x + 8, pos.y + 6, pos.z + 8);
        });

        setTimeout(() => {
            this.ui.hideLoadingScreen();
            this.animate();
        }, 800);
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

        // Smooth camera transitions only when actively transitioning
        if (this.isTransitioning && this.targetCameraPos && this.targetLookAt) {
            this.camera.position.lerp(this.targetCameraPos, 0.05);
            this.controls.target.lerp(this.targetLookAt, 0.05);

            // If we've reached the target closely enough, stop lerping to free up controls
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
