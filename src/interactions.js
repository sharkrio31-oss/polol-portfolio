import * as THREE from 'three';

export class InteractionManager {
    constructor(scene, camera, interactables, ui, controls) {
        this.scene = scene;
        this.camera = camera;
        this.interactables = interactables;
        this.ui = ui;
        this.controls = controls;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.hoveredObject = null;
        this.originalEmissive = new Map();
        this.pointerDownPos = new THREE.Vector2();

        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('pointerdown', this.onPointerDown.bind(this));
        window.addEventListener('click', this.onClick.bind(this));
        window.addEventListener('dblclick', this.onDoubleClick.bind(this));
        window.addEventListener('touchstart', this.onTouch.bind(this), {passive: false});
    }

    onPointerDown(event) {
        this.pointerDownPos.set(event.clientX, event.clientY);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onTouch(event) {
        if(event.touches.length > 0) {
            this.mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
            this.pointerDownPos.set(event.touches[0].clientX, event.touches[0].clientY);
        }
    }

    onClick(event) {
        // Ignore clicks that were actually camera drags
        if (event && event.clientX !== undefined) {
            const dist = Math.hypot(event.clientX - this.pointerDownPos.x, event.clientY - this.pointerDownPos.y);
            if (dist > 5) return;
        }

        if (this.ui.isPanelOpen) {
            // Close if clicking outside UI panels (e.g., clicking on the canvas directly)
            if (event && event.target && event.target.tagName === 'CANVAS') {
                this.ui.closeAllPanels();
            }
            return;
        }

        // Ensure we only raycast when clicking the canvas, ignoring clicks originating from UI overlay
        if (event && event.target && event.target.tagName !== 'CANVAS') {
            return;
        }

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactables, false);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            const id = object.userData.id;

            if (id === 'star') {
                this.ui.collectStar();
                object.visible = false;
                const index = this.interactables.indexOf(object);
                if (index > -1) this.interactables.splice(index, 1);
                this.resetHover();
            } else if (id === 'portal') {
                this.ui.showTooltip("Whoosh!");
            } else if (id) {
                this.ui.showPanel(id);
                // Do not instantly snap the camera on single click, let manual control or double-click handle it
            }
        }
    }

    onDoubleClick(event) {
        if (this.ui.isPanelOpen) return;
        if (event && event.target && event.target.tagName !== 'CANVAS') return;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactables, false);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData.id) {
                window.dispatchEvent(new CustomEvent('focusObject', { detail: object.position }));
            }
        }
    }

    update() {
        if (this.ui.isPanelOpen) {
            this.resetHover();
            return;
        }

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactables, false);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            
            if (this.hoveredObject !== object) {
                this.resetHover();
                this.hoveredObject = object;
                
                if (object.material && object.material.emissive) {
                    this.originalEmissive.set(object, object.material.emissive.getHex());
                    object.material.emissive.setHex(0x555555);
                }

                this.ui.showTooltip(object.userData.label || "Interact");
                document.body.style.cursor = 'pointer';
            }
        } else {
            this.resetHover();
        }
    }

    resetHover() {
        if (this.hoveredObject) {
            if (this.hoveredObject.material && this.originalEmissive.has(this.hoveredObject)) {
                this.hoveredObject.material.emissive.setHex(this.originalEmissive.get(this.hoveredObject));
            }
            this.hoveredObject = null;
            this.ui.hideTooltip();
            document.body.style.cursor = 'default';
        }
    }
}
