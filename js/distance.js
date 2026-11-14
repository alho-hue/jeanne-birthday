// Nous, à distance

// Points approchés volontairement : la carte reste identique, mais la position exacte n'apparaît pas dans le code.
const DISTANCE_POINTS = {
    lui:   { lat: 36.8214,   lng: 10.1587,   label: 'Moi',   color: 0x7cc4ff },
    elle:  { lat: 12.7398,   lng: -8.0694,  label: 'Toi',   color: 0xff9ec4 }
};

const EARTH_TEXTURE = 'assets/earth-blue-marble.jpg';
const EARTH_RADIUS = 100;

let distanceGlobe = null;
let satelliteMap = null;
let leafletMarkers = {};
let mapBaselineZoom = null;
let currentView = 'map';

// Dézoomer la carte sous ce niveau = bascule vers le globe 3D
const MAP_TO_GLOBE_EXTRA_ZOOM = 1;
// Zoomer le globe en dessous de ce niveau = bascule vers la carte satellite
const GLOBE_TO_MAP_ZOOM = 150;
const MAP_RETURN_ZOOM = 9;

function initDistancePage() {
    showDistanceValue();
    if (window.L) {
        showDistanceView('map');
        return;
    }
    showDistanceView('globe');
    if (!window.THREE) {
        showGlobeFallback();
        return;
    }
    if (distanceGlobe) return;
    try {
        buildDistanceGlobe();
    } catch (error) {
        console.warn('Globe 3D indisponible :', error);
        showGlobeFallback();
    }
}

function showDistanceView(view) {
    currentView = view;
    const globeView = document.getElementById('globe-view');
    const mapView = document.getElementById('map-view');
    if (!globeView || !mapView) return;

    globeView.classList.toggle('view-off', view !== 'globe');
    mapView.classList.toggle('view-off', view !== 'map');

    if (view === 'map') {
        initSatelliteMap();
        requestAnimationFrame(() => satelliteMap?.invalidateSize());
    } else if (!distanceGlobe && window.THREE) {
        try {
            buildDistanceGlobe();
        } catch (error) {
            console.warn('Globe 3D indisponible :', error);
            showGlobeFallback();
        }
    }
}

// Centre exact du globe face à la caméra → sert à recentrer la carte
function globeCenterLatLng() {
    const g = distanceGlobe;
    if (!g || !window.THREE) return null;

    g.globeGroup.updateMatrixWorld(true);
    const dir = g.camera.getWorldDirection(new THREE.Vector3());
    const o = g.camera.position;
    const b = o.dot(dir);
    const c = o.lengthSq() - EARTH_RADIUS * EARTH_RADIUS;
    const disc = b * b - c;
    if (disc < 0) return null;

    const p = o.clone().addScaledVector(dir, -b - Math.sqrt(disc));
    g.globeGroup.worldToLocal(p);
    return vec3ToLatLng(p);
}

function vec3ToLatLng(v) {
    const r = Math.max(v.length(), 0.0001);
    const lat = 90 - Math.acos(Math.min(1, Math.max(-1, v.y / r))) * 180 / Math.PI;
    const lng = Math.atan2(v.z, -v.x) * 180 / Math.PI - 180;
    return { lat, lng };
}

function switchToMapFromGlobe() {
    if (!window.L) return;
    const center = globeCenterLatLng() || {
        lat: (DISTANCE_POINTS.lui.lat + DISTANCE_POINTS.elle.lat) / 2,
        lng: (DISTANCE_POINTS.lui.lng + DISTANCE_POINTS.elle.lng) / 2
    };
    showDistanceView('map');
    if (satelliteMap) {
        satelliteMap.setView([center.lat, center.lng], globeVisibleMapZoom(center.lat), { animate: false });
    }
}

