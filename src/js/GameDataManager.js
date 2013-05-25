( function() {

    /**
     * There is one game-save version. This is used so that once the game is
     * released, we can modify the save data however we want, then we can know
     * how to convert from version X to version Y.
     *
     * Ideally, all saves should be backwards compatible, so that conversion
     * process will hopefully be skippable.
     * @type {String}
     */
    window.game.SAVE_DATA_VERSION = '1.0';

    // This handles saving and loading the game data from localStorage. In my
    // opinion, it sort of abuses how everything is public in JavaScript. In
    // general, saving works by decycling the stringified object (it's very
    // simple). Loading works by parsing the JSON string, copying over any non-
    // object properties, then restoring the object's prototype by
    // reconstructing them.
    //
    // For information on what decycling is about, see the file where the
    // decycle function is defined, which should be JSONDecycle.js.
    // 
    // When strings are parsed from JSON into JavaScript, they are made into
    // Objects, NOT their original types (like Unit or Battle). If we left them
    // that way, then they wouldn't have functions like "placeUnit" or "update"
    // because, well, Object doesn't have those in its prototype. What I've
    // settled on is constructing the object using the parsed data, then copying
    // all of the non-Object properties from the parsed data to the "real"
    // object (I call these "final" objects in this file). It may be possible to
    // simply modify the prototype of the Objects instead of constructing
    // Units/Battles/Collectibles/etc., but I didn't look into that too much. If
    // we DID do that, one thing to be careful of would be when we expect two
    // references to be the same (there are definitely some "===" comparisons in
    // the code that should remain true). If the current system works, then I
    // wouldn't change it.
    window.game.GameDataManager = {

        /**
         * Saves everything in the game.
         * @return {undefined}
         */
        saveGame: function() {
            var curTime = new Date();
            var version = game.SAVE_DATA_VERSION;
            console.log('Saving the game (version ' + version + ') at ' + curTime);

            localStorage.saveVersion = version;
            localStorage.saveTime = curTime;

            console.log('Saving the map');
            this.saveMap();
            console.log('Saving quests');
            this.saveQuests();
            console.log('Saving the camera');
            this.saveCamera();
            console.log('Saving battles');
            this.saveBattles();
            console.log('Saving units');
            this.saveUnits();
            console.log('Saving collectibles');
            this.saveCollectibles();
            console.log('Saving the inventory');
            this.saveInventory();
        },

        /**
         * Loads everything in the game.
         * @return {undefined}
         */
        loadGame: function() {
            var savedVersion = localStorage.saveVersion;
            var expectedVersion = game.SAVE_DATA_VERSION;

            if ( !this.verifyVersion(expectedVersion, savedVersion, 'game') ) {
                console.log('Note: your save file is from ' + localStorage.saveTime);
                return;
            }

            // Get rid of all existing text objects
            game.TextManager.textObjs = [];

            // Turning particles off will get rid of all of them. We toggle
            // twice so that we keep the current particle setting while still
            // removing all of the particles.
            game.ParticleManager.toggleEnabled();
            game.ParticleManager.toggleEnabled();

            // Remove all loot notifications
            for (var i = 0; i < game.LootUI.lootObjects.length; i++) {
                game.LootUI.lootObjects[i].ttl = 0;
            };

            // It's very important that we exit USE mode since I don't save
            // 'usingItem' from InventoryUI.
            game.InventoryUI.exitUseMode(true);

            var curTime = new Date();
            console.log('Loading a save (version ' + savedVersion + ') from ' + localStorage.saveTime);

            // Some of this ordering is important. For example, the map should
            // be loaded before basically anything else.
            console.log('Loading the map');
            this.loadMap();
            console.log('Loading quests');
            this.loadQuests();
            console.log('Loading the camera');
            this.loadCamera();
            console.log('Loading battles');
            this.loadBattles();
            console.log('Loading units');
            this.loadUnits();
            console.log('Loading projectiles');
            this.loadProjectiles();
            console.log('Loading collectibles');
            this.loadCollectibles();

            // Load the inventory after units have been loaded. No code depends
            // on this at the time of writing, but that assumption may
            // eventually change, and I don't want to have to track down a bug
            // having to do with mis-ordering.
            console.log('Loading the inventory');
            this.loadInventory();
        },

        /**
         * Verifies that the version obtained from the loaded data is the
         * version that we expect, otherwise it prints a message.
         * @param  {String} expectedVersion
         * @param  {String} actualVersion
         * @param  {String} objectBeingVerified - a simple descripton of the
         * object you're verifying
         * @return {Boolean}                     - true if the versions match
         */
        verifyVersion: function(expectedVersion, actualVersion, objectBeingVerified) {
            if ( actualVersion === undefined ) {
                console.log('You haven\'t ever saved "' + objectBeingVerified + 
                    '", so you can\'t load it. Expected version: ' + expectedVersion);
                return false;
            }

            if ( actualVersion != expectedVersion ) {
                console.log('Expected ' + objectBeingVerified + ' version ' + 
                    expectedVersion + ', got ' + actualVersion + 
                    '. Not going to load "' + objectBeingVerified + '".');
                return false;
            }

            return true;
        },

        /**
         * Copies all properties from one object to another EXCEPT for
         * propsToIgnore.
         * @param  {Object} sourceObject  - the object from which to copy
         * properties
         * @param  {Object} destObject    - the object to copy properties to
         * @param  {Array:String} propsToIgnore - an array of properties NOT to
         * copy.
         * @return {undefined}
         */
        copyProps: function(sourceObject, destObject, propsToIgnore) {
            if ( propsToIgnore === undefined ) propsToIgnore = [];
            for ( var prop in sourceObject ) {
                if ( sourceObject.hasOwnProperty(prop) && propsToIgnore.indexOf(prop) == -1 ) {
                    destObject[prop] = sourceObject[prop];
                }
            }
        },

        /**
         * Saves the inventory.
         * @return {undefined}
         */
        saveInventory: function() {
            // The Inventory itself just has an array of Slots. Each Slot has an
            // item.
            localStorage.inventory = JSON.stringify(JSON.decycle(game.Inventory));
            localStorage.lastSlotID = game.slotID;
        },

        /**
         * Loads the inventory.
         * @return {undefined}
         */
        loadInventory: function() {
            game.slotID = localStorage.lastSlotID;

            var parsedInventory = JSON.parse(localStorage.inventory);
            JSON.retrocycle(parsedInventory);

            // Go through and restore each slot and item
            var finalSlots = [];
            for (var i = 0; i < parsedInventory.slots.length; i++) {
                var parsedSlot = parsedInventory.slots[i];
                var finalSlot = new game.Slot(parsedSlot.slotType);
                this.copyProps(parsedSlot, finalSlot, []);
                finalSlots.push(finalSlot);

                // The following line of code assumes that we never change the
                // number of slots you can have, otherwise we'd need to modify
                // InventoryUI's slots and the HTML backing them.
                game.InventoryUI.slots[finalSlot.slotIndex].slot = finalSlot;

                var parsedItem = finalSlot.item;
                var finalItem = null;
                if ( parsedItem != null ) {
                    finalItem = new game.Item(parsedItem.itemID);
                    this.copyProps(parsedItem, finalItem, []);
                }

                // This will update the UI; it is called even if the item is
                // null.
                finalSlot.setItem(finalItem);
            };
            game.Inventory.slots = finalSlots;
        },

        /**
         * Saves all the units.
         * @return {undefined}
         */
        saveUnits: function() {
            // Save the last unit ID so that we don't end up with an ID of 0
            // when we come back from the save
            localStorage.lastUnitID = game.unitID;
            var units = game.UnitManager.gameUnits;

            // Go through each unit and tell them which battle they were in so
            // that they can restore it on the other end.
            for (var i = 0; i < units.length; i++) {
                if ( units[i].isInBattle() ) {
                    var battle = units[i].battleData.battle;

                    for (var j = 0; j < game.BattleManager.battles.length; j++) {
                        if ( battle === game.BattleManager.battles[j] ) {
                            units[i].battleIndex = j;
                            break;
                        }
                    };
                } else {
                    // If they aren't in a battle, then we need to make sure the
                    // battleIndex doesn't exist from a previous save, otherwise
                    // units will run all the way across the map to battle
                    delete units[i].battleIndex;
                }
            };

            localStorage.units = JSON.stringify(JSON.decycle(units));
        },

        /**
         * Loads units.
         * @return {undefined}
         */
        loadUnits: function() {
            var parsedUnits = JSON.parse(localStorage.units);
            JSON.retrocycle(parsedUnits);

            // Now we can cherry-pick properties from here
            var finalUnits = [];
            for (var i = 0; i < parsedUnits.length; i++) {
                var parsedUnit = parsedUnits[i];
                var finalUnit = new game.Unit(parsedUnit.unitType, parsedUnit.isPlayer);

                // battleData will be set when the unit is added to a battle
                this.copyProps(parsedUnit, finalUnit, ['battleData']);

                // Change whichPathToTake from Objects to Tiles
                if ( finalUnit.whichPathToTake != null ) {
                    for (var j = 0; j < finalUnit.whichPathToTake.length; j++) {
                        var tileIndex = finalUnit.whichPathToTake[j].tileIndex;
                        finalUnit.whichPathToTake[j] = currentMap.mapTiles[tileIndex];
                    };
                }

                // Change statusEffects from Objects into StatusEffects
                for (var j = 0; j < parsedUnit.statusEffects.length; j++) {
                    var effect = parsedUnit.statusEffects[j];
                    var finalEffect = new game.StatusEffect(finalUnit, effect.type);

                    // Ignore 'target' because we just set it using the
                    // constructor
                    this.copyProps(effect, finalEffect, ['target']);
                    finalUnit.statusEffects[j] = finalEffect;
                };

                // Correct the battle data. Battles were created at this point,
                // but they have no units yet.
                if ( finalUnit.battleIndex !== undefined ) {
                    var battle = game.BattleManager.battles[finalUnit.battleIndex];
                    battle.addUnit(finalUnit);

                    // In the game, units are added to the battle based on when
                    // they get close, but they're repositioned based on their
                    // absolute order, which is in battle data. Not only do we
                    // need to copy battleData for its members like cooldown and
                    // position, but absoluteOrder is what ensures the units
                    // line up the same way.
                    this.copyProps(parsedUnit.battleData, finalUnit.battleData, ['battle']);
                }

                finalUnits.push(finalUnit);
            };
            game.UnitManager.gameUnits = finalUnits;
            game.unitID = localStorage.lastUnitID;

            // Set the unit placement UI's page to the current one so that it
            // refreshes
            game.UnitPlacementUI.navigateToPage(game.UnitPlacementUI.unitType);
        },

        /**
         * Saves all collectibles.
         * @return {undefined}
         */
        saveCollectibles: function() {
            var collectibles = game.CollectibleManager.collectibles;
            localStorage.collectibles = JSON.stringify(collectibles);
        },

        /**
         * Load collectibles.
         * @return {undefined}
         */
        loadCollectibles: function() {
            var finalCollectibles = []
            var parsedCollectibles = JSON.parse(localStorage.collectibles);
            for (var i = 0; i < parsedCollectibles.length; i++) {
                var parsedCollectible = parsedCollectibles[i];
                var finalCollectible = new game.Collectible(parsedCollectible.tileX,parsedCollectible.tileY,parsedCollectible.type);
                this.copyProps(parsedCollectible, finalCollectible, []);
                finalCollectibles.push(finalCollectible);
            };
            game.CollectibleManager.collectibles = finalCollectibles;
        },

        /**
         * Saves all quests.
         * @return {undefined}
         */
        saveQuests: function() {
            var quests = game.QuestManager.quests;

            localStorage.quests = JSON.stringify(quests);
        },

        /**
         * Loads quests.
         * @return {undefined}
         */
        loadQuests: function() {
            // Wipe out all of the quests so that we can simply add them again.
            for (var i = 0; i < game.MAX_QUESTS; i++) {
                game.QuestManager.quests[i] = null;
            };            

            var parsedQuests = JSON.parse(localStorage.quests);
            for (var i = 0; i < game.MAX_QUESTS; i++) {
                var parsedQuest = parsedQuests[i];
                if ( parsedQuest != null ) {
                    // If we did addNewQuest, then we might add to the wrong
                    // slot. Imagine if we saved three quests: NULL, SOMETHING,
                    // NULL. We would loop through with i==0 and ignore the null
                    // quest, then at i==1 we would end up adding to slot number
                    // 0 still. Instead, we set the 'i'th quest directly.
                    game.QuestManager.quests[i] = game.QuestManager.constructQuest(parsedQuest.type);
                    this.copyProps(parsedQuest, game.QuestManager.quests[i], []);
                }

            };

            // Update the UI now that we've filled out the progress
            game.QuestUI.updateQuests();
        },

        /**
         * Saves all battles.
         * @return {undefined}
         */
        saveBattles: function() {
            var battles = game.BattleManager.battles;

            localStorage.battles = JSON.stringify(JSON.decycle(battles));
        },

        /**
         * Loads battles.
         * @return {undefined}
         */
        loadBattles: function() {
            var parsedBattles = JSON.parse(localStorage.battles);
            JSON.retrocycle(parsedBattles);

            var finalBattles = [];
            for (var i = 0; i < parsedBattles.length; i++) {
                var parsedBattle = parsedBattles[i];
                var finalBattle = new game.Battle(parsedBattle.centerX, parsedBattle.centerY);
                this.copyProps(parsedBattle, finalBattle, ['enemyUnits', 'playerUnits', 'units']);

                // These battles do not have units or projectiles right now;
                // they are basically empty containers. They will be added when
                // they're loaded.
                finalBattles.push(finalBattle);
            };

            game.BattleManager.battles = finalBattles;
        },

        /**
         * This function doesn't actually pull from localStorage, it only
         * corrects each battle's projectiles. This needs to be done after
         * loading both units and battles.
         * @return {undefined}
         */
        loadProjectiles: function() {
            // Go through each battle and change each projectile from an Object
            // into a Projectile.
            for (var i = 0; i < game.BattleManager.battles.length; i++) {
                var battle = game.BattleManager.battles[i];
                for (var j = 0; j < battle.projectiles.length; j++) {
                    var parsedProjectile = battle.projectiles[j];
                    var target = game.UnitManager.getUnitByID(parsedProjectile.target.id);
                    var owner = game.UnitManager.getUnitByID(parsedProjectile.owner.id);
                    var x = parsedProjectile.x;
                    var y = parsedProjectile.y;
                    var type = parsedProjectile.type;
                    var finalProjectile = new game.Projectile(x, y, type, owner, target);
                    battle.projectiles[j] = finalProjectile;
                };
            };
        },

        /**
         * Saves the map.
         * @return {undefined}
         */
        saveMap: function() {
            localStorage.map = JSON.stringify(JSON.decycle(currentMap));
        },

        /**
         * Loads the map.
         * @return {undefined}
         */
        loadMap: function() {
            var parsedMap = JSON.parse(localStorage.map);
            JSON.retrocycle(parsedMap);

            // This will restore fog, width, height, etc.
            this.copyProps(parsedMap, currentMap);

            var finalMapTiles = [];
            for (var i = 0; i < parsedMap.mapTiles.length; i++) {
                var parsedTile = parsedMap.mapTiles[i];
                var finalTile = new game.Tile(parsedTile.graphicIndex, parsedTile.tileIndex, parsedTile.x, parsedTile.y);
                this.copyProps(parsedTile, finalTile, []);
                finalMapTiles.push(finalTile);
            };

            currentMap.mapTiles = finalMapTiles;

            var finalPaths = [];
            for (var i = 0; i < parsedMap.paths.length; i++) {
                var parsedPath = parsedMap.paths[i];
                var finalPath = [];
                for (var j = 0; j < parsedPath.length; j++) {
                    var parsedTile = parsedPath[j];
                    var finalTile = new game.Tile(parsedTile.graphicIndex, parsedTile.tileIndex, parsedTile.x, parsedTile.y);
                    this.copyProps(parsedTile, finalTile, []);
                    finalPath.push(finalTile);      
                };
                finalPaths.push(finalPath);
            };

            currentMap.paths = finalPaths;
        },

        /**
         * Saves the camera.
         * @return {undefined}
         */
        saveCamera: function() {
            // The camera is a simple object with no reference loops, so we can
            // simply stringify it and restore it later
            localStorage.camera = JSON.stringify(game.Camera);
        },

        /**
         * Loads the camera.
         * @return {undefined}
         */
        loadCamera: function() {
            // Set each property of the camera.
            JSON.parse(localStorage.camera, function(k, v) {
                // The last property will be the empty string with no value.
                if ( k === "" ) return;

                game.Camera[k] = v;
            });
        }
    };
}()); 