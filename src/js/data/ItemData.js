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
     * @return {Object} an entry in game.ItemType
     */
    window.game.GetItemDataFromID = function(itemID) {
        var item = game.util.getItemInContainerByProperty(game.ItemType, 'id', itemID);
        if ( item !== null ) return item;

        console.log('Error - ' + itemID + ' is not a valid item ID.');
        return null;
    };

    /**
     * Returns a random item no matter what (even if you pass in garbage data).
     * If you pass in a level range that doesn't contain items (e.g.
     * 99999-100000), this function will lower the minLevel until it finds a
     * suitable item, even if that item happens to be level 1. For this reason,
     * there must always be both usable and equippable items at level 1.q
     * @param {Number} minLevel          - minimum allowed level of the item
     * @param {Number} maxLevel          - maximum allowed level
     * @param {Boolean} usableAllowed     - if true, allow usable items
     * @param {Boolean} equippableAllowed - if true, allow equippable items
     * @return {Item} - a random item
     */
    window.game.GenerateRandomItem = function(minLevel, maxLevel, usableAllowed, equippableAllowed) {
        if ( maxLevel < minLevel ) {
            var temp = maxLevel;
            maxLevel = minLevel;
            minLevel = temp;
        }

        maxLevel = Math.max(1, maxLevel);

        if ( usableAllowed === undefined ) {
            usableAllowed = true;
        }
        if ( equippableAllowed === undefined ) {
            equippableAllowed = true;
        }

        // You need to specify at least one of these flags!
        if ( !usableAllowed && !equippableAllowed ) {
            usableAllowed = true;
        }

        var possibleItemIDs = [];
        for(var itemType in game.ItemType ) {
            var item = game.ItemType[itemType];
            var itemLevel = item.itemLevel;
            if ( itemLevel >= minLevel && itemLevel <= maxLevel && ((item.usable && usableAllowed) || (!item.usable && equippableAllowed)) ) {
                possibleItemIDs.push(item.id);
            }
        }

        if ( possibleItemIDs.length == 0 ) {
            // You passed in a range that can't generate items. Cut the minimum
            // level in half and recurse. This will eventually make the minimum
            // level 1, which is guaranteed to generate an item.
            return game.GenerateRandomItem(Math.floor(minLevel / 2), maxLevel, usableAllowed, equippableAllowed);
        }

        var itemID = game.util.randomArrayElement(possibleItemIDs);
        return new game.Item(itemID);
    };

    /**
     * Required properties:
     * id, itemLevel, name, [usable|equippableBy], graphicIndex
     * If 'usable' is true, then you need to specify 'useTarget'
     * sellPrice - this is a base sell price. The total sell price is affected by quantity and stats too.
     *
     * Optional properties:
     * stackable (if this is provided, then startingQuantity can also be provided, otherwise the default is 1)
     * mods - an Array:ItemMod. If this is provided, these mods will be applied to units who equip the items.
     * atk - Array:Number(2) representing a range for the ATK stat on equippable items.
     * life - Array:Number(2) see 'atk'
     * def - Array:Number(2) see 'atk'
     * flavorText - flavor or instruction text for the item.
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
     */
    window.game.ItemType = {
        STAT_GEM: {
            id: 0,
            itemLevel:1,
            name:'The Gem of All Knowledge',
            flavorText:'Boosts the stats of the target unit.',
            usable:true,
            useTarget: game.UseTarget.LIVING_PLAYER_UNIT,
            stackable:true,
            startingQuantity:3,
            sellPrice: .35,
            graphicIndex: game.Graphic.RED_DIAMOND,
        },
        SHIELD: {
            id: 1,
            itemLevel:999999,
            atk: [5,150],
            life: [5,150],
            def: [5,150],
            name:'Grugtham\'s Shield',
            flavorText:'This shield is not attainable through normal means.',
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
            sellPrice: 2,
            graphicIndex: game.Graphic.RED_WHITE_SHIELD,
            mods: [new game.Thorns(5), new game.ReduceDamage(5)]
        },
        SWORD: {
            id: 2,
            itemLevel:999999,
            atk: [5,150],
            life: [5,150],
            def: [5,150],
            name:'Skull Stab',
            flavorText:'This sword can actually only pierce hearts.',
            equippableBy: game.EquippableBy.WAR | game.EquippableBy.ARCH,
            removesAbilities: [
                game.Ability.ATTACK.id
            ],
            addsAbilities: [
                {
                    id: game.Ability.ATTACK.id,
            sellPrice: .25,
                    graphicIndex: game.Graphic.RED_FIREBALL_RIGHT,
                    relativeWeight: 9000,
                },
                {
                    id: game.Ability.BOULDER_DROP.id,
                    relativeWeight: 9000,
                }
            ],
            sellPrice: 2,
            graphicIndex: game.Graphic.SWORD,
            mods: [new game.LifeLeech(.5, .5), new game.MultipleProjectiles(2)]
        },
        HEAL_GEM: {
            id: 3,
            itemLevel:1,
            name:'Gem of Regen',
            flavorText:'Slowly restores the target unit\'s life.',
            usable:true,
            useTarget: game.UseTarget.LIVING_PLAYER_UNIT,
            stackable:true,
            startingQuantity:3,
            sellPrice: .25,
            graphicIndex: game.Graphic.CYAN_DIAMOND,
        },
        POTION: {
            id: 4,
            itemLevel:1,
            name:'Joachim\'s Wisdom',
            flavorText:'Fully heals the target unit.',
            usable:true,
            useTarget: game.UseTarget.LIVING_PLAYER_UNIT,
            stackable:true,
            startingQuantity:3,
            sellPrice: .25,
            graphicIndex: game.Graphic.SMALL_RED_POTION,
        },
        REVEALER: {
            id: 5,
            itemLevel:1,
            name:'Vizier\'s Vision',
            flavorText:'Reveals some foggy area in a world.',
            usable:true,
            useTarget: game.UseTarget.MAP,
            stackable:true,
            startingQuantity:3,
            sellPrice: .25,
            graphicIndex: game.Graphic.GREEN_BROOCH,
        },
        POISON_GEM: {
            id: 6,
            itemLevel:1,
            name:'Essence of Poison',
            flavorText:'Poisons the target unit, slowly destroying it.',
            usable:true,
            useTarget: game.UseTarget.LIVING_ENEMY_UNIT,
            stackable:true,
            startingQuantity:3,
            sellPrice: .25,
            graphicIndex: game.Graphic.GREEN_DIAMOND,
        },
        CREATE_SPAWNER: {
            id: 7,
            itemLevel:1,
            name:'Spawn Creatorizer',
            flavorText:'Creates another spawn point on the map.',
            usable:true,
            useTarget: game.UseTarget.MAP_WALKABLE_ONLY,
            stackable:true,
            startingQuantity:3,
            sellPrice: .20,
            graphicIndex: game.Graphic.SMALL_YELLOW_SQUARE_ITEM,
        },
        MEGA_CREATE_SPAWNER: {
            id: 8,
            itemLevel:1,
            name:'Mega Spawn Creatorizer',
            flavorText:'Creates another spawn point on the map.',
            usable:true,
            useTarget: game.UseTarget.MAP_WALKABLE_ONLY,
            stackable:true,
            startingQuantity:3,
            sellPrice: .25,
            graphicIndex: game.Graphic.LARGE_YELLOW_SQUARE_ITEM,
        },
        REVIVE_POTION: {
            id: 9,
            itemLevel:1,
            name:'Necromancer\'s Knowledge',
            flavorText:'Brings the dead back to life.',
            usable:true,
            useTarget: game.UseTarget.DEAD_PLAYER_UNIT,
            stackable:true,
            startingQuantity:3,
            sellPrice: .25,
            graphicIndex: game.Graphic.MEDIUM_YELLOW_POTION,
        },
        WOOD_BUCKLER_1: {
            id: 10,
            itemLevel:1,
            def: [1,4],
            name:'Wooden buckler',
            flavorText:'A cheap, wooden buckler.',
            graphicIndex: game.Graphic.WOOD_BUCKLER_1,
            equippableBy: game.EquippableBy.ALL,
            sellPrice: 1,
        },
        DAGGER_1: {
            id: 11,
            itemLevel:1,
            atk: [1,4],
            name:'Dagger',
            flavorText:'A common dagger.',
            graphicIndex: game.Graphic.DAGGER_1,
            equippableBy: game.EquippableBy.ALL,
            sellPrice: 1,
        },
        WOOD_BUCKLER_2: {
            id: 12,
            itemLevel:2,
            def: [2,7],
            name:'Reinforced buckler',
            flavorText:'It\'s still not great.',
            graphicIndex: game.Graphic.WOOD_BUCKLER_2,
            equippableBy: game.EquippableBy.ALL,
            sellPrice: 1,
        },
        DAGGER_2: {
            id: 13,
            itemLevel:2,
            atk: [2,7],
            name:'Sharpened Dagger',
            flavorText:'Try not to run with it.',
            graphicIndex: game.Graphic.DAGGER_2,
            equippableBy: game.EquippableBy.ALL,
            sellPrice: 1,
        },
        RUBY_RING: {
            id: 14,
            itemLevel:1,
            life: [5,40],
            name:'Minor Ring of Life',
            flavorText:'Putting this ring on your finger gives you a new outlook on things.',
            graphicIndex: game.Graphic.RUBY_RING,
            equippableBy: game.EquippableBy.ALL,
            sellPrice: 1,
        },
        WOOD_STAFF_1: {
            id: 15,
            itemLevel:5,
            atk: [5,15],
            name:'Plain Staff',
            flavorText:'Someone must have spent many seconds whittling this.',
            graphicIndex: game.Graphic.WOOD_STAFF_1,
            equippableBy: game.EquippableBy.WIZ,
            sellPrice: 1,
        },
        PLAIN_SWORD: {
            id: 16,
            itemLevel:5,
            atk: [7,17],
            name:'Plain Sword',
            flavorText:'This sword isn\'t anything to write home about.',
            graphicIndex: game.Graphic.SWORD,
            equippableBy: game.EquippableBy.WAR,
            sellPrice: 1,
        },
        WOODEN_BOW: {
            id: 17,
            itemLevel:5,
            atk: [7,13],
            name:'Bow',
            flavorText:'This bow feels heavier than it looks.',
            graphicIndex: game.Graphic.WOODEN_BOW,
            equippableBy: game.EquippableBy.ARCH,
            sellPrice: 1,
        },
        GOLD_EYE_NECKLACE: {
            id: 18,
            itemLevel:5,
            name:'Thorny Necklace',
            flavorText:'People no longer want to touch you when you wear this.',
            graphicIndex: game.Graphic.GOLD_EYE_NECKLACE,
            equippableBy: game.EquippableBy.ALL,
            sellPrice: 15,
            mods: [new game.Thorns(30)]
        },
        RED_SCALE: {
            id: 19,
            itemLevel:5,
            name:'Blood Scale',
            flavorText:'This may make your reflection disappear.',
            graphicIndex: game.Graphic.RED_SCALE,
            equippableBy: game.EquippableBy.ALL,
            sellPrice: 15,
            mods: [new game.LifeLeech(.2, .3)]
        },
        BLUE_BOW: {
            id: 20,
            itemLevel:8,
            atk:[-40,-20],
            name:'Doublestrike',
            flavorText:'You can suddenly nock two arrows at once, but you\'re not very good at it.',
            graphicIndex: game.Graphic.BLUE_BOW,
            equippableBy: game.EquippableBy.ARCH,
            sellPrice: 15,
            mods: [new game.MultipleProjectiles(2)]
        },
        SMALL_WOODEN_AXE: {
            id: 21,
            itemLevel:8,
            atk:[-20,-10],
            name:'Throwing Axes',
            flavorText:'These are lots of fun to throw!',
            graphicIndex: game.Graphic.SMALL_WOODEN_AXE,
            equippableBy: game.EquippableBy.WAR,
            sellPrice: 15,
            mods: [new game.MultipleProjectiles(2)]
        },
        WOOD_STAFF_3: {
            id: 22,
            itemLevel:8,
            atk:[-45,-10],
            name:'Forked Staff',
            flavorText:'It shoots a bit wildly...',
            graphicIndex: game.Graphic.WOOD_STAFF_3,
            equippableBy: game.EquippableBy.WIZ,
            sellPrice: 15,
            mods: [new game.MultipleProjectiles(2)]
        },
        BLUE_WHITE_SHIELD: {
            id: 23,
            itemLevel:8,
            def: [5,15],
            name:'Moon Shield',
            flavorText:'The moon shines brightly on this shield.',
            graphicIndex: game.Graphic.BLUE_WHITE_SHIELD,
            equippableBy: game.EquippableBy.ALL,
            sellPrice: 20,
        },
        BROWN_ARMOR: {
            id: 24,
            itemLevel:8,
            def: [7,18],
            name:'Leather Breastplate',
            flavorText:'Now you know what it\'s like to be a cow.',
            graphicIndex: game.Graphic.BROWN_ARMOR,
            equippableBy: game.EquippableBy.ALL,
            sellPrice: 20,
        },
        RED_BOOT: {
            id: 25,
            itemLevel:8,
            def: [5,10],
            life: [50,80],
            name:'Coward\'s Boots',
            flavorText:'When the going gets tough, the tough get going.',
            graphicIndex: game.Graphic.RED_BOOT,
            equippableBy: game.EquippableBy.ALL,
            sellPrice: 20,
        },
        FIRE_SWORD: {
            id: 26,
            itemLevel:13,
            atk: [10,30],
            def: [-7, -1],
            name:'Flame Sword',
            flavorText:'A little <i>too</i> hot to the touch.',
            graphicIndex: game.Graphic.FIRE_SWORD,
            equippableBy: game.EquippableBy.WAR,
            sellPrice: 20,
        },
        BLUE_STAFF: {
            id: 27,
            itemLevel:13,
            atk: [12,25],
            life: [-50,50],
            name:'Ice Staff',
            flavorText:'The temperature of this staff never changes.',
            graphicIndex: game.Graphic.BLUE_STAFF,
            equippableBy: game.EquippableBy.WIZ,
            sellPrice: 20,
        },
        STEEL_CROSSBOW: {
            id: 28,
            itemLevel:13,
            atk: [10,40],
            name:'Steel Crossbow',
            flavorText:'It\'s heavy, sure, but you can handle it.',
            graphicIndex: game.Graphic.STEEL_CROSSBOW,
            equippableBy: game.EquippableBy.ARCH,
            sellPrice: 20,
        },
        GRAY_PANTS_1: {
            id: 29,
            itemLevel:16,
            def: [16,30],
            name:'Steel Cuisses',
            flavorText:'These accentuate your thighs.',
            graphicIndex: game.Graphic.GRAY_PANTS_1,
            equippableBy: game.EquippableBy.ALL,
            sellPrice: 20,
        },
        BLACK_GLOVES: {
            id: 30,
            itemLevel:16,
            def: [3,8],
            name:'Death\'s Touch',
            flavorText:'The outside is prickly like a cactus.',
            graphicIndex: game.Graphic.BLACK_GLOVES,
            equippableBy: game.EquippableBy.ALL,
            sellPrice: 20,
            mods:[new game.Thorns(50)]
        },
        GREEN_SABRE: {
            id: 31,
            itemLevel:16,
            name:'Thorn',
            flavorText:'This shall surely sicken your enemy.',
            graphicIndex: game.Graphic.GREEN_SABRE,
            equippableBy: game.EquippableBy.WAR,
            sellPrice: 60,
            mods:[new game.Poison(.25)]
        },
        BIG_RED_GEM: {
            id: 32,
            itemLevel:19,
            atk:[1,15],
            def:[1,15],
            life:[1,150],
            name:'Crimson Guard',
            flavorText:'"Piece 1 of 3" is inscribed on the back.',
            graphicIndex: game.Graphic.BIG_RED_GEM,
            equippableBy: game.EquippableBy.WIZ,
            sellPrice: 10,
        },
        BIG_GREEN_GEM: {
            id: 33,
            itemLevel:19,
            life:[1,400],
            name:'Jade Guard',
            flavorText:'"Piece 2 of 3" is inscribed on the back.',
            graphicIndex: game.Graphic.BIG_GREEN_GEM,
            equippableBy: game.EquippableBy.ARCH,
            sellPrice: 10,
        },
        BIG_BLUE_GEM: {
            id: 34,
            itemLevel:19,
            def:[1,30],
            name:'Azure Guard',
            flavorText:'"Piece 3 of 3" is inscribed on the back.',
            graphicIndex: game.Graphic.BIG_BLUE_GEM,
            equippableBy: game.EquippableBy.WAR,
            sellPrice: 50,
            mods: [new game.Thorns(75)]
        },
        AMETHYST_RING: {
            id: 35,
            itemLevel:22,
            name:'Vampiric Ring',
            flavorText:'There is a bat faintly visible in the gemstone.',
            graphicIndex: game.Graphic.AMETHYST_RING,
            equippableBy: game.EquippableBy.ALL,
            sellPrice: 70,
            mods: [new game.LifeLeech(.4, .5)]
        },
        SAPPHIRE_RING: {
            id: 36,
            itemLevel:22,
            name:'Cleric\'s Ring',
            flavorText:'No pain, no gain.',
            graphicIndex: game.Graphic.SAPPHIRE_RING,
            equippableBy: game.EquippableBy.ALL,
            sellPrice: 70,
            mods: [new game.Regen(.05)]
        },
        PURPLE_ARMOR: {
            id: 37,
            itemLevel:25,
            def:[25,50],
            life:[-40,-150],
            name:'Gaudy Armor',
            flavorText:'This makes you stand out on the battlefield.',
            graphicIndex: game.Graphic.PURPLE_ARMOR,
            equippableBy: game.EquippableBy.ALL,
            sellPrice: 10,
        },
        YELLOW_CROSS_STAFF: {
            id: 38,
            itemLevel:31,
            life:[1,500],
            name:'Cross of Light',
            flavorText:'The center of the cross is too bright to look at.',
            graphicIndex: game.Graphic.YELLOW_CROSS_STAFF,
            equippableBy: game.EquippableBy.WIZ,
            sellPrice: 10,
            mods: [new game.LifeLeech(.1, 1), new game.Regen(.01), ]
        },
        YELLOW_BOW: {
            id: 39,
            itemLevel:31,
            name:'Bow of Many Arrows',
            flavorText:'You wonder why you don\'t run out.',
            graphicIndex: game.Graphic.YELLOW_BOW,
            equippableBy: game.EquippableBy.ARCH,
            sellPrice: 130,
            mods: [new game.MultipleProjectiles(3)]
        },
        BLOOD_SWORD: {
            id: 40,
            itemLevel:31,
            atk:[10,50],
            name:'Blood Sword',
            flavorText:'Each hit makes you stronger.',
            graphicIndex: game.Graphic.BLOOD_SWORD,
            equippableBy: game.EquippableBy.WAR,
            sellPrice: 80,
            mods: [new game.LifeLeech(.5, .5)]
        },
    };

    // This is debug code to put the item name in the item's description. It's
    // run directly after defining the items above.
    ( function verifyAllItemData() {
        var seenIDs = {};
        for ( var key in game.ItemType ) {
            var item = game.ItemType[key];

            var id = item.id;
            if ( seenIDs[id] !== undefined ) {
                error = true;
                game.util.debugDisplayText(key + ' has a duplicated ID: ' + id, 'dupe_item_id' + key);
            }

            seenIDs[id] = true;
            
            game.util.useDefaultIfUndefined(item, 'flavorText', '');

            item.htmlDescription = item.name;
            if ( item.flavorText != '' ) {
                item.htmlDescription += '<br/><span class="item-flavor-text">' + item.flavorText + '</span>';
            }

            game.util.useDefaultIfUndefined(item, 'usable', false);

            // Equippable items
            if ( item.usable == false || item.usable === undefined ) {
                game.util.useDefaultIfUndefined(item, 'atk', [0,0]);
                game.util.useDefaultIfUndefined(item, 'def', [0,0]);
                game.util.useDefaultIfUndefined(item, 'life', [0,0]);

                // Ranges are specified as [X, Y], but when that range is passed
                // to a random function, it can only generate up to Y-1, so we
                // fix the ranges here.
                if ( item.atk[1] != 0 ) item.atk[1]++;
                if ( item.def[1] != 0 ) item.def[1]++;
                if ( item.life[1] != 0 ) item.life[1]++;
            }

            if ( item.sellPrice === undefined ) {
                game.util.debugDisplayText(key + ' has no sell price!');
            }
        };
    }());

}());
