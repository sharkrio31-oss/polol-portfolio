import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.interactables = [];
        this.animatedObjects = [];
        this.materials = {
            grass: new THREE.MeshStandardMaterial({ color: 0x98FF98, roughness: 0.9 }),
            wood: new THREE.MeshStandardMaterial({ color: 0xD2B48C, roughness: 0.8 }),
            darkWood: new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.9 }),
            wall: new THREE.MeshStandardMaterial({ color: 0xE6E6FA, roughness: 1.0 }),
            floor: new THREE.MeshStandardMaterial({ color: 0xFFFDD0, roughness: 0.6 }),
            rug: new THREE.MeshStandardMaterial({ color: 0xFFB6C1, roughness: 1.0 }),
            leaves: new THREE.MeshStandardMaterial({ color: 0xFFB6C1, roughness: 0.8, flatShading: true }),
            metal: new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6, roughness: 0.4 }),
            black: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 }),
            screen: new THREE.MeshBasicMaterial({ color: 0x89CFF0 }),
            neon: new THREE.MeshBasicMaterial({ color: 0xFF69B4 }),
            gold: new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.2, emissive: 0x443300 }),
            catWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }),
            catOrange: new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.8 }),
            catBlack: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 }),
            blanket: new THREE.MeshStandardMaterial({ color: 0x89CFF0, roughness: 0.9 }),
            pillow: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
        };
    }

    async generate() {
        return new Promise((resolve) => {
            this.createIsland();
            this.createRoom();
            this.createDesk();
            this.createBed();
            this.createBookshelf();
            this.createGamingCorner();
            this.createSideQuests();
            this.createGarden();
            this.createCats();
            this.createPortal();
            this.createSign();
            this.createStars();
            resolve();
        });
    }

    // Helper to add shadows
    castAndReceive(obj) {
        obj.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    createIsland() {
        const islandGeo = new THREE.CylinderGeometry(25, 20, 6, 32);
        islandGeo.translate(0, -3, 0);
        const island = new THREE.Mesh(islandGeo, this.materials.grass);
        island.receiveShadow = true;
        this.scene.add(island);

        // Lower dirt layer
        const dirtGeo = new THREE.CylinderGeometry(20, 10, 8, 32);
        dirtGeo.translate(0, -10, 0);
        const dirt = new THREE.Mesh(dirtGeo, new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 1.0 }));
        this.scene.add(dirt);

        island.userData = { id: 'about', label: 'The Island (About)' };
        this.interactables.push(island);
    }

    createRoom() {
        this.room = new THREE.Group();

        // Floor
        const floor = new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 16), this.materials.floor);
        floor.position.set(-4, 0.25, -4);
        
        // Rug
        const rug = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.1, 32), this.materials.rug);
        rug.position.set(-4, 0.55, -4);
        
        // Walls
        const wallH = 8;
        const wallMat = this.materials.wall;
        
        // Back wall (with window)
        const backWall = new THREE.Group();
        const bW1 = new THREE.Mesh(new THREE.BoxGeometry(16, wallH, 0.5), wallMat);
        bW1.position.set(0, wallH/2, -11.75); // Moved back slightly to allow window hole trick
        backWall.add(bW1);

        // Let's make a window using boxes
        const w1 = new THREE.Mesh(new THREE.BoxGeometry(5, wallH, 0.5), wallMat);
        w1.position.set(-9.5, wallH/2, -11.75);
        const w2 = new THREE.Mesh(new THREE.BoxGeometry(5, wallH, 0.5), wallMat);
        w2.position.set(1.5, wallH/2, -11.75);
        const w3 = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 0.5), wallMat);
        w3.position.set(-4, 1, -11.75);
        const w4 = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 0.5), wallMat);
        w4.position.set(-4, 7, -11.75);
        
        // Window Frame
        const frameMat = this.materials.darkWood;
        const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.2, 0.8), frameMat);
        frameBottom.position.set(-4, 2, -11.6);
        const frameTop = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.2, 0.8), frameMat);
        frameTop.position.set(-4, 6, -11.6);
        const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.2, 0.8), frameMat);
        frameLeft.position.set(-7, 4, -11.6);
        const frameRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.2, 0.8), frameMat);
        frameRight.position.set(-1, 4, -11.6);
        const frameMidV = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4.2, 0.4), frameMat);
        frameMidV.position.set(-4, 4, -11.6);
        const frameMidH = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.1, 0.4), frameMat);
        frameMidH.position.set(-4, 4, -11.6);
        
        // Window View (Glowing Plane)
        const skyPane = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 4),
            new THREE.MeshBasicMaterial({ color: 0x89CFF0 })
        );
        skyPane.position.set(-4, 4, -11.8);
        skyPane.rotation.y = Math.PI; // Face inward

        // Left Wall
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, wallH, 16.5), wallMat);
        leftWall.position.set(-12.25, wallH/2, -3.75);

        this.room.add(floor, rug, w1, w2, w3, w4, frameBottom, frameTop, frameLeft, frameRight, frameMidV, frameMidH, skyPane, leftWall);
        this.castAndReceive(this.room);
        // Turn off shadow for sky
        skyPane.castShadow = false;
        skyPane.receiveShadow = false;

        this.scene.add(this.room);
    }

    createDesk() {
        const desk = new THREE.Group();
        const dMat = this.materials.wood;
        
        // Table top
        const top = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 3), dMat);
        top.position.set(0, 2.5, 0);
        
        // Legs / Drawers
        const leftDrawer = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 2.8), dMat);
        leftDrawer.position.set(-2.1, 1.25, 0);
        const rightLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 0.2), dMat);
        rightLeg1.position.set(2.8, 1.25, -1.3);
        const rightLeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 0.2), dMat);
        rightLeg2.position.set(2.8, 1.25, 1.3);

        // PC Tower
        const pc = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 2.5), this.materials.black);
        pc.position.set(2.2, 3.6, 0);
        const pcGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.5), this.materials.neon);
        pcGlow.position.set(1.59, 3.6, 0);
        pcGlow.rotation.y = -Math.PI/2;

        // Monitor
        const monitorStand = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.1), this.materials.black);
        monitorStand.position.set(-0.5, 2.65, -0.5);
        const monitorNeck = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.1), this.materials.black);
        monitorNeck.position.set(-0.5, 2.9, -0.6);
        const monitorBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 0.1), this.materials.black);
        monitorBody.position.set(-0.5, 3.4, -0.5);
        monitorBody.rotation.y = Math.PI / 16;
        
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.3), this.materials.screen);
        screen.position.set(0, 0, 0.06);
        monitorBody.add(screen);

        // Keyboard & Mouse
        const kb = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.5), this.materials.black);
        kb.position.set(-0.5, 2.62, 0.5);
        kb.rotation.y = Math.PI / 16;
        
        const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.3), this.materials.black);
        mouse.position.set(0.6, 2.64, 0.5);

        // Chair
        const chair = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.2), this.materials.black);
        seat.position.y = 1.4;
        const back = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.2), this.materials.black);
        back.position.set(0, 2.2, 0.5);
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4), this.materials.metal);
        pole.position.y = 0.7;
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.1), this.materials.black);
        base.position.y = 0.05;
        chair.add(seat, back, pole, base);
        chair.position.set(0.5, 0, 2.5);
        chair.rotation.y = -Math.PI / 6;

        desk.add(top, leftDrawer, rightLeg1, rightLeg2, pc, pcGlow, monitorStand, monitorNeck, monitorBody, kb, mouse);
        desk.position.set(-3, 0, -9.5); // Against back wall
        
        this.castAndReceive(desk);
        this.castAndReceive(chair);
        this.scene.add(desk);
        this.scene.add(chair);

        // Interactions
        monitorBody.userData = { id: 'projects', label: 'Computer (Projects)' };
        screen.userData = { id: 'projects', label: 'Computer (Projects)' };
        pc.userData = { id: 'projects', label: 'Computer (Projects)' };
        this.interactables.push(monitorBody, screen, pc);
    }

    createBed() {
        const bed = new THREE.Group();
        
        const frame = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.8, 7), this.materials.wood);
        frame.position.y = 0.4;
        
        const headboard = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.5, 0.4), this.materials.wood);
        headboard.position.set(0, 1.25, -3.3);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.6, 6.6), new THREE.MeshStandardMaterial({color: 0xffffff}));
        mattress.position.y = 1.1;

        const blanket = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.7, 4), this.materials.blanket);
        blanket.position.set(0, 1.15, 1.3);

        const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 1), this.materials.pillow);
        pillow1.position.set(-1, 1.5, -2.5);
        pillow1.rotation.x = 0.2;

        const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 1), this.materials.pillow);
        pillow2.position.set(1, 1.5, -2.5);
        pillow2.rotation.x = 0.2;

        // Journal / Scrapbook
        const journal = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 1), new THREE.MeshStandardMaterial({color: 0x882222}));
        journal.position.set(0, 1.55, -1);
        journal.rotation.y = 0.3;

        bed.add(frame, headboard, mattress, blanket, pillow1, pillow2, journal);
        bed.position.set(-9, 0, -7); // Left corner
        
        this.castAndReceive(bed);
        this.scene.add(bed);

        journal.userData = { id: 'about', label: 'Journal (About Me)' };
        this.interactables.push(journal);
    }

    createBookshelf() {
        const shelf = new THREE.Group();
        const mat = this.materials.darkWood;

        const left = new THREE.Mesh(new THREE.BoxGeometry(0.2, 6, 1.5), mat);
        left.position.set(-1.4, 3, 0);
        const right = new THREE.Mesh(new THREE.BoxGeometry(0.2, 6, 1.5), mat);
        right.position.set(1.4, 3, 0);
        const top = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 1.5), mat);
        top.position.set(0, 5.9, 0);

        shelf.add(left, right, top);

        for (let i = 1; i <= 4; i++) {
            const sh = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 1.4), mat);
            sh.position.set(0, i * 1.2, 0);
            shelf.add(sh);

            // Add books to shelves
            const colors = [0xFFB6C1, 0x89CFF0, 0x98FF98, 0xFFFDD0, 0xFF69B4];
            let xOffset = -1.2;
            while(xOffset < 1.0) {
                if (Math.random() > 0.3) {
                    const bW = 0.1 + Math.random() * 0.15;
                    const bH = 0.6 + Math.random() * 0.4;
                    const bMat = new THREE.MeshStandardMaterial({color: colors[Math.floor(Math.random()*colors.length)]});
                    const book = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, 0.8), bMat);
                    book.position.set(xOffset + bW/2, i * 1.2 + bH/2 + 0.05, 0);
                    shelf.add(book);
                    xOffset += bW + 0.02;
                } else {
                    xOffset += 0.3; // gap
                }
            }
        }

        // Potted plant on top
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 0.4), new THREE.MeshStandardMaterial({color: 0xcc5533}));
        pot.position.set(0, 6.2, 0);
        const plant = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5), this.materials.grass);
        plant.position.set(0, 6.6, 0);
        shelf.add(pot, plant);

        shelf.position.set(-11, 0, 2); // Left wall, forward
        shelf.rotation.y = Math.PI / 2;
        
        this.castAndReceive(shelf);
        this.scene.add(shelf);

        left.userData = { id: 'math', label: 'Bookshelf (Math/Science)' };
        right.userData = { id: 'physics', label: 'Bookshelf (Physics)' };
        this.interactables.push(left, right);
    }

    createGamingCorner() {
        const gamingGroup = new THREE.Group();
        
        // Geometry Dash (Neon Cube + Spike)
        const gd = new THREE.Group();
        const cube = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({color: 0x00ffff, wireframe: true}));
        cube.position.y = 0.5;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 4), this.materials.neon);
        spike.position.set(0.6, 0.3, 0);
        gd.add(cube, spike);
        gd.position.set(0, 0, 0);
        
        // Blood Strike (Target Range)
        const bs = new THREE.Group();
        const target = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16), new THREE.MeshBasicMaterial({color: 0xff0000}));
        target.rotation.x = Math.PI/2;
        target.position.y = 0.8;
        const targetStand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1), this.materials.metal);
        targetStand.position.y = 0.4;
        bs.add(target, targetStand);
        bs.position.set(2, 0, 0);

        // Genshin (Elemental Crystal)
        const genshin = new THREE.Group();
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.4), new THREE.MeshBasicMaterial({color: 0x98FF98, wireframe: false}));
        crystal.position.y = 0.6;
        genshin.add(crystal);
        genshin.position.set(0, 0, 2);

        // Roblox (Blocky bricks)
        const roblox = new THREE.Group();
        const brick1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({color: 0xff0000}));
        brick1.position.y = 0.25;
        const brick2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshStandardMaterial({color: 0x0000ff}));
        brick2.position.set(0.2, 0.7, 0);
        roblox.add(brick1, brick2);
        roblox.position.set(2, 0, 2);

        gamingGroup.add(gd, bs, genshin, roblox);
        gamingGroup.position.set(-9, 0.2, 4);
        
        this.castAndReceive(gamingGroup);
        this.scene.add(gamingGroup);

        cube.userData = { id: 'gd', label: 'Geometry Dash' };
        target.userData = { id: 'bs', label: 'Blood Strike' };
        crystal.userData = { id: 'genshin', label: 'Genshin Impact' };
        brick1.userData = { id: 'roblox', label: 'Roblox' };
        this.interactables.push(cube, target, crystal, brick1);

        this.animatedObjects.push({ obj: cube, type: 'spin_hover' });
        this.animatedObjects.push({ obj: crystal, type: 'hover' });
    }

    createSideQuests() {
        const sqGroup = new THREE.Group();

        // Math (Floating shapes)
        const math = new THREE.Group();
        const tor = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 8, 16), new THREE.MeshBasicMaterial({color: 0x89CFF0}));
        tor.position.y = 1;
        math.add(tor);
        math.position.set(0, 0, 0);

        // Physics (Atom model)
        const physics = new THREE.Group();
        const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshStandardMaterial({color: 0xffa500}));
        const orbit1 = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.02, 4, 16), this.materials.metal);
        orbit1.rotation.x = Math.PI/2;
        const orbit2 = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.02, 4, 16), this.materials.metal);
        orbit2.rotation.y = Math.PI/2;
        physics.add(nucleus, orbit1, orbit2);
        physics.position.set(2, 1, 0);

        // PC Tinkering (RAM stick)
        const pc = new THREE.Group();
        const ram = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.05), new THREE.MeshStandardMaterial({color: 0x005500}));
        pc.add(ram);
        pc.position.set(0, 0.8, 2);

        // AI (Glowing Brain/Cube)
        const ai = new THREE.Group();
        const brain = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3), new THREE.MeshBasicMaterial({color: 0xFFB6C1, wireframe: true}));
        ai.add(brain);
        ai.position.set(2, 0.8, 2);

        // Music (Vinyl)
        const music = new THREE.Group();
        const vinyl = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16), this.materials.black);
        music.add(vinyl);
        music.position.set(1, 0.8, 1);

        sqGroup.add(math, physics, pc, ai, music);
        sqGroup.position.set(2, 0, -8);

        this.castAndReceive(sqGroup);
        this.scene.add(sqGroup);

        tor.userData = { id: 'math', label: 'Mathematics' };
        nucleus.userData = { id: 'physics', label: 'Physics' };
        ram.userData = { id: 'pc', label: 'PC Tinkering' };
        brain.userData = { id: 'ai', label: 'Local AI' };
        vinyl.userData = { id: 'music', label: 'Music' };
        this.interactables.push(tor, nucleus, ram, brain, vinyl);

        this.animatedObjects.push({ obj: math, type: 'spin_hover' });
        this.animatedObjects.push({ obj: physics, type: 'spin' });
        this.animatedObjects.push({ obj: ai, type: 'hover' });
        this.animatedObjects.push({ obj: vinyl, type: 'spin' });
    }

    createGarden() {
        const createTree = (x, z, scale) => {
            const tree = new THREE.Group();
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 2), this.materials.darkWood);
            trunk.position.y = 1;
            const l1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8), this.materials.leaves);
            l1.position.y = 2.8;
            const l2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4), this.materials.leaves);
            l2.position.set(0.8, 3.5, -0.5);
            tree.add(trunk, l1, l2);
            tree.position.set(x, 0, z);
            tree.scale.set(scale, scale, scale);
            this.castAndReceive(tree);
            this.scene.add(tree);
        };

        createTree(12, -8, 1.2);
        createTree(16, 4, 1.5);
        createTree(-6, 14, 1.0);
        createTree(8, 15, 1.3);

        // Path stones
        for(let i=0; i<8; i++) {
            const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.1, 6), this.materials.metal);
            stone.position.set(4 + i*1.2, 0.1, 2 + i*1.5);
            stone.rotation.y = Math.random();
            stone.receiveShadow = true;
            this.scene.add(stone);
        }

        // Lanterns
        const createLantern = (x, z) => {
            const group = new THREE.Group();
            const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.5, 0.6), this.materials.darkWood);
            base.position.y = 0.75;
            const glow = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), this.materials.screen);
            glow.position.y = 1.7;
            const top = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.4, 4), this.materials.darkWood);
            top.position.y = 2.1;
            top.rotation.y = Math.PI/4;
            
            const light = new THREE.PointLight(0x89CFF0, 1, 5);
            light.position.y = 1.7;

            group.add(base, glow, top, light);
            group.position.set(x, 0, z);
            this.castAndReceive(group);
            this.scene.add(group);
        };

        createLantern(10, 2);
        createLantern(4, 12);
    }

    createCats() {
        const createCatModel = (colorMat) => {
            const group = new THREE.Group();
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 1.2), colorMat);
            body.position.y = 0.5;
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), colorMat);
            head.position.set(0, 0.8, 0.7);
            const earL = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 4), colorMat);
            earL.position.set(0.2, 1.1, 0.8);
            const earR = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 4), colorMat);
            earR.position.set(-0.2, 1.1, 0.8);
            
            const tail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.8), colorMat);
            tail.position.set(0, 0.6, -0.9);
            tail.rotation.x = Math.PI / 4;

            const legGeo = new THREE.BoxGeometry(0.15, 0.4, 0.15);
            const fl = new THREE.Mesh(legGeo, colorMat); fl.position.set(0.3, 0.2, 0.4);
            const fr = new THREE.Mesh(legGeo, colorMat); fr.position.set(-0.3, 0.2, 0.4);
            const bl = new THREE.Mesh(legGeo, colorMat); bl.position.set(0.3, 0.2, -0.4);
            const br = new THREE.Mesh(legGeo, colorMat); br.position.set(-0.3, 0.2, -0.4);

            group.add(body, head, earL, earR, tail, fl, fr, bl, br);
            this.castAndReceive(group);
            
            body.userData = { id: 'cat', label: 'Cat (Personality)' };
            head.userData = { id: 'cat', label: 'Cat (Personality)' };
            
            return { model: group, tail, fl, fr, bl, br };
        };

        this.cats = [];
        
        // Cat 1: On the rug
        const cat1 = createCatModel(this.materials.catBlack);
        cat1.model.position.set(-3, 0, -3);
        cat1.model.rotation.y = Math.PI / 4;
        this.scene.add(cat1.model);
        this.cats.push({ ...cat1, type: 'idle' });

        // Cat 2: On the bed
        const cat2 = createCatModel(this.materials.catOrange);
        cat2.model.position.set(-9, 1.5, -6);
        cat2.model.rotation.y = -Math.PI / 2;
        this.scene.add(cat2.model);
        this.cats.push({ ...cat2, type: 'sleep' });

        // Cat 3: Outside by the path
        const cat3 = createCatModel(this.materials.catWhite);
        cat3.model.position.set(8, 0, 8);
        cat3.model.rotation.y = Math.PI;
        this.scene.add(cat3.model);
        this.cats.push({ ...cat3, type: 'walk' });

        // Add to interactables
        this.cats.forEach(c => {
            c.model.children.forEach(child => {
                if(child.userData.id) this.interactables.push(child);
            });
        });
    }

    createPortal() {
        const group = new THREE.Group();
        const outer = new THREE.Mesh(new THREE.TorusGeometry(2, 0.2, 16, 32), this.materials.neon);
        outer.position.y = 2;
        const inner = new THREE.Mesh(new THREE.CircleGeometry(1.8, 32), new THREE.MeshBasicMaterial({ color: 0xFFB6C1, transparent: true, opacity: 0.6 }));
        inner.position.y = 2;
        
        const light = new THREE.PointLight(0xFF69B4, 1, 10);
        light.position.y = 2;

        group.add(outer, inner, light);
        group.position.set(16, 0, -5);
        group.rotation.y = -Math.PI / 4;

        this.scene.add(group);
        this.animatedObjects.push({ obj: outer, type: 'spin' });

        inner.userData = { id: 'portal', label: 'Magical Portal' };
        outer.userData = { id: 'portal', label: 'Magical Portal' };
        this.interactables.push(inner, outer);
    }

    createSign() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#00000000'; // Transparent
        ctx.fillRect(0, 0, 1024, 256);
        
        ctx.font = 'bold 120px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = '#FF69B4';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('POLOLVERSE', 512, 128);
        
        const texture = new THREE.CanvasTexture(canvas);
        const sign = new THREE.Mesh(
            new THREE.PlaneGeometry(12, 3),
            new THREE.MeshBasicMaterial({ map: texture, transparent: true })
        );
        sign.position.set(0, 10, -12);
        this.scene.add(sign);
        this.animatedObjects.push({ obj: sign, type: 'hover' });
    }

    createStars() {
        this.stars = [];
        const starGeo = new THREE.OctahedronGeometry(0.3);
        
        const positions = [
            [2, 2, -2],
            [-10, 4, -2],
            [12, 1, 8],
            [15, 3, -8]
        ];

        positions.forEach((pos, index) => {
            const star = new THREE.Mesh(starGeo, this.materials.gold);
            star.position.set(pos[0], pos[1], pos[2]);
            this.scene.add(star);
            this.animatedObjects.push({ obj: star, type: 'spin_hover' });
            
            star.userData = { id: 'star', label: 'Collect Star', index: index };
            this.interactables.push(star);
        });
    }

    removeStar(object) {
        this.scene.remove(object);
        this.interactables = this.interactables.filter(i => i !== object);
    }

    update(dt) {
        const time = Date.now() * 0.001;

        // Animate objects
        this.animatedObjects.forEach(anim => {
            if (anim.type === 'spin') {
                anim.obj.rotation.z += dt;
            } else if (anim.type === 'hover') {
                anim.obj.position.y += Math.sin(time * 2) * 0.005;
            } else if (anim.type === 'spin_hover') {
                anim.obj.rotation.y += dt * 2;
                anim.obj.position.y += Math.sin(time * 3 + anim.obj.position.x) * 0.01;
            }
        });

        // Animate cats
        if (this.cats) {
            this.cats.forEach(c => {
                // Tail wag
                c.tail.rotation.z = Math.sin(time * 5) * 0.2;
                
                if (c.type === 'idle') {
                    c.model.position.y = Math.sin(time * 3) * 0.02;
                } else if (c.type === 'walk') {
                    // Simple walk cycle
                    c.fl.rotation.x = Math.sin(time * 8) * 0.3;
                    c.br.rotation.x = Math.sin(time * 8) * 0.3;
                    c.fr.rotation.x = Math.sin(time * 8 + Math.PI) * 0.3;
                    c.bl.rotation.x = Math.sin(time * 8 + Math.PI) * 0.3;
                    c.model.position.y = Math.abs(Math.sin(time * 8)) * 0.05;
                } else if (c.type === 'sleep') {
                    // Breathing
                    c.model.scale.y = 1 + Math.sin(time * 2) * 0.05;
                }
            });
        }
    }
}
