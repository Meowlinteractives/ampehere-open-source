// ===== AMPEHERE AVATAR RENDERER v2 =====
// Config-driven: items come from the DB, not hardcoded.
// AvatarRenderer.init(canvas, equippedItemConfigs, options) -> instance
// equippedItemConfigs: array of { id, category, config } objects
// options: { autoRotate, interactive, size, bgAlpha }

window.AvatarRenderer = window.AvatarRenderer || (function () {

    // ── Helper: load a base64 or URL into a THREE.Texture ──────────────────
    function loadTexture(THREE, src) {
        const loader = new THREE.TextureLoader();
        return loader.load(src);
    }

    // ── Build a mesh from a DB item config ──────────────────────────────────
    function buildItemMesh(THREE, category, cfg) {
        const g = new THREE.Group();

        // ── Custom image overlay (sprite plane) ──────────────────────────────
        if (category === 'custom_image') {
            const src = cfg.imageData || cfg.imageUrl;
            if (!src) return g;
            const tex = loadTexture(THREE, src);
            tex.colorSpace = THREE.SRGBColorSpace !== undefined ? THREE.SRGBColorSpace : THREE.LinearEncoding;
            const aspect = cfg.aspect || 1;
            const scale = cfg.scale || 0.7;
            const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide });
            const plane = new THREE.Mesh(new THREE.PlaneGeometry(scale * aspect, scale), mat);
            plane.position.set(cfg.offsetX || 0, cfg.offsetY || 0.6, cfg.offsetZ || 0.52);
            plane.rotation.y = cfg.rotateY !== undefined ? cfg.rotateY : 0;
            g.add(plane);
            return g;
        }

        if (category === 'hat') {
            const type = cfg.type || 'tophat';
            const color = parseInt((cfg.color || '#333333').replace('#', ''), 16);
            const accent = parseInt((cfg.accentColor || cfg.color || '#555555').replace('#', ''), 16);

            if (type === 'crown') {
                const baseMat = new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: 0.15 });
                const base = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.11, 8), baseMat);
                g.add(base);
                const spikeMat = new THREE.MeshStandardMaterial({ color: accent, metalness: 0.9, roughness: 0.1 });
                const points = cfg.points || 5;
                for (let i = 0; i < points; i++) {
                    const a = (i / points) * Math.PI * 2;
                    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.24, 6), spikeMat);
                    spike.position.set(Math.sin(a) * 0.29, 0.18, Math.cos(a) * 0.29);
                    g.add(spike);
                }
            } else if (type === 'tophat') {
                const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
                const brimMat = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.8 });
                g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 16), brimMat)));
                const top = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, cfg.height || 0.42, 16), mat);
                top.position.y = (cfg.height || 0.42) / 2 + 0.025;
                g.add(top);
            } else if (type === 'party') {
                const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
                const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, cfg.height || 0.52, 8), mat);
                cone.position.y = (cfg.height || 0.52) / 2;
                g.add(cone);
                if (cfg.stripeColor) {
                    const sMat = new THREE.MeshStandardMaterial({ color: parseInt(cfg.stripeColor.replace('#',''),16) });
                    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 16), sMat);
                    stripe.position.y = 0.14; stripe.rotation.x = Math.PI/2;
                    g.add(stripe);
                }
            } else if (type === 'halo') {
                const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness: 0.1, emissive: color, emissiveIntensity: 0.35 });
                const torus = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 8, 24), mat);
                torus.rotation.x = Math.PI / 2;
                g.add(torus);
                g.position.y = 0.2;
            } else if (type === 'wizard') {
                const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
                const brimMat = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.7 });
                const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.5, 0.06, 16), brimMat);
                const cone = new THREE.Mesh(new THREE.ConeGeometry(0.26, cfg.height || 0.58, 16), mat);
                cone.position.y = (cfg.height || 0.58) / 2 + 0.03;
                g.add(brim); g.add(cone);
                if (cfg.starColor) {
                    const sMat = new THREE.MeshStandardMaterial({ color: parseInt(cfg.starColor.replace('#',''),16), emissive: parseInt(cfg.starColor.replace('#',''),16), emissiveIntensity: 0.5 });
                    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.07), sMat);
                    star.position.y = (cfg.height || 0.58) + 0.04;
                    g.add(star);
                }
            } else if (type === 'cap') {
                const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
                const dome = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 8, 0, Math.PI*2, 0, Math.PI/2), mat);
                const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.04, 16), mat);
                brim.position.set(0, 0, -0.06);
                g.add(dome); g.add(brim);
            } else if (type === 'custom_image') {
                // Hat with a custom image texture applied as a billboard
                const src = cfg.imageData || cfg.imageUrl;
                if (src) {
                    const tex = loadTexture(THREE, src);
                    const scale = cfg.scale || 0.7;
                    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide });
                    const plane = new THREE.Mesh(new THREE.PlaneGeometry(scale, scale), mat);
                    plane.position.y = 0.35;
                    g.add(plane);
                }
            } else {
                const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
                const h = new THREE.Mesh(new THREE.BoxGeometry(0.8, cfg.height || 0.35, 0.8), mat);
                h.position.y = (cfg.height || 0.35) / 2;
                g.add(h);
            }

            const hatY = type === 'halo' ? 0.82 : 0.6;
            g.position.y = hatY;
        }

        if (category === 'effect') {
            const type = cfg.type || 'glow';
            if (type === 'glow') {
                const col = parseInt((cfg.color || '#7eb8d4').replace('#',''),16);
                const glow = new THREE.Mesh(new THREE.SphereGeometry(0.74, 16, 16), new THREE.MeshStandardMaterial({ color: col, transparent: true, opacity: 0.07, side: THREE.BackSide }));
                g.add(glow);
            } else if (type === 'flames') {
                const col1 = parseInt((cfg.color || '#ff4400').replace('#',''),16);
                const col2 = parseInt((cfg.accentColor || '#ff8800').replace('#',''),16);
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2;
                    const mat = new THREE.MeshStandardMaterial({ color: i%2===0?col1:col2, emissive: col1, emissiveIntensity:0.5, transparent:true, opacity:0.82 });
                    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.26, 6), mat);
                    flame.position.set(Math.sin(a)*0.58, -0.44, Math.cos(a)*0.58);
                    g.add(flame);
                }
            } else if (type === 'sparkle') {
                const col = parseInt((cfg.color || '#ffffff').replace('#',''),16);
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI * 2;
                    const r = 0.55 + (i%2)*0.1;
                    const mat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.8 });
                    const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.04), mat);
                    sp.position.set(Math.sin(a)*r, -0.2 + (i%3)*0.25, Math.cos(a)*r);
                    g.add(sp);
                }
            }
        }

        return g;
    }

    // ── Main init ────────────────────────────────────────────────────────────
    function init(canvas, equippedItemDefs, options = {}) {
        const { autoRotate = true, interactive = false, size } = options;
        equippedItemDefs = equippedItemDefs || [];

        const w = size || canvas.clientWidth || 180;
        const h = size || canvas.clientHeight || 180;
        canvas.width = w * Math.min(window.devicePixelRatio, 2);
        canvas.height = h * Math.min(window.devicePixelRatio, 2);

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.set(1.8, 1.55, 2.4);
        camera.lookAt(0, 0.05, 0);

        scene.add(new THREE.AmbientLight(0xffffff, 0.52));
        const key = new THREE.DirectionalLight(0xffffff, 0.9);
        key.position.set(3, 5, 4);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0x7eb8d4, 0.28);
        fill.position.set(-3, 2, -2);
        scene.add(fill);

        // ── Determine body color and texture from skin items ─────────────────
        function getSkinConfig() {
            const skins = equippedItemDefs.filter(d => d.category === 'skin').reverse();
            if (skins.length > 0) return skins[0].config || {};
            return {};
        }

        function getBodyColor() {
            const cfg = getSkinConfig();
            const c = cfg.bodyColor || cfg.color;
            if (c) return parseInt(c.replace('#',''), 16);
            return 0x2a5298;
        }

        // ── Build body cube ───────────────────────────────────────────────────
        const skinCfg = getSkinConfig();
        let bodyMat;
        if (skinCfg.imageData || skinCfg.imageUrl) {
            // Wrap the image texture across all 6 faces of the cube body
            const src = skinCfg.imageData || skinCfg.imageUrl;
            const tex = loadTexture(THREE, src);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            if (THREE.SRGBColorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
            // One material per face — same texture on all 6 faces
            bodyMat = [0,1,2,3,4,5].map(() =>
                new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.14 })
            );
        } else {
            bodyMat = new THREE.MeshStandardMaterial({ color: getBodyColor(), roughness: 0.55, metalness: 0.14 });
        }

        const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), bodyMat);

        // Face: eyes + mouth on front face (−Z)
        const eyeGeo = new THREE.BoxGeometry(0.14, 0.1, 0.02);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const pupilMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        [-0.2, 0.2].forEach(x => {
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(x, 0.1, -0.51);
            body.add(eye);
            const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.01), pupilMat);
            pupil.position.set(x, 0.1, -0.521);
            body.add(pupil);
        });
        const mouthMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        [{ x: -0.11, y: -0.1 }, { x: 0, y: -0.14 }, { x: 0.11, y: -0.1 }].forEach(p => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.045, 0.01), mouthMat);
            m.position.set(p.x, p.y, -0.511);
            body.add(m);
        });

        const avatarGroup = new THREE.Group();
        avatarGroup.add(body);

        equippedItemDefs.forEach(({ category, config }) => {
            if (category === 'skin') return;
            try {
                const mesh = buildItemMesh(THREE, category, config || {});
                if (mesh) avatarGroup.add(mesh);
            } catch (e) { console.warn('Avatar item build error:', e); }
        });

        scene.add(avatarGroup);

        // ── Interaction ───────────────────────────────────────────────────────
        let rotY = 0.5, rotX = 0.1;
        let isDragging = false, lastX = 0, lastY = 0;

        if (interactive) {
            canvas.style.cursor = 'grab';
            canvas.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; canvas.style.cursor = 'grabbing'; });
            window.addEventListener('mouseup', () => { isDragging = false; canvas.style.cursor = 'grab'; });
            canvas.addEventListener('mousemove', e => {
                if (!isDragging) return;
                rotY += (e.clientX - lastX) * 0.012;
                rotX = Math.max(-0.5, Math.min(0.6, rotX + (e.clientY - lastY) * 0.006));
                lastX = e.clientX; lastY = e.clientY;
            });
            canvas.addEventListener('touchstart', e => { isDragging = true; lastX = e.touches[0].clientX; }, { passive: true });
            window.addEventListener('touchend', () => isDragging = false);
            canvas.addEventListener('touchmove', e => {
                if (!isDragging) return;
                rotY += (e.touches[0].clientX - lastX) * 0.014;
                lastX = e.touches[0].clientX;
            }, { passive: true });
        }

        let animId;
        function animate() {
            animId = requestAnimationFrame(animate);
            if (autoRotate && !isDragging) rotY += 0.007;
            avatarGroup.rotation.y = rotY;
            avatarGroup.rotation.x = rotX;
            renderer.render(scene, camera);
        }
        animate();

        return {
            destroy() {
                cancelAnimationFrame(animId);
                renderer.dispose();
            },
            update(newDefs) {
                equippedItemDefs = newDefs || [];
                const newSkinCfg = getSkinConfig();
                const src = newSkinCfg.imageData || newSkinCfg.imageUrl;
                if (src) {
                    const tex = loadTexture(THREE, src);
                    tex.wrapS = THREE.RepeatWrapping;
                    tex.wrapT = THREE.RepeatWrapping;
                    if (THREE.SRGBColorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
                    if (Array.isArray(body.material)) {
                        body.material.forEach(m => { m.map = tex; m.color.setHex(0xffffff); m.needsUpdate = true; });
                    } else {
                        body.material = [0,1,2,3,4,5].map(() =>
                            new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.14 })
                        );
                    }
                } else {
                    const col = getBodyColor();
                    if (Array.isArray(body.material)) {
                        body.material.forEach(m => m.dispose());
                        body.material = new THREE.MeshStandardMaterial({ color: col, roughness: 0.55, metalness: 0.14 });
                    } else {
                        body.material.map = null;
                        body.material.color.setHex(col);
                        body.material.needsUpdate = true;
                    }
                }
                while (avatarGroup.children.length > 1) avatarGroup.remove(avatarGroup.children[1]);
                equippedItemDefs.forEach(({ category, config }) => {
                    if (category === 'skin') return;
                    try {
                        const mesh = buildItemMesh(THREE, category, config || {});
                        if (mesh) avatarGroup.add(mesh);
                    } catch (e) {}
                });
            }
        };
    }

    return { init };
})();