// Traduit le zoom du globe en niveau de zoom carte équivalent (même échelle)
function globeVisibleMapZoom(lat) {
    const g = distanceGlobe;
    if (!g) return MAP_RETURN_ZOOM;
    const camZ = g.getZoom ? g.getZoom() : g.camera.position.z;
    const surfaceDist = Math.max(camZ - EARTH_RADIUS, 10);
    const fovRad = 38 * Math.PI / 180;
    const visibleUnits = 2 * surfaceDist * Math.tan(fovRad / 2);
    const meters = visibleUnits * (6371000 / EARTH_RADIUS);
    const px = document.getElementById('map-view')?.clientHeight || 420;
    const res = meters / px;
    const z = Math.log2(156543.03392 * Math.cos(lat * Math.PI / 180) / Math.max(res, 0.01));
    return Math.max(3, Math.min(17, Math.round(z)));
}

// Clic sur un marqueur du globe → carte satellite zoomée jusqu'aux maisons
function switchToMapAtPoint(key, lat, lng) {
    if (!window.L || !satelliteMap) {
        showDistanceView('map');
        return;
    }
    if (window.__offlineMapActive) {
        showDistanceView('map');
        return;
    }
    showDistanceView('map');
    satelliteMap.setView([lat, lng], 16, { animate: true });
    requestAnimationFrame(() => {
        satelliteMap.invalidateSize();
        leafletMarkers[key]?.openPopup();
    });
}

function switchToGlobeFromMap() {
    const center = satelliteMap ? satelliteMap.getCenter() : null;
    showDistanceView('globe');
    if (distanceGlobe && distanceGlobe.focus && center) {
        distanceGlobe.focus(center.lat, center.lng);
    }
}

