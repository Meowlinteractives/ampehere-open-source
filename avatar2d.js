// ===== AMPEHERE 2D AVATAR RENDERER =====
// Handles both color skins and image skins (config.imageData).
// For image skins: sets img.src directly to the stored image data URI.
// For color skins: draws a cube with the skin color.
window.Avatar2D = window.Avatar2D || (function () {

    function drawCube(ctx, size, color) {
        color = color || '#2a5298';
        ctx.clearRect(0, 0, size, size);

        const cx = size / 2;
        const cy = size / 2 - size * 0.04;
        const w  = (size - size * 0.16) * 0.62;
        const h  = w;

        let r = 42, g = 82, b = 152;
        try {
            const hex = color.replace('#','');
            r = parseInt(hex.slice(0,2),16);
            g = parseInt(hex.slice(2,4),16);
            b = parseInt(hex.slice(4,6),16);
        } catch(e) {}

        const lighten = (v, a) => Math.min(255, Math.round(v + a));
        const darken  = (v, a) => Math.max(0,   Math.round(v - a));
        const rgb     = (rv, gv, bv) => `rgb(${rv},${gv},${bv})`;

        const front = rgb(r, g, b);
        const top   = rgb(lighten(r,40), lighten(g,40), lighten(b,40));
        const side  = rgb(darken(r,30),  darken(g,30),  darken(b,30));
        const th = h * 0.18;
        const fx = cx - w/2, fy = cy - h/2 + h*0.1;

        // Front face
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(fx, fy, w, h, w * 0.1);
        else ctx.rect(fx, fy, w, h);
        ctx.fillStyle = front;
        ctx.fill();

        // Top face
        ctx.fillStyle = top;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + w, fy);
        ctx.lineTo(fx + w + th * 0.6, fy - th);
        ctx.lineTo(fx + th * 0.6, fy - th);
        ctx.closePath();
        ctx.fill();

        // Right side
        ctx.fillStyle = side;
        ctx.beginPath();
        ctx.moveTo(fx + w, fy);
        ctx.lineTo(fx + w + th * 0.6, fy - th);
        ctx.lineTo(fx + w + th * 0.6, fy - th + h);
        ctx.lineTo(fx + w, fy + h);
        ctx.closePath();
        ctx.fill();

        // Eyes
        const eyeY = fy + h * 0.3;
        const eyeR = w * 0.07;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.ellipse(fx + w*0.32, eyeY, eyeR, eyeR*0.85, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(fx + w*0.68, eyeY, eyeR, eyeR*0.85, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#0a1628';
        const pr = eyeR * 0.5;
        ctx.beginPath(); ctx.ellipse(fx + w*0.32, eyeY+eyeR*0.1, pr, pr, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(fx + w*0.68, eyeY+eyeR*0.1, pr, pr, 0, 0, Math.PI*2); ctx.fill();

        // Smile
        ctx.strokeStyle = '#0a1628';
        ctx.lineWidth = w * 0.04;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, fy + h * 0.58, w * 0.18, 0.1, Math.PI - 0.1);
        ctx.stroke();
    }

    // Render into an img element - handles both image skins and color skins
    function renderImg(img, defs, size) {
        if (!img) return;
        size = size || parseInt(img.getAttribute('width')) || 40;

        var skin = null;
        if (defs && defs.length) {
            skin = defs.find(function(d) { return d.category === 'skin'; });
        }

        // Image skin: set src directly to the stored data URI
        if (skin && skin.config && skin.config.imageData) {
            img.src = skin.config.imageData;
            img.style.objectFit = 'cover';
            return;
        }

        // Color skin: draw cube
        var color = '#2a5298';
        if (skin && skin.config) {
            color = skin.config.bodyColor || skin.config.color || color;
        }

        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;
        drawCube(ctx, size, color);
        img.src = canvas.toDataURL('image/png');
        img.style.objectFit = '';
    }

    function renderToDataURL(defs, size) {
        size = size || 80;
        var skin = defs && defs.find(function(d) { return d.category === 'skin'; });
        if (skin && skin.config && skin.config.imageData) {
            return skin.config.imageData;
        }
        var color = '#2a5298';
        if (skin && skin.config) color = skin.config.bodyColor || skin.config.color || color;
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        var ctx = canvas.getContext('2d');
        if (!ctx) return null;
        drawCube(ctx, size, color);
        return canvas.toDataURL('image/png');
    }

    return { renderImg: renderImg, renderToDataURL: renderToDataURL, drawAvatar: drawCube };
})();
