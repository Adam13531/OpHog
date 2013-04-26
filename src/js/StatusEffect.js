( function() {

    /**
     * The type of the status effect. For now, there are only three, so I'm
     * hard-coding these values. The way this works may eventually change.
     */
    window.game.EffectType = {
        STAT_BOOST: 0,
        REGEN: 1,
        POISON: 2
    };

    /**
     * StatusEffect affect units, and are typically buffs or debuffs.
     *
     * @param {Unit} target - the target of this status effect
     * @param {game.EffectType} type   - the type of this status effect
     */
    window.game.StatusEffect = function StatusEffect(target, type) {
        this.target = target;
        this.type = type;

        // If any of these are non-zero, it will be applied to the target for
        // the duration of this effect's life.
        this.atkModifier = 0;
        this.defModifier = 0;

        // maxLifeModifier in particular will ONLY modify maxLife; it will not
        // also heal the unit for some amount of life (although you can write
        // code for a specific StatusEffect to do that if you want). Likewise,
        // if a unit's life is restored while its maxLife is elevated, nothing
        // will be done when the StatusEffect wears off, so it will have
        // life>maxLife at that point.
        this.maxLifeModifier = 0;

        /**
         * If this is non-zero, then this effect will "proc" every time this
         * many seconds passes. To see what "proc" means, go here:
         * http://www.wowwiki.com/Proc
         *
         * There are only time-based procs for right now.
         * @type {Number}
         */
        this.procEvery = 0;

        /**
         * Every StatusEffect is drawn as a rectangle for now, so this is the
         * color of that rectangle in the form 'R,G,B'.
         * @type {String}
         */
        this.drawColor = '0,0,0';

        switch(this.type) {
            case game.EffectType.STAT_BOOST:
                this.atkModifier = 500;
                this.defModifier = 500;
                this.maxLifeModifier = 500;
                this.drawColor = '255,0,0'; //red
                break;
            case game.EffectType.REGEN:
                this.procEvery = 1;
                this.drawColor = '255,0,255'; // pink
                break;
            case game.EffectType.POISON:
                this.procEvery = 3;
                this.drawColor = '0,128,0'; // dark green
                break;
            default:
                console.log('Unrecognized StatusEffect type: ' + this.type);
                break;
        }

        /**
         * Time to live, in seconds
         * @type {Number}
         */
        this.ttl = 10;

        /**
         * This keeps track of when the effect should proc next, if ever. It's
         * like "cooldown".
         * @type {Number}
         */
        this.procTimer = this.procEvery;
    };

    /**
     * Draws the StatusEffect.
     * @param  {Object} ctx - canvas context
     * @return {null}
     */
    window.game.StatusEffect.prototype.draw = function(ctx) {
        var target = this.target;

        // Pad the rectangle that we draw
        var padding = 5;

        // Save the canvas context because we modify the fillStyle
        ctx.save();

        // Blink is always between [-1,1] thanks to sin, so alpha is in the
        // range [.35,.65].
        var blink = Math.sin(game.alphaBlink * 4);
        var alpha = blink * .15 + .5;

        ctx.fillStyle = 'rgba(' + this.drawColor + ', ' + alpha + ')';
        ctx.fillRect(target.x - padding, target.y - padding, target.width + padding * 2, target.height + padding * 2);
        ctx.restore();
    };

    /**
     * Updates this status effect, possibly proc-ing it.
     * @param  {Number} delta - time since this was last called, in ms
     * @return {null}
     */
    window.game.StatusEffect.prototype.update = function(delta) {
        var deltaAsSec = delta / 1000;

        this.ttl -= deltaAsSec;

        // Check for procs if necessary
        if ( this.procEvery != 0 ) {

            this.procTimer -= deltaAsSec;
            while(this.procTimer <= 0 ) {
                this.proc();
                this.procTimer += this.procEvery;
            }
        }
    };

    /**
     * This is called when the effect is proc'd.
     * @return {null}
     */
    window.game.StatusEffect.prototype.proc = function() {
        switch(this.type) {
            case game.EffectType.REGEN:
                this.target.modifyLife(50, true);
                break;
            case game.EffectType.POISON:
                this.target.modifyLife(-50, true);

                // Spawn a particle system too
                var particleSystem = new game.ParticleSystem(this.target.getCenterX(), this.target.getCenterY());
                game.ParticleManager.addSystem(particleSystem);
                break;
            default:
                console.log('Unrecognized StatusEffect type: ' + this.type);
                break;
        }
    };

    /**
     * @return {Boolean} true if this effect is living
     */
    window.game.StatusEffect.prototype.isLiving = function() {
        return this.ttl > 0;
    };


}());
