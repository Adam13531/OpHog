/*
 * OpHog - https://github.com/Adam13531/OpHog
 * Copyright (C) 2014  Adam Damiano
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
( function() {
  
    /**
     * Particle class
     * @param {Object} particleSystem - the system that spawned this
     */
    window.game.Particle = function Particle(particleSystem) {
        this.particleSystem = particleSystem;

        // Generate an angle and a distance from the center so that our
        // particles spawn in a circular area.
        var angle = Math.random() * 2 * Math.PI;
        var spawnRadius = game.util.randomIntegerInRange(this.particleSystem.particleSpawnRadius);

        this.x = this.particleSystem.x + spawnRadius * Math.cos(angle);
        this.y = this.particleSystem.y + spawnRadius * Math.sin(angle);

        this.radius = game.util.randomIntegerInRange(this.particleSystem.particleSize);

        this.gradient = game.util.randomArrayElement(this.particleSystem.particleGradients);

        // Number of ms to live
        this.ttl = game.util.randomIntegerInRange(this.particleSystem.particleTTL);
        this.startTTL = this.ttl;

        // Pixels per second
        var maxSpeed = game.util.randomIntegerInRange(this.particleSystem.particleSpeed);
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

        this.ttl -= delta;
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
        // Only draw the particle if we can see it. Circles are centered on x,y,
        // so we need to subtract radius here.
        if ( !game.Camera.canSeeRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2) ) return;

        var alpha = this.ttl / this.startTTL;
        ctx.save();

        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();

        // A problem occurs with really tiny floating point numbers, e.g.
        // 2.7755575615628914e-17 (addColorStop will choke on the 'e').
        alpha = Math.max(0.00005, alpha);
        alpha = Math.min(1.0, alpha);

        var ctxGradient = this.gradient.getRadialGradiant(ctx, this.x, this.y, 0, this.x, this.y, this.radius, alpha);
        ctx.fillStyle = ctxGradient;

        ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        ctx.fill();

        ctx.restore();
    };

}());