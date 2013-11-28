( function() {

    /**
     * Items can't be both stackable and equippable.
     *
     * If an item is not in a slot, then there's no reference to it.
     */
    window.game.Item = function Item(itemID) {
        var itemData = game.GetItemDataFromID(itemID);

        this.itemID = itemID;
        this.name = itemData.name;
        this.usable = false;
        this.stackable = false;
        this.equippableBy = game.EquippableBy.NONE;

        if ( itemData.usable ) {
            this.usable = true;

            this.useTarget = itemData.useTarget;
            if ( itemData.useTarget == null ) {
                console.log('Error: you must specify a useTarget for ' + itemID + ': ' + itemData.name);
            }

            if ( itemData.stackable ) {
                this.quantity = (itemData.startingQuantity) ? itemData.startingQuantity : 1;
                this.stackable = true;
            } else {
                // This is used to keep track of whether we've used the item or
                // not.
                this.quantity = 1;
            }
        } else {
            this.equippableBy = itemData.equippableBy;
            this.placementCost = itemData.placementCost;
        }

        this.mods = [];

        // Make sure to COPY mods over in case we ever modify them through the
        // unit. We wouldn't want to change the item's template, otherwise we'd
        // be modifying all future copies of that item.
        if ( itemData.mods !== undefined ) {
            for (var i = 0; i < itemData.mods.length; i++) {
                this.mods.push(itemData.mods[i].copy());
            };
        }

        this.cssClass = itemData.cssClass;
        this.htmlDescription = itemData.htmlDescription;

        this.removesAbilities = itemData.removesAbilities;

        // These don't need to be copies here since they will get copied by the
        // unit.
        this.addsAbilities = itemData.addsAbilities;
    };

    window.game.Item.prototype.isEquippableBy = function(equippableBy) {
        return !this.usable && (this.equippableBy & equippableBy) != 0;
    };

    /**
     * We define items without specifying their graphic indices, because we
     * instead specify their background-positions with a css class. It's not the
     * most optimal way of doing things, but I should fix this in another
     * commit.
     */
    window.game.Item.prototype.getGraphicIndex = function() {
        var valString = game.util.getCssPropertyFromCssClass(this.cssClass, 'background-position');
        var valArray = valString.split(' ');
        var x = Math.abs(parseInt(valArray[0])) / game.ITEM_SPRITE_SIZE;
        var y = Math.abs(parseInt(valArray[1])) / game.ITEM_SPRITE_SIZE;
        var graphicIndex = y * itemSheet.getNumSpritesPerRow() + x;
        return graphicIndex;
    };

    /**
     * Uses an item on a unit. The caller must know whether this item is usable
     * on a unit (so that he can pass the correct argument (a unit) in)
     * @param  {Unit} unit - the target
     * @return {null}
     */
    window.game.Item.prototype.useOnUnit = function(unit) {
        this.quantity--;

        switch(this.itemID) {
            case game.ItemType.STAT_GEM.id:
                var statusEffect = new game.StatusEffect(unit, game.EffectType.STAT_BOOST);
                unit.addStatusEffect(statusEffect);
                break;
            case game.ItemType.HEAL_GEM.id:
                var statusEffect = new game.StatusEffect(unit, game.EffectType.REGEN);
                unit.addStatusEffect(statusEffect);
                break;
            case game.ItemType.POISON_GEM.id:
                var statusEffect = new game.StatusEffect(unit, game.EffectType.POISON);
                unit.addStatusEffect(statusEffect);
                break;
            case game.ItemType.POTION.id:
                unit.restoreLife();
                break;
            case game.ItemType.REVIVE_POTION.id:
                unit.restoreLife();
                break;
            default:
                console.log('Unrecognized item type: ' + this.itemID);
                break;
        }

        var particleSystem = new game.ParticleSystem(unit.getCenterX(), unit.getCenterY());
        game.ParticleManager.addSystem(particleSystem);
    };

    /**
     * Attempts to use the item on the map. The caller must know whether this
     * item is usable on the map (so that he can pass the correct arguments
     * (coords) in)
     * @param  {Number} x - world coordinate
     * @param  {Number} y - world coordinate
     * @return {Boolean} true if the item was used.
     */
    window.game.Item.prototype.useOnMap = function(x, y) {
        var used = false;

        var tileX = Math.floor(x / game.TILESIZE);
        var tileY = Math.floor(y / game.TILESIZE);

        if ( this.itemID == game.ItemType.REVEALER.id ) {
            // For now, every tile will be considered valid, so we'll always set
            // 'used' to true.
            used = true;
            if ( used ) {
                // For now, the only effect is to clear fog, so we'll hard-code that
                // here. Eventually, it should check item type or effect.
                game.currentMap.setFog(tileX, tileY, 4, false, true);
            }
        }

        // Only tiles close to spawners are valid.
        if ( this.itemID == game.ItemType.CREATE_SPAWNER.id ) {
            used = game.currentMap.attemptToCreateSpawner(tileX, tileY, 6);
        }
        if ( this.itemID == game.ItemType.MEGA_CREATE_SPAWNER.id ) {
            used = game.currentMap.attemptToCreateSpawner(tileX, tileY, 20);
        }

        if ( used ) {
            this.quantity--;
            var particleSystem = new game.ParticleSystem(x, y);
            game.ParticleManager.addSystem(particleSystem);
        }

        return used;
    };

    /**
     * Returns true if this item has been used up. Even non-stackable items have
     * a quantity, so this just checks if the quantity is less than 1.
     * @return {Boolean} true if depleted
     */
    window.game.Item.prototype.isDepleted = function() {
        return this.usable && this.quantity <= 0;
    };

}());
