// Carte hors ligne : le monde en topojson local dessiné sur canvas,
// avec les deux points et le trait qui les relie. Prend le relais
// quand la carte satellite n'a pas de réseau.

function projectPoint(lat, lng, w, h) {
    return { x: (lng + 180) / 360 * w, y: (90 - lat) / 180 * h };
}

function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

async function ensureLandData() {
    if (window.__landFC) return window.__landFC;
    if (typeof topojson === 'undefined') return null;
    try {
        const res = await fetch('assets/data/land-110m.json');
        const topo = await res.json();
        window.__landFC = topojson.feature(topo, topo.objects.land);
        return window.__landFC;
    } catch (e) {
        return null;
    }
}

function activateOfflineMap() {
    if (window.__offlineMapActive) return;
    window.__offlineMapActive = true;

    const canvas = document.getElementById('offline-map');
    const wrap = document.getElementById('map-view');
    if (!canvas || !wrap) return;

    canvas.classList.remove('hidden');
    const hint = document.querySelector('.map-hint');
    if (hint) hint.textContent = 'Mode hors ligne — carte simplifiée';

    drawOfflineMap(canvas, wrap, window.__landFC || null);
    ensureLandData().then(fc => {
        if (fc && window.__offlineMapActive) drawOfflineMap(canvas, wrap, fc);
    });

    window.addEventListener('resize', () => {
        if (window.__offlineMapActive) drawOfflineMap(canvas, wrap, window.__landFC || null);
    });
}

function drawOfflineMap(canvas, wrap, landFC) {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (!w || !h) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Océan
    const ocean = ctx.createLinearGradient(0, 0, 0, h);
    ocean.addColorStop(0, '#0e1729');
    ocean.addColorStop(1, '#070c17');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, w, h);

    // Graticule
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    for (let lng = -150; lng <= 150; lng += 30) {
        const x = projectPoint(0, lng, w, h).x;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
    }
    for (let lat = -60; lat <= 60; lat += 30) {
        const y = projectPoint(lat, 0, w, h).y;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Équateur et méridien de Greenwich un peu plus visibles
    ctx.strokeStyle = 'rgba(212, 175, 98, 0.16)';
    ctx.beginPath();
    ctx.moveTo(0, projectPoint(0, 0, w, h).y);
    ctx.lineTo(w, projectPoint(0, 0, w, h).y);
    ctx.moveTo(projectPoint(0, 0, w, h).x, 0);
    ctx.lineTo(projectPoint(0, 0, w, h).x, h);
    ctx.stroke();

    // Continents
    if (landFC) {
        ctx.fillStyle = '#22314e';
        ctx.strokeStyle = 'rgba(212, 175, 98, 0.25)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        for (const feature of landFC.features) {
            const geom = feature.geometry;
            if (!geom) continue;
            const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
            for (const poly of polys) {
                for (const ring of poly) {
                    let prevLng = null;
                    for (let i = 0; i < ring.length; i++) {
                        const pt = projectPoint(ring[i][1], ring[i][0], w, h);
                        // Antiméridien : on saute le segment au lieu de tracer une ligne à travers la carte
                        const jump = prevLng !== null && Math.abs(ring[i][0] - prevLng) > 180;
                        if (i === 0 || jump) ctx.moveTo(pt.x, pt.y);
                        else ctx.lineTo(pt.x, pt.y);
                        prevLng = ring[i][0];
                    }
                    ctx.closePath();
                }
            }
        }
        ctx.fill('evenodd');
        ctx.stroke();
    }

    // Arc entre les deux points (grand cercle)
    if (typeof THREE !== 'undefined' && typeof latLngToVec3 === 'function' && typeof vec3ToLatLng === 'function'
        && typeof DISTANCE_POINTS !== 'undefined') {
        const a = latLngToVec3(DISTANCE_POINTS.lui.lat, DISTANCE_POINTS.lui.lng, 1);
        const b = latLngToVec3(DISTANCE_POINTS.elle.lat, DISTANCE_POINTS.elle.lng, 1);
        const angle = a.angleTo(b);
        const sinAngle = Math.sin(angle) || 1;

        ctx.strokeStyle = '#d4af62';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        const steps = 72;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const v = a.clone()
                .multiplyScalar(Math.sin((1 - t) * angle) / sinAngle)
                .add(b.clone().multiplyScalar(Math.sin(t * angle) / sinAngle));
            const ll = vec3ToLatLng(v);
            const pt = projectPoint(ll.lat, ll.lng, w, h);
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Marqueurs
    if (typeof DISTANCE_POINTS !== 'undefined') {
        for (const key of ['lui', 'elle']) {
            const point = DISTANCE_POINTS[key];
            const pt = projectPoint(point.lat, point.lng, w, h);
            const color = key === 'lui' ? '#7cc4ff' : '#ff9ec4';

            const glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 18);
            glow.addColorStop(0, color);
            glow.addColorStop(1, 'transparent');
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            ctx.fillStyle = color;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Étiquette
            ctx.font = '600 11px Inter, sans-serif';
            const label = point.label;
            const tw = ctx.measureText(label).width;
            const lx = pt.x + 12;
            const ly = pt.y - 10;
            roundRectPath(ctx, lx - 5, ly - 11, tw + 10, 18, 9);
            ctx.fillStyle = 'rgba(5, 8, 18, 0.8)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(212, 175, 98, 0.35)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#f2ead8';
            ctx.fillText(label, lx, ly + 2);
        }
    }
}
