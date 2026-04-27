// Particle FX para colisiones / impactos. Coordenadas en pantalla.

const particles = [];

export const spawnCollisionFx = (x = 160, y = 200) => {
    for (let i = 0; i < 14; i++) {
        const life = 20 + Math.random() * 20;
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 6,
            vy: -Math.random() * 3 - 0.5,
            life,
            maxLife: life,
        });
    }
};

export const updateFx = () => {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // gravedad
        p.vx *= 0.96;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
};

export const drawFx = (ctx) => {
    for (const p of particles) {
        const a = Math.max(0, p.life / p.maxLife);
        const c = a > 0.5 ? 255 : Math.round(a * 510);
        ctx.fillStyle = 'rgb(' + 255 + ',' + c + ',' + Math.round(a * 80) + ')';
        ctx.fillRect(p.x | 0, p.y | 0, 2, 2);
    }
};

export const clearFx = () => {
    particles.length = 0;
};
