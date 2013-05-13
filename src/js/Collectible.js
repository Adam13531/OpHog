( function() {
  
    /**
     * Types of collectibles.
     */
    window.game.CollectibleType = {
        BAD_LOOT: 'bad loot', // note: there's no difference between qualities yet!
        GOOD_LOOT: 'good loot',
        GREAT_LOOT: 'great loot',
        BAD_POWERUP: 'bad powerup',
        GOOD_POWERUP: 'good powerup',
        GREAT_POWERUP: 'great powerup',
    };

    /**
     * A Collectible is something on the map that units can get by walking over.
     * When they are collected, something happens (e.g. a powerup or item is
     * granted).
     * @param {Number} tileX - tile coordinate
     * @param {Number} tileY - tile coordinate
     * @param {game.CollectibleType} type  - type of the collectible
     */
    window.game.Collectible = function Collectible(tileX, tileY, type) {
        this.tileX = tileX;
        this.tileY = tileY;
        this.type = type;

        this.graphicIndex = 0;

        // Time to live, in seconds
        this.ttl = 30;

        // Time to glow, in seconds. This simply highlights that a new
        // collectible was placed.
        this.glowTTL = 3;

        // The alpha value to draw the glow
        this.glowAlpha = .4;

        // Set graphic index based on type
        switch(this.type) {
            case game.CollectibleType.BAD_LOOT:
                this.graphicIndex = 8; // bag
                break;
            case game.CollectibleType.GOOD_LOOT:
            case game.CollectibleType.GREAT_LOOT:
                this.graphicIndex = 0; // treasure chest
                break;
            case game.CollectibleType.BAD_POWERUP:
            case game.CollectibleType.GOOD_POWERUP:
            case game.CollectibleType.GREAT_POWERUP:
                this.graphicIndex = Math.floor(Math.random() * 4) + 60; // wand
                break;
            default:
                console.log('Unrecognized Collectible type: ' + type);
                break;
        }
    };

    /**
     * Updates the collectible.
     * @param  {Number} delta - time elapsed in ms since last call
     * @return {null}
     */
    window.game.Collectible.prototype.update = function(delta) {
        var deltaAsSec = delta / 1000;
        var change = this.speed * deltaAsSec;

        this.ttl -= deltaAsSec;
        this.glowTTL -= deltaAsSec;
    };

    /**
     * @return {Boolean} true if this collectible's TTL is greater than 0.
     */
    window.game.Collectible.prototype.isLiving = function() {
        return this.ttl > 0;
    };

    /**
     * This is called when a unit collects this item.
     * @param  {Unit} unit - the collector
     * @return {null}
     */
    window.game.Collectible.prototype.collectedBy = function(unit) {
        switch(this.type) {
            case game.CollectibleType.BAD_LOOT:
            case game.CollectibleType.GOOD_LOOT:
            case game.CollectibleType.GREAT_LOOT:
                // Randomly grant an item
                game.Inventory.addItem(new game.Item(Math.floor(Math.random() * 7)));
                break;
            case game.CollectibleType.BAD_POWERUP:
            case game.CollectibleType.GOOD_POWERUP:
            case game.CollectibleType.GREAT_POWERUP:
                // Give a buff
                var statusEffect = new game.StatusEffect(unit, game.EffectType.STAT_BOOST);
                unit.addStatusEffect(statusEffect);
                break;
            }
        var particleSystem = new game.ParticleSystem(unit.getCenterX(), unit.getCenterY());
        game.ParticleManager.addSystem(particleSystem);
    };

    /**
     * Draws this collectible.
     * @param  {Object} ctx - canvas context
     * @return {null}
     */
    window.game.Collectible.prototype.draw = function(ctx) {
        // Only draw if the camera can see this
        if ( !game.Camera.canSeeTileCoordinates(this.tileX, this.tileY) ) return;
        
        var worldX = this.tileX * tileSize;
        var worldY = this.tileY * tileSize;
        ctx.save();

        // Draw the item with transparency when it's about to die
        if ( this.ttl < 15 ) {
            var amplitude = 4;

            // Amplify the blink speed when it's closer to death
            if ( this.ttl < 10 ) {
                amplitude = 6;
            }
            if ( this.ttl < 5 ) {
                amplitude = 10;
            }
            var blink = Math.sin(game.alphaBlink * amplitude);
            ctx.globalAlpha = blink * .4 + .6;
        }

        // This logic is only here so that the glowAlpha doesn't chop off
        // immediately when glowTTL hits 0.
        if ( this.glowAlpha > 0 ) {
            if ( this.glowTTL > 0 ) {
                this.glowAlpha = Math.sin(game.alphaBlink * 4) * .1 + .3;
            } else {
                // When TTL is 0, we will fade out the alpha here.
                this.glowAlpha -= .0125;
            }

            // Draw a glowy background
            ctx.fillStyle = 'rgba(200, 255, 0, ' + this.glowAlpha + ')';
            ctx.fillRect(worldX, worldY, tileSize, tileSize);
        }

        objSheet.drawSprite(ctx, this.graphicIndex, worldX, worldY);

        ctx.restore();
    };

}());