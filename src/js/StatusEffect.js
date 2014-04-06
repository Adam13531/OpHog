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
     * The type of the status effect. For now, there are only three, so I'm
     * hard-coding these values. The way this works may eventually change.
     */
    window.game.EffectType = {
        STAT_BOOST: 0, // red aura, should be used when boosting all stats
        REGEN: 1,
        POISON: 2,
        DEFENSE_BOOST: 3, // blue aura, should be used when boosting just def
    };

    /**
     * This is the how much we expand a unit's rectangle by when we draw the
     * status effect. It is purely a visual thing.
     * @type {Number}
     */
    game.STATUS_EFFECT_PADDING = 5;

    /**
     * StatusEffect affect units, and are typically buffs or debuffs.
     * @param {Unit} target - the target of this status effect
     * @param {game.EffectType} type   - the type of this status effect
     * @param {Object} options - an optional object containing any of the
     * following:
     *     atkModifier - Number
     *     defModifier - Number
     *     maxLifeModifier - Number
     *     modifyLifeOnProc - Number
     *
     *     See comments below for more information on each.
     */
    window.game.StatusEffect = function StatusEffect(target, type, options) {
        if ( options === undefined ) options = {};

        // Save these on the off-chance that the GameDataManager ever has to
        // restore them.
        this.options = options;

        var atkModifier = (options.atkModifier === undefined ? 0 : options.atkModifier);
        var defModifier = (options.defModifier === undefined ? 0 : options.defModifier);
        var maxLifeModifier = (options.maxLifeModifier === undefined ? 0 : options.maxLifeModifier);
        var modifyLifeOnProc = (options.modifyLifeOnProc === undefined ? 0 : options.modifyLifeOnProc);

        this.target = target;
        this.type = type;

        // If any of these are non-zero, it will be applied to the target for
        // the duration of this effect's life.
        this.atkModifier = atkModifier;
        this.defModifier = defModifier;

        // maxLifeModifier in particular will ONLY modify maxLife; it will not
        // also heal the unit for some amount of life (although you can write
        // code for a specific StatusEffect to do that if you want). Likewise,
        // if a unit's life is restored while its maxLife is elevated, nothing
        // will be done when the StatusEffect wears off, so it will have
        // life>maxLife at that point.
        this.maxLifeModifier = maxLifeModifier;

        // Every time this effect procs, the target's life will be modified by
        // this much (negative is damage).
        this.modifyLifeOnProc = modifyLifeOnProc;

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
                // If the caller didn't define stat bonuses, then we'll define
                // them here based on the level of the target.
                if ( this.atkModifier == 0 && this.defModifier == 0 && this.maxLifeModifier == 0 ) {
                    this.atkModifier = target.level * 5;
                    this.defModifier = Math.ceil(target.level / 2);
                    this.maxLifeModifier = target.level * 5;
                }

                this.drawColor = '255,0,0'; //red
                break;
            case game.EffectType.DEFENSE_BOOST:
                // If the caller didn't define stat bonuses, then we'll define
                // them here based on the level of the target.
                if ( this.atkModifier == 0 && this.defModifier == 0 && this.maxLifeModifier == 0 ) {
                    this.defModifier = Math.ceil(target.level / 2);
                }

                this.drawColor = '0,0,255'; //blue
                break;
            case game.EffectType.REGEN:
                // If the caller didn't specify the amount, then we define it
                // here based on the level of the target.
                if ( this.modifyLifeOnProc == 0 ) {
                    this.modifyLifeOnProc = target.level * 10;
                }
                this.procEvery = 1;
                this.drawColor = '255,0,255'; // pink
                break;
            case game.EffectType.POISON:
                // If the caller didn't specify the amount, then we define it
                // here based on the level of the target.
                if ( this.modifyLifeOnProc == 0 ) {
                    this.modifyLifeOnProc = target.level * -10;
                }
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

        // If this procs every so often, then we should make it last a multiple
        // of 'procEvery' so that it doesn't stay around for a while without
        // procing.
        if ( this.procEvery != 0 ) {
            if ( Math.floor(this.ttl / this.procEvery) != Math.ceil(this.ttl / this.procEvery) ) {
                this.ttl = Math.ceil(this.ttl / this.procEvery) * this.procEvery;
            }
        }

        // Poison shouldn't be a guaranteed win against bosses; reduce damage by
        // 95%.
        if ( this.modifyLifeOnProc < 0 && target.isBoss() ) {
            this.modifyLifeOnProc = Math.floor(this.modifyLifeOnProc / 20.0);
        }

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
     */
    window.game.StatusEffect.prototype.draw = function(ctx) {
        var target = this.target;

        // Pad the rectangle that we draw
        var padding = game.STATUS_EFFECT_PADDING;

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
     */
    window.game.StatusEffect.prototype.proc = function() {
        if ( this.modifyLifeOnProc != 0 ) {
            this.target.modifyLife(this.modifyLifeOnProc, true, false);
        }

        switch(this.type) {
            case game.EffectType.REGEN:
                break;
            case game.EffectType.POISON:
                // Spawn a particle system too

                var options = {
                    particleGradients: [game.GREEN_GRADIENT],
                    particleSpeed: [100,150],
                    particleSize: [4,6],
                    numParticlesPerBurst: [3,6]
                };
                var particleSystem = new game.ParticleSystem(this.target.getCenterX(), this.target.getCenterY(), options);
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
