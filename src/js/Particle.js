( function() {
  
    /**
     * Particle class
     * @param {Object} particleSystem - the system that spawned this
     */
    window.game.Particle = function Particle(particleSystem) {
        this.particleSystem = particleSystem;

        // Number of seconds to live
        this.ttl = .8;
        this.x = this.particleSystem.x;
        this.y = this.particleSystem.y;

        // Pixels per second
        var maxSpeed = 280;
        this.vx = Math.random()*maxSpeed * 2 - maxSpeed;
        this.vy = Math.random()*maxSpeed * 2 - maxSpeed;
    };

    /**
     * Updates this particle.
     * @param {number} delta - number of ms since the last time this was 
     *  called.
     */
    window.game.Particle.prototype.update = function(delta) {
        var deltaAsSec = delta / 1000;

        this.ttl -= deltaAsSec;
        this.x += this.vx * deltaAsSec;
        this.y += this.vy * deltaAsSec;
    };

    /**
     * Returns true if this particle is still alive.
     */
    window.game.Particle.prototype.isLiving = function() {
        return this.ttl > 0;
    };

    /**
     * Draws this particle.
     * @param {Object} ctx - the canvas context
     */
    window.game.Particle.prototype.draw = function(ctx) {
        var radius = 5;

        // Only draw the particle if we can see it. Circles are centered on x,y,
        // so we need to subtract radius here.
        if ( !game.Camera.canSeeRect(this.x - radius, this.y - radius, radius * 2, radius * 2) ) return;

        var alpha = this.ttl;
        ctx.save();
        var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius);

        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();

        // Cap alpha in case we lagged and it jumped below 0 (this isn't
        // strictly necessary)
        alpha = Math.max(0.0, alpha);
        alpha = Math.min(1.0, alpha);
        // A problem occurs with really tiny floating point numbers, e.g.
        // 2.7755575615628914e-17
        // addColorStop will choke on the 'e'.
        if ( alpha < .00005 ) alpha = 0;

        gradient.addColorStop(0, 'rgba(0,255,255,'+alpha+')');
        gradient.addColorStop(0.4, 'rgba(0,0,255,'+alpha+')');
        gradient.addColorStop(1, 'rgba(0,0,0,'+alpha+')');
        
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, radius, Math.PI * 2, false);
        ctx.fill();

        ctx.restore();
    };

}());