function initSatelliteMap() {
    if (satelliteMap || !window.L) return;

    // Pas de réseau au chargement : on passe directement à la carte hors ligne
    if (!navigator.onLine) {
        activateOfflineMap();
        return;
    }

    const lui = DISTANCE_POINTS.lui;
    const elle = DISTANCE_POINTS.elle;

    satelliteMap = L.map('satellite-map', {
        zoomControl: true,
        attributionControl: true,
        worldCopyJump: true
    }).setView([(lui.lat + elle.lat) / 2, (lui.lng + elle.lng) / 2], 4);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Imagery © Esri, Maxar, Earthstar Geographics'
    }).addTo(satelliteMap);

    const makeIcon = point => L.divIcon({
        className: `map-pin map-pin-${point === lui ? 'lui' : 'elle'}`,
        html: `<span class="map-pin-dot"></span><span class="map-pin-label">${point.label}</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
    });

    leafletMarkers.lui = L.marker([lui.lat, lui.lng], { icon: makeIcon(lui) }).addTo(satelliteMap)
        .bindPopup(`<strong>${lui.label}</strong><br>${lui.lat.toFixed(4)}, ${lui.lng.toFixed(4)}`);
    leafletMarkers.elle = L.marker([elle.lat, elle.lng], { icon: makeIcon(elle) }).addTo(satelliteMap)
        .bindPopup(`<strong>${elle.label}</strong><br>${elle.lat.toFixed(4)}, ${elle.lng.toFixed(4)}`);

    L.polyline([[lui.lat, lui.lng], [elle.lat, elle.lng]], {
        color: '#d4af62',
        weight: 2,
        dashArray: '6 8',
        opacity: 0.9
    }).addTo(satelliteMap);

    satelliteMap.fitBounds([[lui.lat, lui.lng], [elle.lat, elle.lng]], { padding: [40, 40] });
    mapBaselineZoom = satelliteMap.getZoom();

    // Si les tuiles satellite ne chargent pas (réseau coupé en cours de route…)
    // → bascule vers la carte hors ligne
    let tileErrors = 0;
    satelliteMap.on('tileerror', () => {
        tileErrors++;
        if (tileErrors >= 12) activateOfflineMap();
    });

    // En dézoomant sous le niveau initial - 1 → le globe prend le relais
    satelliteMap.on('zoomend', () => {
        if (currentView !== 'map' || mapBaselineZoom === null) return;
        if (satelliteMap.getZoom() <= mapBaselineZoom - MAP_TO_GLOBE_EXTRA_ZOOM) {
            switchToGlobeFromMap();
        }
    });
}

function showDistanceValue() {
    const valueEl = document.getElementById('distance-value');
    const messageEl = document.getElementById('distance-message');
    if (!valueEl) return;

    const km = haversineKm(DISTANCE_POINTS.lui, DISTANCE_POINTS.elle);
    valueEl.textContent = `${km.toLocaleString('fr-FR')} km`;

    if (messageEl) {
        const hours = Math.round(km / 800);
        messageEl.textContent = `Environ ${hours} h de vol… mais 0 km de sentiments.`;
    }
}

function haversineKm(a, b) {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const la1 = a.lat * Math.PI / 180;
    const la2 = b.lat * Math.PI / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

function showGlobeFallback() {
    const container = document.getElementById('globe-container');
    const hint = document.querySelector('.globe-hint');
    if (hint) hint.textContent = 'Le globe 3D nécessite internet sur cet appareil.';
    if (container && !container.dataset.fallback) {
        container.dataset.fallback = '1';
        container.innerHTML = '<div class="globe-fallback">Le globe 3D n\'est pas disponible sur cet appareil.</div>';
    }
}

function buildDistanceGlobe() {
    const container = document.getElementById('globe-container');
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 2000);
    const MIN_ZOOM = 108;
    const MAX_ZOOM = 420;
    const MAP_ZOOM_THRESHOLD = 280;
    let zoom = 195;
    camera.position.z = zoom;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // Lumières
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const sun = new THREE.DirectionalLight(0xfff4d6, 0.9);
    sun.position.set(180, 80, 220);
    scene.add(sun);

    // Groupe du globe (rotation + contenu)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Terre
    const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const texture = new THREE.TextureLoader().load(EARTH_TEXTURE);
    texture.encoding = THREE.sRGBEncoding;
    const earth = new THREE.Mesh(
        earthGeo,
        new THREE.MeshPhongMaterial({ map: texture, color: 0x2a4d8f, shininess: 8, specular: new THREE.Color(0x334455) })
    );
    globeGroup.add(earth);

    // Atmosphère (halo)
    const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(EARTH_RADIUS * 1.06, 48, 48),
        new THREE.MeshBasicMaterial({ color: 0x6fa8ff, transparent: true, opacity: 0.12, side: THREE.BackSide })
    );
    globeGroup.add(atmo);

    // Étoiles
    const starCount = 900;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        const r = 500 + Math.random() * 500;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, transparent: true, opacity: 0.8 })));

    // Marqueurs
    const markers = {};
    for (const key of Object.keys(DISTANCE_POINTS)) {
        const point = DISTANCE_POINTS[key];
        const pos = latLngToVec3(point.lat, point.lng, EARTH_RADIUS + 1.5);

        const marker = new THREE.Mesh(
            new THREE.SphereGeometry(4, 16, 16),
            new THREE.MeshBasicMaterial({ color: point.color })
        );

        const halo = new THREE.Mesh(
            new THREE.SphereGeometry(8, 16, 16),
            new THREE.MeshBasicMaterial({ color: point.color, transparent: true, opacity: 0.25 })
        );

        const group = new THREE.Group();
        group.position.copy(pos);
        group.add(marker);
        group.add(halo);
        globeGroup.add(group);

        markers[key] = group;
    }

    // Arc entre les deux points
    const p1 = markers.lui.position.clone();
    const p2 = markers.elle.position.clone();
    const arcMid = p1.clone().add(p2).normalize().multiplyScalar(EARTH_RADIUS * 1.45);
    const arcCurve = new THREE.QuadraticBezierCurve3(p1, arcMid, p2);
    const arcGeo = new THREE.TubeGeometry(arcCurve, 96, 0.7, 8, false);
    const arc = new THREE.Mesh(
        arcGeo,
        new THREE.MeshBasicMaterial({ color: 0xd4af62, transparent: true, opacity: 0.9 })
    );
    globeGroup.add(arc);

    // Point lumineux qui parcourt l'arc
    const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(2.6, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xfff1c9, transparent: true, opacity: 1 })
    );
    globeGroup.add(pulse);

    // Labels HTML projetés
    const labelLui = document.getElementById('label-lui');
    const labelElle = document.getElementById('label-elle');
    const labels = [
        { el: labelLui, marker: markers.lui },
        { el: labelElle, marker: markers.elle }
    ];

    // Rotation : auto + drag + zoom (molette / pinch)
    let spin = 0;
    let userOffset = 0;
    let tilt = 0.32;
    let userTilt = 0;
    let dragOffset = 0;
    let dragTilt = 0;
    let autoSpin = true;
    let spinResumeAt = 0;
    const pointers = new Map();
    let pinchStartDist = 0;
    let pinchStartZoom = zoom;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartOffset = 0;
    let dragStartTilt = 0;
    let downX = 0;
    let downY = 0;
    const raycaster = new THREE.Raycaster();

    const clampZoom = value => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));

    container.addEventListener('pointerdown', event => {
        try { container.setPointerCapture(event.pointerId); } catch (e) { /* noop */ }
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        downX = event.clientX;
        downY = event.clientY;

        if (pointers.size === 1) {
            dragStartX = event.clientX;
            dragStartY = event.clientY;
            dragStartOffset = dragOffset;
            dragStartTilt = dragTilt;
        } else if (pointers.size === 2) {
            const [a, b] = [...pointers.values()];
            pinchStartDist = Math.hypot(a.x - b.x, a.y - b.y);
            pinchStartZoom = zoom;
        }
    });

    container.addEventListener('pointermove', event => {
        if (!pointers.has(event.pointerId)) return;
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (pointers.size === 2) {
            const [a, b] = [...pointers.values()];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (pinchStartDist > 0) {
                zoom = clampZoom(pinchStartZoom * (pinchStartDist / dist));
                if (zoom <= GLOBE_TO_MAP_ZOOM) switchToMapFromGlobe();
            }
            return;
        }

        if (pointers.size === 1) {
            dragOffset = dragStartOffset + (event.clientX - dragStartX) * 0.0035;
            dragTilt = Math.max(-0.5, Math.min(0.9, dragStartTilt + (event.clientY - dragStartY) * 0.002));
        }
    });

    const stopPointer = event => {
        pointers.delete(event.pointerId);
        if (pointers.size < 2) pinchStartDist = 0;
    };
    container.addEventListener('pointerup', stopPointer);
    container.addEventListener('pointercancel', stopPointer);

    // Clic (sans drag) sur un marqueur → carte satellite zoomée dessus
    container.addEventListener('pointerup', event => {
        if (pointers.size > 0) return;
        if (Math.hypot(event.clientX - downX, event.clientY - downY) > 6) return;

        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const ndc = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        raycaster.setFromCamera(ndc, camera);

        let hitKey = null;
        let hitDist = Infinity;
        for (const key of Object.keys(markers)) {
            const hits = raycaster.intersectObject(markers[key], true);
            if (hits.length && hits[0].distance < hitDist) {
                hitDist = hits[0].distance;
                hitKey = key;
            }
        }
        if (hitKey) {
            const point = DISTANCE_POINTS[hitKey];
            switchToMapAtPoint(hitKey, point.lat, point.lng);
        }
    });

    container.addEventListener('wheel', event => {
        event.preventDefault();
        zoom = clampZoom(zoom + event.deltaY * 0.22);
        if (zoom <= GLOBE_TO_MAP_ZOOM) switchToMapFromGlobe();
    }, { passive: false });

    const rotateBtn = document.getElementById('globe-rotate-btn');
    rotateBtn?.addEventListener('click', () => {
        autoSpin = !autoSpin;
        rotateBtn.setAttribute('aria-pressed', String(autoSpin));
        rotateBtn.classList.toggle('paused', !autoSpin);
    });

    // Position initiale : l'arc entre les deux points fait face à la caméra
    const midDir = arcMid.clone().normalize();
    spin = Math.atan2(midDir.x, midDir.z);

    const clock = new THREE.Clock();
    const tmpVec = new THREE.Vector3();

    function animate() {
        requestAnimationFrame(animate);
        if (document.hidden) return;

        const delta = clock.getDelta();
        if (!container.isConnected || container.parentElement?.classList.contains('view-off')) return;
        // La rotation auto ne tourne que quand on regarde le globe entier,
        // pas en mode carte zoomée (comme Google Maps)
        if (autoSpin && zoom > MAP_ZOOM_THRESHOLD && performance.now() > spinResumeAt) spin += delta * 0.12;
        // Le drag est amorti : le globe pivote en douceur derrière la souris
        userOffset += (dragOffset - userOffset) * Math.min(1, delta * 7);
        userTilt += (dragTilt - userTilt) * Math.min(1, delta * 7);
        globeGroup.rotation.y = spin + userOffset;
        globeGroup.rotation.x = tilt + userTilt;
        camera.position.z += (zoom - camera.position.z) * 0.15;

        // Les marqueurs rétrécissent en zoomant pour rester proportionnés
        const markerScale = Math.max(0.45, Math.min(1.5, zoom / 240));
        for (const key of Object.keys(markers)) {
            markers[key].scale.setScalar(markerScale);
        }

        const t = (performance.now() / 6000) % 1;
        const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
        arcCurve.getPoint(eased, tmpVec);
        pulse.position.copy(tmpVec);
        pulse.material.opacity = 0.6 + 0.4 * Math.sin(performance.now() / 180);

        updateLabels();
        renderer.render(scene, camera);
    }

    function updateLabels() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        for (const { el, marker } of labels) {
            if (!el) continue;
            marker.getWorldPosition(tmpVec);
            // Le point est-il sur l'hémisphère face caméra ? (sinon il est derrière le globe)
            const facing = tmpVec.z > 0;
            tmpVec.project(camera);
            if (!facing || tmpVec.z > 1) {
                el.style.opacity = '0';
                continue;
            }
            el.style.opacity = '1';
            el.style.left = `${(tmpVec.x * 0.5 + 0.5) * w}px`;
            el.style.top = `${(-tmpVec.y * 0.5 + 0.5) * h}px`;
        }
    }

    window.addEventListener('resize', () => {
        const w = container.clientWidth || width;
        const h = container.clientHeight || height;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    // Cadrer le globe sur un point donné (retour depuis la carte)
    function focusOn(lat, lng) {
        const pos = latLngToVec3(lat, lng, EARTH_RADIUS);
        userOffset = 0;
        userTilt = 0;
        dragOffset = 0;
        dragTilt = 0;
        spin = Math.atan2(-pos.x, pos.z);
        zoom = 300;
        // La rotation auto reste en pause quelques secondes pour garder le point centré
        spinResumeAt = performance.now() + 2500;
    }

    animate();
    distanceGlobe = { renderer, scene, camera, globeGroup, focus: focusOn, getZoom: () => zoom };
}

// Si le réseau revient pendant la visite, on repasse à la carte satellite
window.addEventListener('online', () => {
    if (!window.__offlineMapActive) return;
    window.__offlineMapActive = false;
    document.getElementById('offline-map')?.classList.add('hidden');
    const hint = document.querySelector('.map-hint');
    if (hint) hint.textContent = 'Pince ou molette pour zoomer — dézoome pour voir le globe';
    if (!satelliteMap) initSatelliteMap();
});

function latLngToVec3(lat, lng, radius) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}
