import * as THREE from 'three';

export class WorldVoid {
    constructor(scene) {
        this.scene = scene;
        this.interactables = [];
        this.animatedObjects = [];
        this.disposables = [];
        this.cats = [];
        
        // Dark theme materials
        this.materials = {
            obsidian: new THREE.MeshStandardMaterial({ color: 0x0c0c10, roughness: 0.15, metalness: 0.85 }),
            darkRock: new THREE.MeshStandardMaterial({ color: 0x16161b, roughness: 0.95, flatShading: true }),
            graphite: new THREE.MeshStandardMaterial({ color: 0x222228, roughness: 0.6, metalness: 0.6 }),
            neonCrimson: new THREE.MeshStandardMaterial({ color: 0xff003c, emissive: 0xff003c, emissiveIntensity: 2.2 }),
            neonViolet: new THREE.MeshStandardMaterial({ color: 0x8a2be2, emissive: 0x8a2be2, emissiveIntensity: 1.8 }),
            neonCyan: new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 1.6 }),
            glassBlack: new THREE.MeshPhysicalMaterial({ color: 0x050508, metalness: 0.9, roughness: 0.05, transmission: 0.85, thickness: 0.6 }),
            metalDark: new THREE.MeshStandardMaterial({ color: 0x18181f, metalness: 0.95, roughness: 0.25 }),
            metalFins: new THREE.MeshStandardMaterial({ color: 0x282830, metalness: 0.8, roughness: 0.4 }),
            screenRed: new THREE.MeshBasicMaterial({ color: 0xff2a3a }),
            catCyber: new THREE.MeshStandardMaterial({ color: 0x0e0e12, metalness: 0.85, roughness: 0.18 }),
            catHolo: new THREE.MeshBasicMaterial({ color: 0xff003c, transparent: true, opacity: 0.85, wireframe: true }),
            cityTower: new THREE.MeshStandardMaterial({ color: 0x0a0a0e, roughness: 0.9, metalness: 0.5 }),
            cityWindow: new THREE.MeshBasicMaterial({ color: 0xff003c }),
            cityWindowCyan: new THREE.MeshBasicMaterial({ color: 0x00f0ff })
        };

        // Track materials for disposal
        Object.values(this.materials).forEach(mat => this.disposables.push(mat));
    }

    async generate() {
        return new Promise((resolve) => {
            this.createNexus();
            this.createVault();
            this.createArena();
            this.createLogicChamber();
            this.createObservatory();
            this.createHiddenChamber();
            this.createBridges();
            this.createCats();
            this.createSign();
            this.createStars();
            this.createCitySkyline();
            this.createStarfield();
            this.createFloatingParticles();
            resolve();
        });
    }

    track(mesh) {
        if (mesh.geometry) this.disposables.push(mesh.geometry);
        if (mesh.material && !Array.isArray(mesh.material)) {
            // Already tracked in materials map or tracked here
        }
        return mesh;
    }

    castAndReceive(obj) {
        obj.traverse((child) => {
            if (child.isMesh && (!child.material || child.material.emissiveIntensity === undefined || child.material.emissiveIntensity < 0.5)) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    makeInteractive(mesh, id, label) {
        mesh.userData = { id, label };
        this.interactables.push(mesh);
        return mesh;
    }

    makeGroupInteractive(group, id, label) {
        group.traverse((child) => {
            if (child.isMesh) {
                child.userData = { id, label };
                this.interactables.push(child);
            }
        });
    }

    // 1. CENTRAL NEXUS
    createNexus() {
        const group = new THREE.Group();
        
        // Massive faceted rocky island base
        const islandGeo = new THREE.CylinderGeometry(26, 8, 14, 10, 4);
        // Perturb vertices slightly for jagged rocky cliff feel
        const posAttr = islandGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            const y = posAttr.getY(i);
            if (y < 0) {
                posAttr.setX(i, posAttr.getX(i) + (Math.sin(i * 1.7) * 2.2));
                posAttr.setZ(i, posAttr.getZ(i) + (Math.cos(i * 2.3) * 2.2));
            }
        }
        islandGeo.computeVertexNormals();
        islandGeo.translate(0, -7, 0);
        this.track(new THREE.Mesh(islandGeo));
        const island = new THREE.Mesh(islandGeo, this.materials.darkRock);
        group.add(island);

        // Black glass central plaza
        const platformGeo = new THREE.CylinderGeometry(19, 21, 0.8, 8);
        platformGeo.translate(0, 0.4, 0);
        this.track(new THREE.Mesh(platformGeo));
        const platform = new THREE.Mesh(platformGeo, this.materials.obsidian);
        group.add(platform);

        // Glowing crimson fissure runes embedded in the plaza
        const fissureGeo1 = new THREE.TorusGeometry(14, 0.15, 6, 8);
        fissureGeo1.rotateX(Math.PI / 2);
        fissureGeo1.translate(0, 0.82, 0);
        this.track(new THREE.Mesh(fissureGeo1));
        const fissure1 = new THREE.Mesh(fissureGeo1, this.materials.neonCrimson);
        
        const fissureGeo2 = new THREE.TorusGeometry(7, 0.12, 6, 6);
        fissureGeo2.rotateX(Math.PI / 2);
        fissureGeo2.translate(0, 0.82, 0);
        this.track(new THREE.Mesh(fissureGeo2));
        const fissure2 = new THREE.Mesh(fissureGeo2, this.materials.neonCrimson);

        // Cross fissures
        for (let a = 0; a < 4; a++) {
            const beamGeo = new THREE.BoxGeometry(0.25, 0.1, 12);
            beamGeo.rotateY((a * Math.PI) / 4);
            beamGeo.translate(0, 0.82, 0);
            this.track(new THREE.Mesh(beamGeo));
            const beam = new THREE.Mesh(beamGeo, this.materials.neonCrimson);
            group.add(beam);
        }

        group.add(fissure1, fissure2);

        // Central Holographic Spire (About Me landmark)
        const spireGroup = new THREE.Group();
        spireGroup.position.set(0, 0.8, 0);

        // Brutalist hexagonal pedestal
        const pedGeo = new THREE.CylinderGeometry(2.5, 3.2, 1.6, 6);
        pedGeo.translate(0, 0.8, 0);
        this.track(new THREE.Mesh(pedGeo));
        const pedestal = new THREE.Mesh(pedGeo, this.materials.metalDark);
        spireGroup.add(pedestal);

        // Monolithic obelisk spire
        const obeliskGeo = new THREE.CylinderGeometry(0.6, 1.4, 7, 4);
        obeliskGeo.translate(0, 5.1, 0);
        obeliskGeo.rotateY(Math.PI / 4);
        this.track(new THREE.Mesh(obeliskGeo));
        const obelisk = new THREE.Mesh(obeliskGeo, this.materials.obsidian);
        spireGroup.add(obelisk);

        // Floating energy core
        const coreGeo = new THREE.OctahedronGeometry(1.0);
        this.track(new THREE.Mesh(coreGeo));
        const core = new THREE.Mesh(coreGeo, this.materials.neonCrimson);
        core.position.set(0, 9.5, 0);
        spireGroup.add(core);

        // Rotating data ring around the obelisk
        const ringGeo = new THREE.TorusGeometry(2.2, 0.08, 8, 32);
        ringGeo.rotateX(Math.PI / 2);
        this.track(new THREE.Mesh(ringGeo));
        const ring = new THREE.Mesh(ringGeo, this.materials.neonCyan);
        ring.position.set(0, 5.5, 0);
        spireGroup.add(ring);

        // Glowing interactive terminal display
        const termGeo = new THREE.BoxGeometry(1.4, 1.0, 0.3);
        termGeo.rotateX(-0.3);
        termGeo.translate(0, 2.2, 2.6);
        this.track(new THREE.Mesh(termGeo));
        const term = new THREE.Mesh(termGeo, this.materials.screenRed);
        spireGroup.add(term);

        group.add(spireGroup);
        this.castAndReceive(group);
        this.scene.add(group);

        // Interactable registration
        this.makeInteractive(pedestal, 'about', 'Central Nexus // About Polol');
        this.makeInteractive(obelisk, 'about', 'Central Nexus // About Polol');
        this.makeInteractive(core, 'about', 'Central Nexus // About Polol');
        this.makeInteractive(term, 'about', 'Central Nexus // About Polol');

        this.animatedObjects.push({ obj: fissure1, type: 'pulse_glow' });
        this.animatedObjects.push({ obj: fissure2, type: 'pulse_glow', offset: 1.5 });
        this.animatedObjects.push({ obj: core, type: 'spin_hover', speed: 1.5 });
        this.animatedObjects.push({ obj: ring, type: 'spin_y', speed: 2.0 });
    }

    // 2. PROJECT VAULT (PolAI & Projects)
    createVault() {
        const vault = new THREE.Group();
        vault.position.set(-14, 0.8, -12);

        // Vault Base Platform
        const baseGeo = new THREE.BoxGeometry(10, 1.2, 10);
        this.track(new THREE.Mesh(baseGeo));
        const base = new THREE.Mesh(baseGeo, this.materials.obsidian);
        vault.add(base);

        // Server Monoliths (Twin brutalist computing stacks)
        const stackGeo = new THREE.BoxGeometry(2.2, 8.5, 2.2);
        this.track(new THREE.Mesh(stackGeo));
        const stackL = new THREE.Mesh(stackGeo, this.materials.metalDark);
        stackL.position.set(-3.2, 4.85, 0);
        const stackR = new THREE.Mesh(stackGeo, this.materials.metalDark);
        stackR.position.set(3.2, 4.85, 0);
        vault.add(stackL, stackR);

        // Vertical glowing red LED slits on stacks
        for (let i = 0; i < 4; i++) {
            const slitGeo = new THREE.BoxGeometry(0.1, 1.4, 0.1);
            this.track(new THREE.Mesh(slitGeo));
            const slitL = new THREE.Mesh(slitGeo, this.materials.neonCrimson);
            slitL.position.set(-2.05, 2.5 + i * 1.6, 1.12);
            const slitR = new THREE.Mesh(slitGeo, this.materials.neonCrimson);
            slitR.position.set(2.05, 2.5 + i * 1.6, 1.12);
            vault.add(slitL, slitR);
        }

        // Suspended PolAI Quantum Core (Centerpiece)
        const coreGroup = new THREE.Group();
        coreGroup.position.set(0, 5.0, 0);

        const outerCoreGeo = new THREE.IcosahedronGeometry(1.6, 0);
        this.track(new THREE.Mesh(outerCoreGeo));
        const outerCore = new THREE.Mesh(outerCoreGeo, this.materials.glassBlack);

        const innerCoreGeo = new THREE.OctahedronGeometry(1.1);
        this.track(new THREE.Mesh(innerCoreGeo));
        const innerCore = new THREE.Mesh(innerCoreGeo, this.materials.neonViolet);

        const ringAGeo = new THREE.TorusGeometry(2.5, 0.08, 8, 32);
        this.track(new THREE.Mesh(ringAGeo));
        const ringA = new THREE.Mesh(ringAGeo, this.materials.neonCyan);
        ringA.rotation.x = Math.PI / 3;

        const ringB = new THREE.TorusGeometry(3.1, 0.06, 8, 32);
        this.track(new THREE.Mesh(ringB));
        const ringB = new THREE.Mesh(ringB, this.materials.neonCrimson);
        ringB.rotation.y = Math.PI / 4;

        coreGroup.add(outerCore, innerCore, ringA, ringB);
        vault.add(coreGroup);

        // Holographic Terminal Stand
        const standGeo = new THREE.BoxGeometry(1.6, 2.2, 0.8);
        this.track(new THREE.Mesh(standGeo));
        const stand = new THREE.Mesh(standGeo, this.materials.metalDark);
        stand.position.set(0, 1.7, 3.5);
        
        const screenGeo = new THREE.PlaneGeometry(1.4, 0.9);
        screenGeo.rotateX(-0.35);
        this.track(new THREE.Mesh(screenGeo));
        const screen = new THREE.Mesh(screenGeo, this.materials.screenRed);
        screen.position.set(0, 2.85, 3.5);
        vault.add(stand, screen);

        this.castAndReceive(vault);
        this.scene.add(vault);

        // Make elements interactive
        this.makeInteractive(outerCore, 'projects', 'Project Vault // PolAI Core');
        this.makeInteractive(innerCore, 'projects', 'Project Vault // PolAI Core');
        this.makeInteractive(stand, 'projects', 'Project Vault // Showcase Terminal');
        this.makeInteractive(screen, 'projects', 'Project Vault // Showcase Terminal');
        this.makeInteractive(stackL, 'projects', 'Project Vault // Neural Storage');
        this.makeInteractive(stackR, 'projects', 'Project Vault // Neural Storage');

        this.animatedObjects.push({ obj: coreGroup, type: 'hover_slow', speed: 1.2 });
        this.animatedObjects.push({ obj: innerCore, type: 'spin_complex', speed: 1.5 });
        this.animatedObjects.push({ obj: ringA, type: 'spin_fast_y', speed: 2.2 });
        this.animatedObjects.push({ obj: ringB, type: 'spin_slow_x', speed: 1.6 });
    }

    // 3. GAMING ARENA (GD, Blood Strike, Genshin, Roblox)
    createArena() {
        const arena = new THREE.Group();
        arena.position.set(15, 0.8, 12);

        // Octagonal Battle Arena Platform
        const arenaGeo = new THREE.CylinderGeometry(9, 10, 1.2, 8);
        this.track(new THREE.Mesh(arenaGeo));
        const platform = new THREE.Mesh(arenaGeo, this.materials.obsidian);
        arena.add(platform);

        // Glowing boundary perimeter
        const borderGeo = new THREE.TorusGeometry(8.5, 0.12, 6, 8);
        borderGeo.rotateX(Math.PI / 2);
        borderGeo.translate(0, 0.62, 0);
        this.track(new THREE.Mesh(borderGeo));
        const border = new THREE.Mesh(borderGeo, this.materials.neonCrimson);
        arena.add(border);

        // Four corner energy pylons
        const pylonPositions = [
            [-5.5, -5.5], [5.5, -5.5], [-5.5, 5.5], [5.5, 5.5]
        ];
        pylonPositions.forEach(p => {
            const pylGeo = new THREE.BoxGeometry(0.8, 3.5, 0.8);
            this.track(new THREE.Mesh(pylGeo));
            const pyl = new THREE.Mesh(pylGeo, this.materials.metalDark);
            pyl.position.set(p[0], 2.3, p[1]);
            
            const tipGeo = new THREE.OctahedronGeometry(0.3);
            this.track(new THREE.Mesh(tipGeo));
            const tip = new THREE.Mesh(tipGeo, this.materials.neonCyan);
            tip.position.set(p[0], 4.4, p[1]);
            arena.add(pyl, tip);
        });

        // 1. Geometry Dash (Neon Crimson Crystalline Spike & Cube)
        const gdGroup = new THREE.Group();
        gdGroup.position.set(-3.5, 1.8, -3.0);
        
        const spikeGeo = new THREE.ConeGeometry(0.9, 2.2, 4);
        this.track(new THREE.Mesh(spikeGeo));
        const spike = new THREE.Mesh(spikeGeo, this.materials.neonCrimson);
        spike.position.y = 1.1;

        const gdCubeGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
        this.track(new THREE.Mesh(gdCubeGeo));
        const gdCube = new THREE.Mesh(gdCubeGeo, this.materials.obsidian);
        gdCube.position.set(0, 2.8, 0);
        const gdEdges = new THREE.LineSegments(new THREE.EdgesGeometry(gdCubeGeo), new THREE.LineBasicMaterial({ color: 0xff003c, linewidth: 2 }));
        gdCube.add(gdEdges);

        gdGroup.add(spike, gdCube);
        arena.add(gdGroup);
        this.makeInteractive(spike, 'gd', 'Geometry Dash // Demon Arena');
        this.makeInteractive(gdCube, 'gd', 'Geometry Dash // Demon Arena');

        // 2. Blood Strike (Holographic Tactical Reticle & Module)
        const bsGroup = new THREE.Group();
        bsGroup.position.set(3.5, 1.8, -3.0);

        const reticleGeo = new THREE.RingGeometry(0.7, 0.95, 24);
        this.track(new THREE.Mesh(reticleGeo));
        const reticle = new THREE.Mesh(reticleGeo, this.materials.neonCyan);
        reticle.position.y = 2.0;

        const bsCoreGeo = new THREE.BoxGeometry(1.2, 1.8, 0.8);
        this.track(new THREE.Mesh(bsCoreGeo));
        const bsCore = new THREE.Mesh(bsCoreGeo, this.materials.metalDark);
        bsCore.position.y = 0.9;
        
        bsGroup.add(reticle, bsCore);
        arena.add(bsGroup);
        this.makeInteractive(reticle, 'bs', 'Blood Strike // Tactical Module');
        this.makeInteractive(bsCore, 'bs', 'Blood Strike // Tactical Module');

        // 3. Genshin Impact (Abyssal Primogem / Electro Crystal)
        const genshinGroup = new THREE.Group();
        genshinGroup.position.set(-3.5, 1.8, 3.0);

        const crystalGeo = new THREE.OctahedronGeometry(1.3);
        crystalGeo.scale(0.8, 1.5, 0.8);
        this.track(new THREE.Mesh(crystalGeo));
        const crystal = new THREE.Mesh(crystalGeo, this.materials.neonViolet);
        crystal.position.y = 2.2;

        const baseCrystGeo = new THREE.CylinderGeometry(1.2, 1.5, 0.8, 6);
        this.track(new THREE.Mesh(baseCrystGeo));
        const baseCryst = new THREE.Mesh(baseCrystGeo, this.materials.obsidian);
        baseCryst.position.y = 0.4;

        genshinGroup.add(crystal, baseCryst);
        arena.add(genshinGroup);
        this.makeInteractive(crystal, 'genshin', 'Genshin Impact // Abyssal Crystal');
        this.makeInteractive(baseCryst, 'genshin', 'Genshin Impact // Abyssal Crystal');

        // 4. Roblox (Brutalist Dark Block with Neon Edges & Studs)
        const robloxGroup = new THREE.Group();
        robloxGroup.position.set(3.5, 1.8, 3.0);

        const rbxGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
        this.track(new THREE.Mesh(rbxGeo));
        const rbx = new THREE.Mesh(rbxGeo, this.materials.obsidian);
        rbx.position.y = 1.0;

        // Stud on top
        const studGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
        this.track(new THREE.Mesh(studGeo));
        const stud = new THREE.Mesh(studGeo, this.materials.neonCrimson);
        stud.position.set(0, 1.05, 0);
        rbx.add(stud);

        const rbxEdges = new THREE.LineSegments(new THREE.EdgesGeometry(rbxGeo), new THREE.LineBasicMaterial({ color: 0xff003c, linewidth: 2 }));
        rbx.add(rbxEdges);

        robloxGroup.add(rbx);
        arena.add(robloxGroup);
        this.makeInteractive(rbx, 'roblox', 'Roblox // Developer Block');
        this.makeInteractive(stud, 'roblox', 'Roblox // Developer Block');

        this.castAndReceive(arena);
        this.scene.add(arena);

        this.animatedObjects.push({ obj: border, type: 'pulse_glow' });
        this.animatedObjects.push({ obj: gdCube, type: 'spin_y', speed: 2.0 });
        this.animatedObjects.push({ obj: reticle, type: 'spin_y', speed: 1.5 });
        this.animatedObjects.push({ obj: crystal, type: 'spin_hover', speed: 1.8 });
    }

    // 4. LOGIC CHAMBER (Math, Physics, PC, AI, Music)
    createLogicChamber() {
        const chamber = new THREE.Group();
        chamber.position.set(-15, 0.8, 13);

        // Stepped brutalist dark stone platform
        const platGeo = new THREE.BoxGeometry(12, 1.2, 12);
        this.track(new THREE.Mesh(platGeo));
        const platform = new THREE.Mesh(platGeo, this.materials.obsidian);
        chamber.add(platform);

        // Staggered brutalist pillars
        const createPillar = (x, z, h) => {
            const pGeo = new THREE.BoxGeometry(1.6, h, 1.6);
            this.track(new THREE.Mesh(pGeo));
            const p = new THREE.Mesh(pGeo, this.materials.metalDark);
            p.position.set(x, h / 2 + 0.6, z);
            chamber.add(p);
            return p;
        };

        const pil1 = createPillar(-3.5, -3.5, 4.0);
        const pil2 = createPillar(3.5, -3.5, 3.2);
        const pil3 = createPillar(-3.5, 3.5, 4.8);
        const pil4 = createPillar(3.5, 3.5, 3.6);
        const pil5 = createPillar(0, 0, 2.4);

        // 1. Math: Tesseract / 4D Hypercube wireframe
        const mathGroup = new THREE.Group();
        mathGroup.position.set(-3.5, 5.8, -3.5);
        
        const outerBoxGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
        this.track(new THREE.Mesh(outerBoxGeo));
        const outerBox = new THREE.Mesh(outerBoxGeo, this.materials.catHolo);
        
        const innerBoxGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
        this.track(new THREE.Mesh(innerBoxGeo));
        const innerBox = new THREE.Mesh(innerBoxGeo, this.materials.neonCyan);

        mathGroup.add(outerBox, innerBox);
        chamber.add(mathGroup);
        this.makeInteractive(outerBox, 'math', 'Logic Chamber // Mathematics & Tesseract');
        this.makeInteractive(innerBox, 'math', 'Logic Chamber // Mathematics & Tesseract');

        // 2. Physics: Dark Matter Singularity Sphere & Accretion Ring
        const physGroup = new THREE.Group();
        physGroup.position.set(3.5, 4.8, -3.5);

        const sphereGeo = new THREE.SphereGeometry(1.1, 32, 32);
        this.track(new THREE.Mesh(sphereGeo));
        const singularity = new THREE.Mesh(sphereGeo, this.materials.glassBlack);

        const accrGeo = new THREE.RingGeometry(1.3, 1.8, 32);
        accrGeo.rotateX(Math.PI / 3);
        this.track(new THREE.Mesh(accrGeo));
        const accretion = new THREE.Mesh(accrGeo, this.materials.neonViolet);

        physGroup.add(singularity, accretion);
        chamber.add(physGroup);
        this.makeInteractive(singularity, 'physics', 'Logic Chamber // Singularity Physics');
        this.makeInteractive(accretion, 'physics', 'Logic Chamber // Singularity Physics');

        // 3. PC: Liquid-Cooled Rig / Server Chassis
        const pcGroup = new THREE.Group();
        pcGroup.position.set(-3.5, 6.4, 3.5);

        const rigGeo = new THREE.BoxGeometry(1.8, 2.6, 1.4);
        this.track(new THREE.Mesh(rigGeo));
        const rig = new THREE.Mesh(rigGeo, this.materials.metalDark);

        const tubeGeo = new THREE.TorusGeometry(0.8, 0.08, 8, 16);
        tubeGeo.rotateY(Math.PI / 2);
        this.track(new THREE.Mesh(tubeGeo));
        const tube = new THREE.Mesh(tubeGeo, this.materials.neonCrimson);
        tube.position.x = 0.92;

        pcGroup.add(rig, tube);
        chamber.add(pcGroup);
        this.makeInteractive(rig, 'pc', 'Logic Chamber // Hardware & PC Overclocking');
        this.makeInteractive(tube, 'pc', 'Logic Chamber // Hardware & PC Overclocking');

        // 4. AI: Pulsing Neural Synapse Lattice
        const aiGroup = new THREE.Group();
        aiGroup.position.set(3.5, 5.0, 3.5);

        const nodeGeo = new THREE.IcosahedronGeometry(1.1, 1);
        this.track(new THREE.Mesh(nodeGeo));
        const node = new THREE.Mesh(nodeGeo, this.materials.neonCrimson);

        const auraGeo = new THREE.IcosahedronGeometry(1.5, 0);
        this.track(new THREE.Mesh(auraGeo));
        const aura = new THREE.Mesh(auraGeo, this.materials.catHolo);

        aiGroup.add(node, aura);
        chamber.add(aiGroup);
        this.makeInteractive(node, 'ai', 'Logic Chamber // Local Neural Networks');
        this.makeInteractive(aura, 'ai', 'Logic Chamber // Local Neural Networks');

        // 5. Music: Frequency Spectrum Visualizer Bars
        const musicGroup = new THREE.Group();
        musicGroup.position.set(0, 3.0, 0);
        this.musicBars = [];

        for (let b = -2; b <= 2; b++) {
            const barGeo = new THREE.BoxGeometry(0.35, 1.8, 0.35);
            this.track(new THREE.Mesh(barGeo));
            const bar = new THREE.Mesh(barGeo, b % 2 === 0 ? this.materials.neonViolet : this.materials.neonCyan);
            bar.position.set(b * 0.5, 0.9, 0);
            musicGroup.add(bar);
            this.musicBars.push(bar);
            this.makeInteractive(bar, 'music', 'Logic Chamber // Audio Synthesis');
        }
        chamber.add(musicGroup);

        this.castAndReceive(chamber);
        this.scene.add(chamber);

        this.animatedObjects.push({ obj: mathGroup, type: 'spin_complex', speed: 1.2 });
        this.animatedObjects.push({ obj: physGroup, type: 'spin_y', speed: 1.6 });
        this.animatedObjects.push({ obj: aiGroup, type: 'hover_pulse', speed: 2.0 });
    }

    // 5. VOID OBSERVATORY (Scenic overlook & telescope)
    createObservatory() {
        const obs = new THREE.Group();
        obs.position.set(16, 0.8, -14);
        obs.rotation.y = -Math.PI / 4;

        // Long cantilevered bridge extending out into the void
        for (let s = 0; s < 6; s++) {
            const plankGeo = new THREE.BoxGeometry(3.6, 0.3, 1.8);
            this.track(new THREE.Mesh(plankGeo));
            const plank = new THREE.Mesh(plankGeo, this.materials.metalDark);
            plank.position.set(0, 0.2 + s * 0.15, s * 2.2);
            obs.add(plank);

            // Neon edge guides
            const railGeo = new THREE.BoxGeometry(0.1, 0.1, 1.8);
            this.track(new THREE.Mesh(railGeo));
            const railL = new THREE.Mesh(railGeo, this.materials.neonCyan);
            railL.position.set(-1.8, 0.4 + s * 0.15, s * 2.2);
            const railR = new THREE.Mesh(railGeo, this.materials.neonCyan);
            railR.position.set(1.8, 0.4 + s * 0.15, s * 2.2);
            obs.add(railL, railR);
        }

        // Circular Viewing Overlook
        const deckGeo = new THREE.CylinderGeometry(5.5, 6.2, 0.8, 12);
        this.track(new THREE.Mesh(deckGeo));
        const deck = new THREE.Mesh(deckGeo, this.materials.obsidian);
        deck.position.set(0, 1.2, 15);
        obs.add(deck);

        // Overlook Perimeter Glow Ring
        const ringGeo = new THREE.TorusGeometry(5.2, 0.1, 8, 32);
        ringGeo.rotateX(Math.PI / 2);
        this.track(new THREE.Mesh(ringGeo));
        const ring = new THREE.Mesh(ringGeo, this.materials.neonCyan);
        ring.position.set(0, 1.7, 15);
        obs.add(ring);

        // Deep-Space Telescope / Quantum Scanner
        const scopeGroup = new THREE.Group();
        scopeGroup.position.set(0, 1.6, 15);

        const scopeBaseGeo = new THREE.CylinderGeometry(0.8, 1.2, 2.0, 8);
        this.track(new THREE.Mesh(scopeBaseGeo));
        const scopeBase = new THREE.Mesh(scopeBaseGeo, this.materials.metalDark);
        scopeBase.position.y = 1.0;

        const barrelGeo = new THREE.CylinderGeometry(0.4, 0.6, 3.6, 12);
        barrelGeo.rotateX(Math.PI / 3);
        this.track(new THREE.Mesh(barrelGeo));
        const barrel = new THREE.Mesh(barrelGeo, this.materials.obsidian);
        barrel.position.set(0, 2.4, 0.6);

        const lensGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.15, 12);
        lensGeo.rotateX(Math.PI / 3);
        this.track(new THREE.Mesh(lensGeo));
        const lens = new THREE.Mesh(lensGeo, this.materials.neonCyan);
        lens.position.set(0, 3.8, 1.4);

        scopeGroup.add(scopeBase, barrel, lens);
        obs.add(scopeGroup);

        this.castAndReceive(obs);
        this.scene.add(obs);

        this.makeInteractive(scopeBase, 'observatory', 'Void Observatory // Deep Space Scanner');
        this.makeInteractive(barrel, 'observatory', 'Void Observatory // Deep Space Scanner');
        this.makeInteractive(lens, 'observatory', 'Void Observatory // Deep Space Scanner');
        this.makeInteractive(deck, 'observatory', 'Void Observatory // Overlook Deck');

        this.animatedObjects.push({ obj: lens, type: 'pulse_glow' });
    }

    // 6. HIDDEN CHAMBER / VOID RIFT (Secret area)
    createHiddenChamber() {
        const secret = new THREE.Group();
        secret.position.set(22, -2.5, -6);

        // Isolated jagged rock island
        const rockGeo = new THREE.DodecahedronGeometry(5, 1);
        rockGeo.scale(1.2, 0.6, 1.2);
        this.track(new THREE.Mesh(rockGeo));
        const rock = new THREE.Mesh(rockGeo, this.materials.darkRock);
        secret.add(rock);

        // Stepping stones leading from main island to secret rock
        for (let i = 1; i <= 3; i++) {
            const stoneGeo = new THREE.BoxGeometry(1.4, 0.3, 1.4);
            this.track(new THREE.Mesh(stoneGeo));
            const stone = new THREE.Mesh(stoneGeo, this.materials.obsidian);
            stone.position.set(-i * 2.8, 0.5 - i * 0.7, 0);
            secret.add(stone);
            
            const stoneGlow = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 4, 4), this.materials.neonCrimson);
            stoneGlow.rotateX(Math.PI / 2);
            stoneGlow.position.y = 0.2;
            stone.add(stoneGlow);

            this.animatedObjects.push({ obj: stone, type: 'hover_slow', offset: i * 0.8 });
        }

        // Void Rift Portal Gateway
        const gate = new THREE.Group();
        gate.position.set(0, 1.5, 0);

        const frameGeo = new THREE.TorusGeometry(3.2, 0.4, 16, 32);
        this.track(new THREE.Mesh(frameGeo));
        const frame = new THREE.Mesh(frameGeo, this.materials.metalDark);
        frame.position.y = 3.2;

        const vortexGeo = new THREE.CircleGeometry(2.8, 32);
        this.track(new THREE.Mesh(vortexGeo));
        const vortex = new THREE.Mesh(vortexGeo, new THREE.MeshBasicMaterial({ color: 0x010103, side: THREE.DoubleSide }));
        vortex.position.set(0, 3.2, 0.02);

        const edgeGlowGeo = new THREE.RingGeometry(2.7, 3.0, 32);
        this.track(new THREE.Mesh(edgeGlowGeo));
        const edgeGlow = new THREE.Mesh(edgeGlowGeo, this.materials.neonCrimson);
        edgeGlow.position.set(0, 3.2, 0.04);

        gate.add(frame, vortex, edgeGlow);
        secret.add(gate);

        this.castAndReceive(secret);
        this.scene.add(secret);

        this.makeInteractive(vortex, 'secret', 'The Void Rift // Hidden Chamber');
        this.makeInteractive(frame, 'secret', 'The Void Rift // Hidden Chamber');
        this.makeInteractive(edgeGlow, 'secret', 'The Void Rift // Hidden Chamber');

        this.animatedObjects.push({ obj: edgeGlow, type: 'pulse_glow', speed: 2.5 });
        this.animatedObjects.push({ obj: gate, type: 'hover_slow', speed: 1.0 });
    }

    // Connective Angular Suspended Bridges
    createBridges() {
        const createBridge = (from, to, colorMat) => {
            const bridgeGroup = new THREE.Group();
            const p1 = new THREE.Vector3(...from);
            const p2 = new THREE.Vector3(...to);
            const dist = p1.distanceTo(p2);
            const mid = p1.clone().lerp(p2, 0.5);

            // Black-glass walkway
            const walkGeo = new THREE.BoxGeometry(2.4, 0.25, dist);
            this.track(new THREE.Mesh(walkGeo));
            const walk = new THREE.Mesh(walkGeo, this.materials.obsidian);
            
            // Neon side glow rails
            const railGeo = new THREE.BoxGeometry(0.12, 0.12, dist);
            this.track(new THREE.Mesh(railGeo));
            const railL = new THREE.Mesh(railGeo, colorMat);
            railL.position.x = -1.2;
            railL.position.y = 0.2;
            const railR = new THREE.Mesh(railGeo, colorMat);
            railR.position.x = 1.2;
            railR.position.y = 0.2;

            bridgeGroup.add(walk, railL, railR);
            bridgeGroup.position.copy(mid);
            bridgeGroup.lookAt(p2);
            this.scene.add(bridgeGroup);
        };

        // Nexus to Vault
        createBridge([-11, 0.8, -9], [0, 0.8, 0], this.materials.neonCrimson);
        // Nexus to Arena
        createBridge([11, 0.8, 9], [0, 0.8, 0], this.materials.neonCrimson);
        // Nexus to Logic Chamber
        createBridge([-11, 0.8, 10], [0, 0.8, 0], this.materials.neonViolet);
        // Nexus to Observatory
        createBridge([12, 0.8, -10], [0, 0.8, 0], this.materials.neonCyan);
    }

    // 7. CYBER CATS (Unit 01 & Holographic Familiar)
    createCats() {
        const buildCyberCat = (isHolo = false) => {
            const group = new THREE.Group();
            const mat = isHolo ? this.materials.catHolo : this.materials.catCyber;

            // Sleek angular body
            const bodyGeo = new THREE.BoxGeometry(0.9, 0.6, 1.3);
            this.track(new THREE.Mesh(bodyGeo));
            const body = new THREE.Mesh(bodyGeo, mat);
            body.position.y = 0.6;

            // Head
            const headGeo = new THREE.BoxGeometry(0.65, 0.55, 0.65);
            this.track(new THREE.Mesh(headGeo));
            const head = new THREE.Mesh(headGeo, mat);
            head.position.set(0, 0.95, 0.75);

            // Sharp angular ears
            const earGeo = new THREE.ConeGeometry(0.18, 0.35, 4);
            this.track(new THREE.Mesh(earGeo));
            const earL = new THREE.Mesh(earGeo, mat);
            earL.position.set(0.22, 1.3, 0.82);
            const earR = new THREE.Mesh(earGeo, mat);
            earR.position.set(-0.22, 1.3, 0.82);

            // Glowing cyber visor / eyes
            const visorGeo = new THREE.BoxGeometry(0.45, 0.12, 0.1);
            this.track(new THREE.Mesh(visorGeo));
            const visorMat = isHolo ? this.materials.neonCyan : this.materials.neonCrimson;
            const visor = new THREE.Mesh(visorGeo, visorMat);
            visor.position.set(0, 1.0, 1.1);

            // Segmented cyber tail
            const tailGeo = new THREE.BoxGeometry(0.12, 0.12, 0.9);
            this.track(new THREE.Mesh(tailGeo));
            const tail = new THREE.Mesh(tailGeo, mat);
            tail.position.set(0, 0.7, -1.0);
            tail.rotation.x = Math.PI / 4;

            group.add(body, head, earL, earR, visor, tail);
            return { group, head, tail };
        };

        // Cat 1: Unit 01 on Central Nexus ledge
        const cat1 = buildCyberCat(false);
        cat1.group.position.set(-4.5, 0.8, -4.5);
        cat1.group.rotation.y = Math.PI / 3;
        this.scene.add(cat1.group);
        this.makeGroupInteractive(cat1.group, 'cat', 'Cyber Cat [Unit 01]');
        this.cats.push({ ...cat1, type: 'nexus_cat' });

        // Cat 2: Holographic Familiar hovering near Logic Chamber
        const cat2 = buildCyberCat(true);
        cat2.group.position.set(-15, 6.0, 15);
        cat2.group.rotation.y = -Math.PI / 4;
        this.scene.add(cat2.group);
        this.makeGroupInteractive(cat2.group, 'cat', 'Holographic Familiar');
        this.cats.push({ ...cat2, type: 'holo_cat' });
    }

    // 8. GIANT 3D HOLOGRAPHIC SIGN
    createSign() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#00000000';
        ctx.fillRect(0, 0, 1024, 256);
        
        ctx.font = 'bold 95px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = '#ff003c';
        ctx.shadowBlur = 35;
        ctx.fillStyle = '#ff1a35';
        ctx.fillText('POLOLVERSE // VOID', 512, 128);
        
        // Horizontal holographic scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        for (let i = 0; i < 256; i += 4) {
            ctx.fillRect(0, i, 1024, 2);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        this.disposables.push(texture);

        const signGeo = new THREE.PlaneGeometry(18, 4.5);
        this.track(new THREE.Mesh(signGeo));
        const sign = new THREE.Mesh(
            signGeo,
            new THREE.MeshBasicMaterial({ map: texture, transparent: true, blending: THREE.AdditiveBlending })
        );
        sign.position.set(0, 16, -18);
        this.scene.add(sign);
        this.animatedObjects.push({ obj: sign, type: 'glitch_hover' });
    }

    // 9. DATA FRAGMENTS (COLLECTIBLE STARS)
    createStars() {
        const starGeo = new THREE.OctahedronGeometry(0.65);
        this.track(new THREE.Mesh(starGeo));

        const positions = [
            [0, 12, 0],         // Over Nexus spire
            [-14, 9.5, -12],    // Over Vault PolAI Core
            [15, 6.0, 12],      // Over Gaming Arena
            [-15, 9.0, 13]      // Over Logic Chamber Tesseract
        ];

        positions.forEach((pos, index) => {
            const star = new THREE.Mesh(starGeo, this.materials.neonCrimson);
            star.position.set(pos[0], pos[1], pos[2]);
            this.scene.add(star);
            this.animatedObjects.push({ obj: star, type: 'spin_hover', speed: 2.0 });
            
            this.makeInteractive(star, 'star', 'Extract Data Fragment');
            star.userData.index = index;
        });
    }

    // 10. DISTANT BRUTALIST CITY SKYLINE
    createCitySkyline() {
        const skylineGroup = new THREE.Group();
        const numTowers = 28;

        for (let i = 0; i < numTowers; i++) {
            const angle = (i / numTowers) * Math.PI * 2;
            const dist = 70 + Math.random() * 35;
            const width = 4 + Math.random() * 5;
            const depth = 4 + Math.random() * 5;
            const height = 25 + Math.random() * 45;

            const towerGeo = new THREE.BoxGeometry(width, height, depth);
            this.track(new THREE.Mesh(towerGeo));
            const tower = new THREE.Mesh(towerGeo, this.materials.cityTower);
            
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            tower.position.set(x, height / 2 - 25, z);
            tower.lookAt(0, tower.position.y, 0);

            // Neon roof beacon
            const beaconGeo = new THREE.OctahedronGeometry(0.6);
            this.track(new THREE.Mesh(beaconGeo));
            const beaconMat = i % 2 === 0 ? this.materials.neonCrimson : this.materials.neonCyan;
            const beacon = new THREE.Mesh(beaconGeo, beaconMat);
            beacon.position.set(0, height / 2 + 0.8, 0);
            tower.add(beacon);

            skylineGroup.add(tower);
        }

        this.scene.add(skylineGroup);
    }

    // 11. DEEP STARFIELD (1,200 particle stars)
    createStarfield() {
        const starCount = 1200;
        const starGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const r = 90 + Math.random() * 120;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 5; // Mostly upper hemisphere
            positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

            // Color variation: crimson, cyan, icy white
            const cType = Math.random();
            if (cType < 0.25) {
                colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.1; colors[i * 3 + 2] = 0.25; // Neon Red
            } else if (cType < 0.5) {
                colors[i * 3] = 0.2; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1.0; // Cyan
            } else {
                colors[i * 3] = 0.9; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 1.0; // Pale White
            }
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.track(new THREE.Points(starGeo));

        const starMat = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.85
        });
        this.disposables.push(starMat);

        this.starfield = new THREE.Points(starGeo, starMat);
        this.scene.add(this.starfield);
    }

    // 12. FLOATING ATMOSPHERIC PARTICLES / EMBERS
    createFloatingParticles() {
        const particleCount = 250;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = Math.random() * 25;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.track(new THREE.Points(particleGeo));

        const particleMat = new THREE.PointsMaterial({
            size: 0.7,
            color: 0xff003c,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });
        this.disposables.push(particleMat);

        this.particles = new THREE.Points(particleGeo, particleMat);
        this.scene.add(this.particles);
    }

    update(dt) {
        const time = Date.now() * 0.001;

        // Animate registered objects
        this.animatedObjects.forEach(anim => {
            const offset = anim.offset || 0;
            const t = time + offset;
            const speed = anim.speed || 1.0;
            
            if (anim.type === 'spin_y') {
                anim.obj.rotation.y += dt * speed;
            } else if (anim.type === 'spin_fast_y') {
                anim.obj.rotation.y += dt * 3 * speed;
            } else if (anim.type === 'spin_slow_x') {
                anim.obj.rotation.x += dt * 0.6 * speed;
            } else if (anim.type === 'hover_slow') {
                anim.obj.position.y += Math.sin(t * 1.5 * speed) * 0.003;
            } else if (anim.type === 'hover_pulse') {
                anim.obj.position.y += Math.sin(t * 2 * speed) * 0.008;
            } else if (anim.type === 'pulse_glow') {
                if (anim.obj.material && anim.obj.material.emissiveIntensity !== undefined) {
                    anim.obj.material.emissiveIntensity = 1.4 + Math.sin(t * 3 * speed) * 0.8;
                }
            } else if (anim.type === 'spin_hover') {
                anim.obj.rotation.y += dt * 1.8 * speed;
                anim.obj.position.y += Math.sin(t * 2.5 + anim.obj.position.x) * 0.008;
            } else if (anim.type === 'spin_complex') {
                anim.obj.rotation.x += dt * 1.1 * speed;
                anim.obj.rotation.y += dt * 1.6 * speed;
                anim.obj.rotation.z += dt * 0.7 * speed;
            } else if (anim.type === 'glitch_hover') {
                anim.obj.position.y += Math.sin(t * 2) * 0.005;
                if (Math.random() > 0.985) {
                    anim.obj.position.x += (Math.random() - 0.5) * 0.4;
                    setTimeout(() => { if (anim.obj) anim.obj.position.x = 0; }, 40);
                }
            }
        });

        // Animate music spectrum bars in Logic Chamber
        if (this.musicBars) {
            this.musicBars.forEach((bar, idx) => {
                const s = 0.5 + Math.abs(Math.sin(time * 6 + idx * 1.2)) * 1.8;
                bar.scale.y = s;
            });
        }

        // Animate floating embers/particles
        if (this.particles) {
            const posAttr = this.particles.geometry.attributes.position;
            for (let i = 0; i < posAttr.count; i++) {
                let y = posAttr.getY(i) + dt * 1.2;
                if (y > 25) y = 0;
                posAttr.setY(i, y);
            }
            posAttr.needsUpdate = true;
        }

        // Slow starfield rotation
        if (this.starfield) {
            this.starfield.rotation.y += dt * 0.015;
        }

        // Cyber Cat animations
        if (this.cats) {
            this.cats.forEach(c => {
                c.tail.rotation.z = Math.sin(time * 4) * 0.15;
                if (c.type === 'holo_cat') {
                    c.group.position.y = 6.0 + Math.sin(time * 2) * 0.25;
                    c.group.rotation.y += dt * 0.4;
                } else if (c.type === 'nexus_cat') {
                    if (Math.random() > 0.992) {
                        c.head.rotation.y = (Math.random() - 0.5) * 0.6;
                        setTimeout(() => { if (c.head) c.head.rotation.y = 0; }, 300);
                    }
                }
            });
        }
    }

    destroy() {
        // Dispose all tracked geometries, materials, and textures
        this.disposables.forEach(d => {
            if (d && typeof d.dispose === 'function') {
                d.dispose();
            }
        });
        this.disposables = [];
        this.interactables = [];
        this.animatedObjects = [];
        this.cats = [];
        this.musicBars = [];
    }
}
