( function() {

    window.game.EquippableBy = {
        NONE: 0,
        WAR: 1,
        WIZ: 2,
        ARCH: 4,
        ALL: 7
    };

    // These are not flags, so don't mask them together. I didn't make them
    // flags because some combinations would make no sense, e.g. 'this item is
    // usable on a battle OR a player unit'.
    // 
    // They represent the possible target for an item.
    window.game.UseTarget = {
        LIVING_PLAYER_UNIT: 'player units',
        LIVING_PLAYER_AND_ENEMY_UNIT: 'player and enemy units',
        LIVING_ENEMY_UNIT: 'enemy units',
        DEAD_PLAYER_UNIT: 'dead player units',
        DEAD_PLAYER_AND_ENEMY_UNIT: 'dead player and enemy units',
        DEAD_ENEMY_UNIT: 'dead enemy units',
        MAP: 'anywhere on the map',
        MAP_WALKABLE_ONLY: 'only on walkable tiles',

        // TODO: when I finally use this, I think the best way to code it would
        // be to highlight all units that are in a battle, that way we can
        // leverage the code for targeting individual units.
        BATTLE: 'battle'
    };

    /**
     * Required properties:
     * id, itemLevel, name, htmlDescription, [usable|equippableBy], cssClass
     * If 'usable' is true, then you need to specify 'useTarget'
     *
     * Optional properties:
     * stackable (if this is provided, then startingQuantity can also be provided, otherwise the default is 1)
     * mods - an Array:ItemMod. If this is provided, these mods will be applied to units who equip the items.
     *
     * Note: the htmlDescription will have '[name]<br/>' prepended to it.
     */
    window.game.ItemType = {
        STAT_GEM: {
            id: 0,
            itemLevel:1,
            name:'The Gem of All Knowledge',
            htmlDescription:'<font color="#a3a3cc"><b>Greatly increases the stats of the target unit.<b/></font>',
            usable:true,
            useTarget: game.UseTarget.LIVING_PLAYER_UNIT,
            stackable:true,
            startingQuantity:3,
            cssClass:'item-sprite redgem32-png'
        },
        SHIELD: {
            id: 1,
            itemLevel:1,
            name:'Grugtham\'s Shield',
            htmlDescription:'<font color="#660000"><b>500000 Dragon Kill Points<b/></font>',
            equippableBy: game.EquippableBy.ALL,
            addsAbilities: [
                {
                    id: game.Ability.BOULDER_DROP.id,
                    relativeWeight: 9000
                }
            ],
            cssClass:'item-sprite shield32-png',
            mods: [new game.Thorns(5), new game.ReduceDamage(5)]
        },
        SWORD: {
            id: 2,
            itemLevel:1,
            name:'Skull Stab',
            htmlDescription:'<font color="#660000"><b>This sword can actually only pierce hearts.<b/></font>',
            equippableBy: game.EquippableBy.WAR | game.EquippableBy.ARCH,
            addsAbilities: [
                {
                    id: game.Ability.ATTACK.id,
                    graphicIndex: 105,
                    allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
                    relativeWeight: 9000
                }
            ],
            cssClass:'item-sprite sword32-png',
            mods: [new game.LifeLeech(.5, .5), new game.MultipleProjectiles(2)],
            placementCost: 10
        },
        HEAL_GEM: {
            id: 3,
            itemLevel:1,
            name:'Gem of Regen',
            htmlDescription:'<font color="#a3a3cc"><b>Slowly restores the target unit\'s life.<b/></font>',
            usable:true,
            useTarget: game.UseTarget.LIVING_PLAYER_UNIT,
            stackable:true,
            startingQuantity:3,
            cssClass:'item-sprite pinkgem32-png'
        },
        POTION: {
            id: 4,
            itemLevel:1,
            name:'Joachim\'s Wisdom',
            htmlDescription:'<font color="#a3a3cc"><b>Drinking this will make you smart.<b/></font>',
            usable:true,
            useTarget: game.UseTarget.LIVING_PLAYER_UNIT,
            stackable:true,
            startingQuantity:3,
            cssClass:'item-sprite potion32-png'
        },
        LEAF: {
            id: 5,
            itemLevel:1,
            name:'Oculeaf',
            htmlDescription:'<font color="#a3a3cc"><b>Consuming this will give you visions.<b/></font>',
            usable:true,
            useTarget: game.UseTarget.MAP,
            stackable:true,
            startingQuantity:3,
            cssClass:'item-sprite leaf32-png'
        },
        POISON_GEM: {
            id: 6,
            itemLevel:1,
            name:'Essence of Poison',
            htmlDescription:'<font color="#a3a3cc"><b>Poisons the target unit, slowly destroying it.<b/></font>',
            usable:true,
            useTarget: game.UseTarget.LIVING_ENEMY_UNIT,
            stackable:true,
            startingQuantity:3,
            cssClass:'item-sprite greengem32-png'
        },
        CREATE_SPAWNER: {
            id: 7,
            itemLevel:1,
            name:'Spawn Creatorizer',
            htmlDescription:'<font color="#a3a3cc"><b>Creates another spawn point on the map.<b/></font>',
            usable:true,
            useTarget: game.UseTarget.MAP_WALKABLE_ONLY,
            stackable:true,
            startingQuantity:3,
            cssClass:'item-sprite greenrectangle-png'
        },
        MEGA_CREATE_SPAWNER: {
            id: 8,
            itemLevel:1,
            name:'Mega Spawn Creatorizer',
            htmlDescription:'<font color="#a3a3cc"><b>Creates another spawn point on the map.<b/></font>',
            usable:true,
            useTarget: game.UseTarget.MAP_WALKABLE_ONLY,
            stackable:true,
            startingQuantity:3,
            cssClass:'item-sprite redrectangle-png'
        },
        REVIVE_POTION: {
            id: 9,
            itemLevel:1,
            name:'Necromancer\'s Knowledge',
            htmlDescription:'<font color="#a3a3cc"><b>Brings the dead back to life.<b/></font>',
            usable:true,
            useTarget: game.UseTarget.DEAD_PLAYER_UNIT,
            stackable:true,
            startingQuantity:3,
            cssClass:'item-sprite gold-potion-png'
        },
    };

    // This is debug code to put the item name in the item's description. It's
    // run directly after defining the items above.
    for ( var key in game.ItemType ) {
        var item = game.ItemType[key];
        item.htmlDescription = item.name + '<br/>' + item.htmlDescription;
        game.util.useDefaultIfUndefined(item, 'usable', false);
        // Add mods to the item's description.
        if ( item.mods !== undefined ) {
            if ( item.usable ) {
                console.log('Usable item found with mods! This should be disallowed: ' + item.name);
            }

            for (var i = 0; i < item.mods.length; i++) {
                item.htmlDescription += '<br/>' + item.mods[i].getDescription();
            };
        }

        if ( item.addsAbilities !== undefined ) {
            // If this item adds abilities, make sure that all the
            // fields for the ability are defined.
            game.SetDefaultAbilityAttrIfUndefined(item.addsAbilities);
        }

        if ( item.usable == false || item.usable === undefined ) {
            // Make sure all equippable items have a placementCost.
            game.util.useDefaultIfUndefined(item, 'placementCost', 0);
            item.htmlDescription += '<br/>' + 'Increases placement cost by ' + item.placementCost;
        }
    }

    /**
     * Debug code to get item data based on the ID. This function will probably
     * still exist in some capacity in the future, but its contents will be
     * different.
     * @param {Number} itemID - ID of the item whose data you want
     */
    window.game.GetItemDataFromID = function(itemID) {
        for ( var key in game.ItemType ) {
            var item = game.ItemType[key];
            if ( item.id == itemID ) {
                return item;
            }
        }

        console.log('Error - ' + itemID + ' is not a valid item ID.');
        return null;
    };

    /**
     * This is a debug function to generate a random item of any type.
     * @return {Item} - a random item
     */
    window.game.GenerateRandomItem = function() {
        return new game.Item(Math.floor(Math.random() * 8));
    };

    /**
     * Generates a random item. If usable is true, a random usable item is returned.
     * Otherwise, a random equippable item is returned. This function was created so
     * random items can get placed into inventories.
     * @param  {Boolean} usable - true if the desired item is usable
     * @return {Item} - A random item
     */
    // TODO: rename this to GenerateRandomItem and get rid of the old one completely
    window.game.GenerateRandomInventoryItem = function(usable) {
        var validItemList = [];

        for ( var key in game.ItemType ) {
            var item = game.ItemType[key];
            if ( item.usable == usable) {
                validItemList.push(new game.Item(item.id));
            }
        }

        return game.util.randomArrayElement(validItemList);
    }

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

        // Array of abilities that can be added to a unit from this particular
        // item
        this.abilities = [];

        // Do a deep copy of the abilities to make sure the originals aren't
        // modified
        if ( itemData.addsAbilities !== undefined ) {
            for (var i = 0; i < itemData.addsAbilities.length; i++) {
                var ability = game.CopyAbility(itemData.addsAbilities[i]);
                this.abilities.push(ability);
            };
        }
    };


    window.game.Item.prototype.isEquippableBy = function(equippableBy) {
        return !this.usable && (this.equippableBy & equippableBy) != 0;
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

        if ( this.itemID == game.ItemType.LEAF.id ) {
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
