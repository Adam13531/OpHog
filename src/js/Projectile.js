( function() {

    // x and y are the "fire" points of the owner (in pixels). The projectile
    // should know how to position itself based on those points. It doesn't
    // actually do this right now.
    //
    // Note: "fire points" are simply where the projectile is shot. This may be
    // the end of a wizard's staff or the middle of an archer's bow.
    window.game.Projectile = function Projectile(x,y,type, owner, target) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.owner = owner;
        this.target = target;

        // Use a boolean to keep track of whether this is alive
        this.living = true;

        // 300 pixels / second
        this.speed = 300;


        // This is here just as a hack for now. "Melee projectiles" may still
        // need to spawn particle systems when they hit, so I'll leave this
        // functionality here.
        this.isMelee = false;

        this.graphicIndex = 0;

        this.diesIfTargetIsDead = true;

        // 0 == arrow
        if ( type == 0 ) {
            // Simplify to just left and right for now. We can polish this later
            // to base it on which way the arrow is traveling at any instant in
            // time (we could rotate sprites too if we want)

            if ( this.owner.isPlayer ) {
                // 92 == right
                this.graphicIndex = 92;
            } else {
                // 88 == left
                this.graphicIndex = 88;
            }

        }

        // Revive
        if ( this.type == 1 ) {
            this.speed = 50;
            this.graphicIndex = 127;
            this.diesIfTargetIsDead = false;
        }


        if ( this.isMelee ) {
            this.speed = 9999999999;
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
        if ( this.type == 1 ) {
            this.speed += .5;
        }

        var deltaAsSec = delta / 1000;
        var change = this.speed * deltaAsSec;

        var desiredX = this.target.getCenterX();
        var desiredY = this.target.getCenterY();

        var distX = desiredX - this.x;
        var distY = desiredY - this.y;

        // The desired angle of the projectile
        var angle = Math.atan2(distY, distX);

        this.x += change * Math.cos(angle);
        this.y += change * Math.sin(angle);


        if ( Math.abs(this.x - desiredX) < change ) {
            this.x = desiredX;
        }
        if ( Math.abs(this.y - desiredY) < change ) {
            this.y = desiredY;
        }

        var atDestination = ((this.x == desiredX) && (this.y == desiredY));
        if ( atDestination ) {
            this.projectileMetTarget();
            this.owner.projectileCallback(this);
            this.living = false;
        }

    };

    /**
     * This function is here for any projectile-specific code, e.g. making a
     * particle system.
     */
    window.game.Projectile.prototype.projectileMetTarget = function() {
        var particleSystem = new game.ParticleSystem(this.x, this.y);
        game.ParticleManager.addSystem(particleSystem);
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
        if ( this.isMelee ) return;

        objSheet.drawSprite(ctx, this.graphicIndex, this.x, this.y);
    };

}());