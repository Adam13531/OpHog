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
     * A projectile.
     * @param {Number} x - the "fire" coordinates of the owner (in pixels), i.e.
     * where the projectile gets shot from; this may be the end of a wizard's
     * staff or the middle of an archer's bow. The projectile knows how to
     * position itself based on those points.
     * @param {Number} y - see 'x'
     * @param {game.Ability} associatedAbility - the ability that caused this
     * projectile to be produced. We later pull various bits of data from it.
     * @param {Unit} target - the target of this projectile
     * @param {Unit} owner - the unit who created this projectile
     */
    window.game.Projectile = function Projectile(x,y,associatedAbility, owner, target) {
        this.width = game.TILESIZE;
        this.height = game.TILESIZE;

        // Center this projectile on the point that was passed in.
        this.setCenterX(x);
        this.setCenterY(y);

        this.associatedAbility = associatedAbility;
        this.owner = owner;
        this.target = target;

        // Use a boolean to keep track of whether this is alive
        this.living = true;

        // 300 pixels / second
        this.speed = 300;

        this.diesIfTargetIsDead = true;

        this.graphicIndex = this.owner.currentAbility.graphicIndex;

        if ( this.associatedAbility.type == game.AbilityType.REVIVE ) {
            this.speed = 50;
            this.diesIfTargetIsDead = false;
        }
    };

    /**
     * Updates the projectile.
     * @param  {Number} delta The number of ms that have passed since this
     *                        was last called.
     * @return {null}
     */
    window.game.Projectile.prototype.update = function(delta) {
        if (this.diesIfTargetIsDead && !this.target.isLiving()) {
            this.living = false;
            return;
        }

        // The revive projectile gets faster as it lives longer so that it can
        // catch repositioning units.
        if ( this.associatedAbility.type == game.AbilityType.REVIVE ) {
            this.speed += .5;
        }

        var deltaAsSec = delta / 1000;
        var change = this.speed * deltaAsSec;

        var desiredX = this.target.getCenterX();
        var desiredY = this.target.getCenterY();

        var newCoords = game.util.chaseCoordinates(this.getCenterX(), this.getCenterY(), desiredX, desiredY, change, true);
        this.setCenterX(newCoords.x);
        this.setCenterY(newCoords.y);

        if ( newCoords.atDestination ) {
            this.projectileMetTarget();
            this.owner.projectileCallback(this);
            this.living = false;
        }

    };

    window.game.Projectile.prototype.getCenterX = function() {
        return this.x + this.width / 2;
    };
    window.game.Projectile.prototype.getCenterY = function() {
        return this.y + this.height / 2;
    };
    window.game.Projectile.prototype.setCenterX = function(pixelX) {
        this.x = pixelX - this.width / 2;
    };
    window.game.Projectile.prototype.setCenterY = function(pixelY) {
        this.y = pixelY - this.height / 2;
    };

    /**
     * This function is here for any projectile-specific code, e.g. making a
     * particle system.
     *
     * This is called BEFORE the projectile callback is triggered, so this
     * projectile hasn't killed/revived/whatever'd the target yet.
     */
    window.game.Projectile.prototype.projectileMetTarget = function() {
        game.AudioManager.playAudio(game.Audio.HIT_1);
        var particleSystem = new game.ParticleSystem(this.getCenterX(), this.getCenterY(), this.associatedAbility.particleSystemOptions);
        game.ParticleManager.addSystem(particleSystem);

        var explosionID = this.associatedAbility.explosionEffectID;
        if ( explosionID !== undefined ) {
            game.AnimatedSpriteManager.createAnimatedSpriteByID(explosionID, this.x, this.y);
        }
    };

    /**
     * Returns true if this projectile is alive.
     */
    window.game.Projectile.prototype.isLiving = function() {
        return this.living;
    };

    /**
     * Draws the projectile.
     * @param  {Object} ctx the canvas.
     */
    window.game.Projectile.prototype.draw = function(ctx) {
        if ( !game.Camera.canSeeRect(this.x, this.y, game.TILESIZE, game.TILESIZE) ) return;

        // All enemy units need to have their projectiles facing the opposite
        // direction
        if ( this.owner.isEnemy() ) {
            eff24Sheet.drawSprite(ctx, this.graphicIndex, this.x, this.y, true);
        } else {
            eff24Sheet.drawSprite(ctx, this.graphicIndex, this.x, this.y);
        }
    };

}());