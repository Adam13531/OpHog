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
     * Debug code to get item data based on the ID. This function will probably
     * still exist in some capacity in the future, but its contents will be
     * different.
     * @param {Number} itemID - ID of the item whose data you want
     */
    window.game.GetItemDataFromID = function(itemID) {
        var item = game.util.getItemInContainerByProperty(game.ItemType, 'id', itemID);
        if ( item !== null ) return item;

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
    };

    /**
     * Required properties:
     * id, itemLevel, name, htmlDescription, [usable|equippableBy], graphicIndex
     * If 'usable' is true, then you need to specify 'useTarget'
     *
     * Optional properties:
     * stackable (if this is provided, then startingQuantity can also be provided, otherwise the default is 1)
     * mods - an Array:ItemMod. If this is provided, these mods will be applied to units who equip the items.
     * removesAbilities - an Array:Number, optional. If specified, a unit with 
     *     this item equipped CANNOT have abilities with any of these IDs, even
     *     if they were added by another item.
     * addsAbilities - an Array:Object, optional. The objects must contain an 
     *     "id" parameter corresponding to an ability ID, then you can include 
     *     any parameters you want to override. If a unit does not have the ID
     *      specified, then they will be granted that ability, otherwise their 
     *      existing ability will be updated. For example, if you want to make 
     *      them attack with a different relative weight, specific 
     *      game.Ability.ATTACK.id and a new relativeWeight.
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
            graphicIndex: game.Graphic.RED_GEM,
        },
        SHIELD: {
            id: 1,
            itemLevel:1,
            atk: 5,
            life: 15,
            def: 5,
            name:'Grugtham\'s Shield',
            htmlDescription:'<font color="#660000"><b>500000 Dragon Kill Points<b/></font>',
            equippableBy: game.EquippableBy.ALL,
            removesAbilities: [
                game.Ability.ATTACK.id
            ],
            addsAbilities: [
                {
                    id: game.Ability.BOULDER_DROP.id,
                    relativeWeight: 9000,
                }
            ],
            graphicIndex: game.Graphic.RED_WHITE_SHIELD,
            mods: [new game.Thorns(5), new game.ReduceDamage(5)]
        },
        SWORD: {
            id: 2,
            itemLevel:1,
            name:'Skull Stab',
            htmlDescription:'<font color="#660000"><b>This sword can actually only pierce hearts.<b/></font>',
            equippableBy: game.EquippableBy.WAR | game.EquippableBy.ARCH,
            removesAbilities: [
                game.Ability.ATTACK.id
            ],
            addsAbilities: [
                {
                    id: game.Ability.ATTACK.id,
                    graphicIndex: game.Graphic.RED_FIREBALL_RIGHT,
                    relativeWeight: 9000,
                },
                {
                    id: game.Ability.BOULDER_DROP.id,
                    relativeWeight: 9000,
                }
            ],
            graphicIndex: game.Graphic.GRAY_SWORD,
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
            graphicIndex: game.Graphic.CYAN_GEM,
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
            graphicIndex: game.Graphic.THIN_RED_POTION,
        },
        REVEALER: {
            id: 5,
            itemLevel:1,
            name:'Vizier\'s Vision',
            htmlDescription:'<font color="#a3a3cc"><b>The vista makes for a great vantage point.<b/></font>',
            usable:true,
            useTarget: game.UseTarget.MAP,
            stackable:true,
            startingQuantity:3,
            graphicIndex: game.Graphic.GOLD_EYE_NECKLACE,
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
            graphicIndex: game.Graphic.GREEN_GEM,
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
            graphicIndex: game.Graphic.SMALL_YELLOW_SQUARE_ITEM,
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
            graphicIndex: game.Graphic.LARGE_YELLOW_SQUARE_ITEM,
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
            graphicIndex: game.Graphic.FAT_YELLOW_POTION,
        },
    };

    // This is debug code to put the item name in the item's description. It's
    // run directly after defining the items above.
    ( function verifyAllUnitData() {
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

            // Equippable items
            if ( item.usable == false || item.usable === undefined ) {
                game.util.useDefaultIfUndefined(item, 'atk', 0);
                game.util.useDefaultIfUndefined(item, 'def', 0);
                game.util.useDefaultIfUndefined(item, 'life', 0);

                // Make sure all equippable items have a placementCost.
                game.util.useDefaultIfUndefined(item, 'placementCost', 0);
                item.htmlDescription += '<br/>' + 'Increases placement cost by ' + item.placementCost;

                if ( item.atk > 0 || item.def > 0 || item.life > 0 ) {
                    item.htmlDescription += '<br/>';
                    if ( item.atk > 0 ) item.htmlDescription += '+' + item.atk + ' atk ';
                    if ( item.def > 0 ) item.htmlDescription += '+' + item.def + ' def ';
                    if ( item.life > 0 ) item.htmlDescription += '+' + item.life + ' life';
                }
            }
        };
    }());

}());