// ===== AVATAR THUMBNAIL RENDERER =====
// Single shared WebGL context (preserveDrawingBuffer:true) renders all static avatar thumbnails.
// Results returned as dataURL strings — set as img.src or CSS background.
// ONE context total, no browser limit issues.
window.AvatarThumb = window.AvatarThumb || (function () {
    const SIZE = 120; // render resolution
    let _r = null, _scene = null, _cam = null, _group = null;
    const _queue = [];
    let _busy = false;

    function _boot() {
        if (_r) return true;
        try {
            const c = document.createElement('canvas');
            c.width = c.height = SIZE;
            // Must be in DOM for WebGL context + toDataURL to work in all browsers
            c.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;pointer-events:none;opacity:0;';
            document.body.appendChild(c);
            _r = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true, preserveDrawingBuffer: true });
            _r.setSize(SIZE, SIZE);
            _r.setPixelRatio(1);
            _r.setClearColor(0x0a1628, 1); // solid dark bg so avatar is always visible
            _scene = new THREE.Scene();
            _scene.add(new THREE.AmbientLight(0xffffff, 0.52));
            const kl = new THREE.DirectionalLight(0xffffff, 0.9); kl.position.set(3, 5, 4); _scene.add(kl);
            const fl = new THREE.DirectionalLight(0x7eb8d4, 0.28); fl.position.set(-3, 2, -2); _scene.add(fl);
            _cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
            _cam.position.set(1.8, 1.55, 2.4); _cam.lookAt(0, 0.05, 0);
            return true;
        } catch(e) { console.warn('AvatarThumb boot failed', e); _r = null; return false; }
    }

    function _buildBody(defs) {
        defs = defs || [];
        const skinDef = defs.filter(d => d.category === 'skin').reverse()[0];
        const skinCfg = skinDef ? (skinDef.config || {}) : {};

        let bodyMat;
        if (skinCfg.imageData || skinCfg.imageUrl) {
            const tex = new THREE.TextureLoader().load(skinCfg.imageData || skinCfg.imageUrl);
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            if (THREE.SRGBColorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
            bodyMat = [0,1,2,3,4,5].map(() => new THREE.MeshStandardMaterial({ map: tex, roughness:0.55, metalness:0.14 }));
        } else {
            const hex = skinCfg.bodyColor || skinCfg.color;
            const col = hex ? parseInt(hex.replace('#',''), 16) : 0x2a5298;
            bodyMat = new THREE.MeshStandardMaterial({ color: col, roughness:0.55, metalness:0.14 });
        }

        const body = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), bodyMat);
        const eyeGeo = new THREE.BoxGeometry(0.14,0.1,0.02);
        const eyeMat = new THREE.MeshStandardMaterial({ color:0xffffff });
        const pupMat = new THREE.MeshStandardMaterial({ color:0x111111 });
        const mthMat = new THREE.MeshStandardMaterial({ color:0x222222 });
        [-0.2,0.2].forEach(x => {
            const eye = new THREE.Mesh(eyeGeo, eyeMat); eye.position.set(x,0.1,-0.51); body.add(eye);
            const pup = new THREE.Mesh(new THREE.BoxGeometry(0.07,0.07,0.01), pupMat); pup.position.set(x,0.1,-0.521); body.add(pup);
        });
        [{x:-0.11,y:-0.1},{x:0,y:-0.14},{x:0.11,y:-0.1}].forEach(p => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(0.07,0.045,0.01), mthMat); m.position.set(p.x,p.y,-0.511); body.add(m);
        });

        const g = new THREE.Group();
        g.add(body);
        g.rotation.y = 0.5; g.rotation.x = 0.1;

        // Hats / effects from defs
        defs.forEach(({ category, config }) => {
            if (category === 'skin') return;
            try {
                // Inline hat builder (mirrors avatar-renderer buildItemMesh for hat category)
                if (category === 'hat' && config) {
                    const type  = config.type || 'tophat';
                    const color = parseInt((config.color || '#333333').replace('#',''), 16);
                    const accent= parseInt((config.accentColor || config.color || '#555555').replace('#',''), 16);
                    const hg = new THREE.Group();
                    if (type === 'crown') {
                        const bm = new THREE.MeshStandardMaterial({color, metalness:0.85,roughness:0.15});
                        hg.add(new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.42,0.11,8), bm));
                        const sm = new THREE.MeshStandardMaterial({color:accent,metalness:0.9,roughness:0.1});
                        const pts = config.points||5;
                        for(let i=0;i<pts;i++){const a=(i/pts)*Math.PI*2;const sp=new THREE.Mesh(new THREE.ConeGeometry(0.07,0.24,6),sm);sp.position.set(Math.sin(a)*0.29,0.18,Math.cos(a)*0.29);hg.add(sp);}
                    } else if (type === 'tophat') {
                        const m=new THREE.MeshStandardMaterial({color,roughness:0.8});const bm=new THREE.MeshStandardMaterial({color:accent,roughness:0.8});
                        hg.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.05,16),bm));
                        const top=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.3,config.height||0.42,16),m);top.position.y=(config.height||0.42)/2+0.025;hg.add(top);
                    } else if (type === 'halo') {
                        const m=new THREE.MeshStandardMaterial({color,metalness:0.9,roughness:0.1,emissive:color,emissiveIntensity:0.35});
                        const t=new THREE.Mesh(new THREE.TorusGeometry(0.36,0.05,8,24),m);t.rotation.x=Math.PI/2;hg.add(t);hg.position.y=0.2;
                    }
                    hg.position.y = 0.78;
                    g.add(hg);
                }
            } catch(e) {}
        });
        return g;
    }

    function _disposeGroup(grp) {
        if (!grp) return;
        grp.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => {
                    if (m.map) m.map.dispose();
                    m.dispose();
                });
            }
        });
    }

    async function _runQueue() {
        if (_busy) return;
        _busy = true;
        while (_queue.length) {
            const { defs, resolve } = _queue.shift();
            let url = null;
            try {
                const booted = _boot();
                if (booted) {
                    // Pre-load any image textures before rendering (TextureLoader is async)
                    const skinDef = (defs || []).filter(d => d.category === 'skin').reverse()[0];
                    const skinSrc = skinDef && skinDef.config && (skinDef.config.imageData || skinDef.config.imageUrl);
                    if (skinSrc) {
                        await new Promise(res => {
                            const img = new Image();
                            img.onload = res;
                            img.onerror = res;
                            img.src = skinSrc;
                        });
                    }
                    if (_group) { _scene.remove(_group); _disposeGroup(_group); _group = null; }
                    _group = _buildBody(defs);
                    _scene.add(_group);
                    _r.render(_scene, _cam);
                    url = _r.domElement.toDataURL('image/png');
                }
            } catch(e) { console.warn('[AvatarThumb] render error:', e); }
            resolve(url);
            await new Promise(r => setTimeout(r, 8));
        }
        _busy = false;
    }

    // Returns a Promise<string|null> — a PNG dataURL to use as img.src
    function getDataURL(equippedDefs) {
        return new Promise(resolve => {
            _queue.push({ defs: equippedDefs || [], resolve });
            _runQueue();
        });
    }

    async function renderInto(el, equippedDefs, size) {
        size = size || 40;
        // First: immediate 2D render so something shows right away
        if (window.Avatar2D && el && el.tagName === 'IMG') {
            Avatar2D.renderImg(el, equippedDefs, size);
        }
        // Then: try WebGL for better quality
        const url = await getDataURL(equippedDefs);
        if (url && el) {
            if (el.tagName === 'IMG') {
                el.src = url;
            } else if (el.tagName === 'CANVAS') {
                const ctx = el.getContext('2d');
                if (ctx) {
                    el.width = size; el.height = size;
                    const img = new Image();
                    img.onload = () => ctx.drawImage(img, 0, 0, size, size);
                    img.src = url;
                }
            } else {
                el.style.backgroundImage = `url('${url}')`;
                el.style.backgroundSize = 'cover';
            }
        }
    }

    return { getDataURL, renderInto };
})();
