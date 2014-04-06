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
        this.sellPrice = itemData.sellPrice;

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
            this.atk = game.util.randomIntegerInRange(itemData.atk);
            this.def = game.util.randomIntegerInRange(itemData.def);
            this.life = game.util.randomIntegerInRange(itemData.life);
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

        this.graphicIndex = itemData.graphicIndex;

        this.removesAbilities = itemData.removesAbilities;

        // These don't need to be copies here since they will get copied by the
        // unit.
        this.addsAbilities = itemData.addsAbilities;

        this.updateHtmlDescription();
    };

    /**
     * This makes sure that the HTML description that shows up in the inventory
     * UIs is correct. Originally, this was done directly in ItemData.js because
     * all items of the same type were exactly the same. Now, stats can differ
     * on items, so this is dynamic content.
     */
    window.game.Item.prototype.updateHtmlDescription = function() {
        var itemData = game.GetItemDataFromID(this.itemID);
        var defaultHtmlDescription = itemData.htmlDescription;

        this.htmlDescription = defaultHtmlDescription;

        if ( !this.usable ) {
            if ( this.atk != 0 || this.def != 0 || this.life != 0 ) {
                this.htmlDescription += '<br/>';

                if ( this.atk != 0 ) {
                    var atkText = '<font color="' + (this.atk > 0 ? 'white' : '#ff0000') + '">';
                    atkText += (this.atk > 0 ? '+' : '') + this.atk + '</font>';

                    this.htmlDescription += game.util.makeTransparentImgTag('icon-sprite dagger-icon') + atkText + ' ';
                }
                if ( this.def != 0 ) {
                    var defText = '<font color="' + (this.def > 0 ? 'white' : '#ff0000') + '">';
                    defText += (this.def > 0 ? '+' : '') + this.def + '</font>';
                    this.htmlDescription += game.util.makeTransparentImgTag('icon-sprite shield-icon') + defText + ' ';
                }
                if ( this.life != 0 ) {
                    var lifeText = '<font color="' + (this.life > 0 ? 'white' : '#ff0000') + '">';
                    lifeText += (this.life > 0 ? '+' : '') + this.life + '</font>';
                    this.htmlDescription += game.util.makeTransparentImgTag('icon-sprite heart-icon') + lifeText;
                }
            }
        }

        // Add mods to the item's description.
        if ( this.mods.length > 0 ) {
            if ( this.usable ) {
                console.log('Usable item found with mods! This should be disallowed: ' + this.name);
            }

            for (var i = 0; i < this.mods.length; i++) {
                this.htmlDescription += '<br/>' + this.mods[i].getDescription();
            };
        }
    };

    /**
     * @return {String} a string like '-64px -0px' which represents the position
     * in the spritesheet so that DOM elements can show the item (they can't
     * understand graphicIndex).
     */
    window.game.Item.prototype.getCssBackgroundPosition = function() {
        var numCols = itemSheet.getNumSpritesPerRow();
        var x = -1 * (this.graphicIndex % numCols) * game.ITEM_SPRITE_SIZE;
        var y = -1 * Math.floor(this.graphicIndex / numCols) * game.ITEM_SPRITE_SIZE;
        return x + 'px ' + y + 'px';
    };

    window.game.Item.prototype.isEquippableBy = function(equippableBy) {
        return !this.usable && (this.equippableBy & equippableBy) != 0;
    };

    /**
     * Uses an item on a unit. The caller must know whether this item is usable
     * on a unit (so that he can pass the correct argument (a unit) in)
     * @param  {Unit} unit - the target
     */
    window.game.Item.prototype.useOnUnit = function(unit) {
        this.quantity--;

        switch(this.itemID) {
            case game.ItemType.STAT_GEM.id:
                unit.addStatusEffect(game.EffectType.STAT_BOOST);
                break;
            case game.ItemType.HEAL_GEM.id:
                unit.addStatusEffect(game.EffectType.REGEN);
                break;
            case game.ItemType.POISON_GEM.id:
                unit.addStatusEffect(game.EffectType.POISON);
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
                game.currentMap.setFog(tileX, tileY, 6, false, true);
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
