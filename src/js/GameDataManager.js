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
    // 
    // Remember: everything in localStorage is a string, so if you want to load
    // a number, call Number() yourself.
    window.game.GameDataManager = {

        /**
         * Saves everything in the game.
         */
        saveGame: function() {
            var curTime = new Date();
            var version = game.SAVE_DATA_VERSION;
            console.log('Saving the game (version ' + version + ') at ' + curTime);

            localStorage.saveVersion = version;
            localStorage.saveTime = curTime;

            var leftLists = [];
            var rightLists = [];

            // Go through each tile and get rid of its left/rightList. We can't
            // save these because they are absolutely massive when stringified.
            for (var i = 0; i < game.currentMap.mapTiles.length; i++) {
                leftLists.push(game.currentMap.mapTiles[i].leftList);
                rightLists.push(game.currentMap.mapTiles[i].rightList);
                delete game.currentMap.mapTiles[i].leftList;
                delete game.currentMap.mapTiles[i].rightList;
            };

            console.log('Saving the map');
            this.saveMap();
            console.log('Saving generators');
            this.saveGenerators();
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
            console.log('Saving the player');
            this.savePlayer();
            console.log('Saving game state');
            this.saveGameState();

            // Restore leftList and rightList so that our current game still
            // works.
            for (var i = 0; i < game.currentMap.mapTiles.length; i++) {
                game.currentMap.mapTiles[i].leftList = leftLists[i];
                game.currentMap.mapTiles[i].rightList = rightLists[i];
            };
        },

        /**
         * Loads everything in the game.
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
            game.playerInventoryUI.exitUseMode(true);

            // Default the highlighted button to zero. This will help us avoid
            // the following scenario: The player saves the game with no units
            // bought. This means there are only the number of portraits on the
            // screen that the player can buy. The player then buys 8 units and
            // puts the highlighter on the last one they bought. The player then
            // loads the game but NEVER saved the game. That index where the
            // highlighter was is now gone. Therefore, make life easy and just
            // set it to 0 when loading the game.
            game.UICanvas.highlightedButtonIndex = 0;

            var curTime = new Date();
            console.log('Loading a save (version ' + savedVersion + ') from ' + localStorage.saveTime);

            // Some of this ordering is important. For example, the map should
            // be loaded before basically anything else.
            console.log('Loading the game state');
            this.loadGameState();
            console.log('Loading the map');
            this.loadMap();
            console.log('Loading generators');
            this.loadGenerators();
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

            console.log('Loading the player');
            this.loadPlayer();

            // If you had enough coins in your current game to buy a new slot,
            // then you loaded a game where you didn't have enough coins, this
            // would cover the state-change that would disable the "buy" button.
            game.UnitPlacementUI.playerCoinsChanged();
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
         */
        saveInventory: function() {
            // The Inventory itself just has an array of Slots. Each Slot has an
            // item.
            localStorage.inventory = JSON.stringify(JSON.decycle(game.Player.inventory));
            localStorage.lastSlotID = game.slotID;
        },

        /**
         * Loads the inventory.
         */
        loadInventory: function() {
            game.slotID = Number(localStorage.lastSlotID);

            var parsedInventory = JSON.parse(localStorage.inventory);
            JSON.retrocycle(parsedInventory);

            // Go through and restore each slot and item
            var finalSlots = [];
            for (var i = 0; i < parsedInventory.slots.length; i++) {
                var parsedSlot = parsedInventory.slots[i];
                var finalSlot = new game.PlayerSlot(parsedSlot.slotType, parsedSlot.slotIndex);
                this.copyProps(parsedSlot, finalSlot, []);
                finalSlots.push(finalSlot);

                // The following line of code assumes that we never change the
                // number of slots you can have, otherwise we'd need to modify
                // playerInventoryUI's slots and the HTML backing them.
                game.playerInventoryUI.slots[finalSlot.slotIndex].slot = finalSlot;

                var parsedItem = finalSlot.item;
                var finalItem = null;
                if ( parsedItem != null ) {
                    finalItem = new game.Item(parsedItem.itemID);
                    this.copyProps(parsedItem, finalItem, []);

                    var finalMods = game.ItemMod.rehydrateMods(parsedItem.mods);
                    finalItem.mods = finalMods;
                }

                // This will update the UI; it is called even if the item is
                // null.
                finalSlot.setItem(finalItem);
            };
            game.Player.inventory.slots = finalSlots;
        },

        /**
         * Saves all the units.
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
         */
        loadUnits: function() {
            var parsedUnits = JSON.parse(localStorage.units);
            JSON.retrocycle(parsedUnits);

            // Now we can cherry-pick properties from here
            var finalUnits = [];
            for (var i = 0; i < parsedUnits.length; i++) {
                var parsedUnit = parsedUnits[i];
                var finalUnit = new game.Unit(parsedUnit.unitType, parsedUnit.playerFlags, parsedUnit.level);

                // battleData will be set when the unit is added to a battle.
                // mods will be set in this function.
                this.copyProps(parsedUnit, finalUnit, ['battleData', 'mods']);

                // Change tiles so that they point to the correct objects with
                // leftList and rightList set (tileIndex is still valid).
                if ( finalUnit.previousTile != null ) {
                    finalUnit.previousTile = game.currentMap.mapTiles[finalUnit.previousTile.tileIndex];
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

                // Change itemsDropped from Objects into LootTableEntrys
                if ( finalUnit.itemsDropped !== undefined ) {
                    for (var j = 0; j < finalUnit.itemsDropped.length; j++) {
                        var lootTableEntry = finalUnit.itemsDropped[j];
                        var finalEntry = new game.LootTableEntry(lootTableEntry.itemID, lootTableEntry.relativeWeight);

                        this.copyProps(lootTableEntry, finalEntry, []);
                        finalUnit.itemsDropped[j] = finalEntry;
                    };
                }

                // Change mods from Objects into the specific ItemMod child
                // class.
                var finalMods = game.ItemMod.rehydrateMods(parsedUnit.mods);
                finalUnit.mods = finalMods;

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
            game.unitID = Number(localStorage.lastUnitID);

            // Set the unit placement UI's page to the current one so that it
            // refreshes
            game.UnitPlacementUI.navigateToPage(game.UnitPlacementUI.unitType);
        },

        /**
         * Saves all collectibles.
         */
        saveCollectibles: function() {
            var collectibles = game.CollectibleManager.collectibles;
            localStorage.collectibles = JSON.stringify(collectibles);
        },

        /**
         * Load collectibles.
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
         * Saves all generators.
         */
        saveGenerators: function() {
            var generators = game.GeneratorManager.generators;
            localStorage.generators = JSON.stringify(generators);
        },

        /**
         * Load generators.
         */
        loadGenerators: function() {
            var finalGenerators = []
            var parsedGenerators = JSON.parse(localStorage.generators);
            for (var i = 0; i < parsedGenerators.length; i++) {
                var parsedGenerator = parsedGenerators[i];
                var finalGenerator = new game.Generator(parsedGenerator.tileX,parsedGenerator.tileY);
                this.copyProps(parsedGenerator, finalGenerator, []);

                // Restore each PossibleEnemy from an Object to its original
                // type
                for (var j = 0; j < finalGenerator.possibleEnemies.length; j++) {
                    var parsedPossibleEnemy = finalGenerator.possibleEnemies[j];
                    var finalPossibleEnemy = new game.PossibleEnemy(parsedPossibleEnemy.enemyID, parsedPossibleEnemy.relativeWeight, parsedPossibleEnemy.minLevel, parsedPossibleEnemy.maxLevel);
                    finalGenerator.possibleEnemies[j] = finalPossibleEnemy;
                };
                finalGenerators.push(finalGenerator);
            };
            game.GeneratorManager.generators = finalGenerators;
        },

        /**
         * Saves all quests.
         */
        saveQuests: function() {
            var quests = game.QuestManager.quests;

            localStorage.quests = JSON.stringify(quests);
        },

        /**
         * Loads quests.
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
         */
        saveBattles: function() {
            var battles = game.BattleManager.battles;

            localStorage.battles = JSON.stringify(JSON.decycle(battles));
        },

        /**
         * Loads battles.
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
         * Saves the map. This will save the map's raw data, so tile "paths"
         * will be recomputed when we load.
         */
        saveMap: function() {
            var lookingAtOverworld = game.currentMap.isOverworldMap;
            if ( !lookingAtOverworld ) {
                localStorage.mapTilesIndices = JSON.stringify(game.currentMap.mapTilesIndices);
                localStorage.doodadIndices = JSON.stringify(game.currentMap.doodadIndices);
                localStorage.tilesetID = game.currentMap.tileset.id;
                localStorage.currentMapNode = JSON.stringify(game.currentMap.nodeOfMap);
                localStorage.numCols = game.currentMap.numCols;
                localStorage.fog = JSON.stringify(game.currentMap.fog);
            }
            localStorage.lookingAtOverworld = lookingAtOverworld;
            localStorage.overworldFog = JSON.stringify(game.overworldMap.fog);
        },

        /**
         * Loads the map.
         */
        loadMap: function() {
            // Good ol' JavaScript... Boolean('false') == true.
            var lookingAtOverworld = localStorage.lookingAtOverworld === 'true' ? true : false;
            var overworldFog = JSON.parse(localStorage.overworldFog);

            // Regardless of whether we're looking at it, restore the overworld
            // fog.
            game.overworldMap.fog = overworldFog;

            if ( !lookingAtOverworld ) {
                var mapTilesIndices = JSON.parse(localStorage.mapTilesIndices);
                var doodadIndices = JSON.parse(localStorage.doodadIndices);
                var tilesetID = Number(localStorage.tilesetID);
                var nodeOfMap = JSON.parse(localStorage.currentMapNode);
                var numCols = Number(localStorage.numCols);
                var fog = JSON.parse(localStorage.fog);

                // This will reform all tiles' leftList and rightList.
                game.currentMap = new game.Map(mapTilesIndices, doodadIndices, tilesetID, numCols, nodeOfMap, false);
                game.UnitPlacementUI.initializeSpawnPoint();

                // Restore fog
                game.currentMap.fog = fog;
            } else {
                game.currentMap = game.overworldMap;
            }
        },

        /**
         * Saves the camera.
         */
        saveCamera: function() {
            // The camera is a simple object with no reference loops, so we can
            // simply stringify it and restore it later
            localStorage.camera = JSON.stringify(game.Camera);
        },

        /**
         * Loads the camera.
         */
        loadCamera: function() {
            // Set each property of the camera.
            JSON.parse(localStorage.camera, function(k, v) {
                // The last property will be the empty string with no value.
                if ( k === "" ) return;

                game.Camera[k] = v;
            });
        },

        /**
         * Saves the player.
         */
        savePlayer: function() {
            // Don't save the inventory since that's done in a different function.
            var backupInventory = game.Player.inventory;
            game.Player.inventory = null;
            localStorage.player = JSON.stringify(game.Player);
            game.Player.inventory = backupInventory;
        },

        /**
         * Loads the player.
         */
        loadPlayer: function() {
            // Set each property of the camera.
            JSON.parse(localStorage.player, function(k, v) {
                if ( k == 'inventory' ) return;
                
                // The last property will be the empty string with no value.
                if ( k === "" ) return;

                game.Player[k] = v;
            });
        },

        /**
         * Saves the game state.
         */
        saveGameState: function() {
            localStorage.currentGameState = JSON.stringify(game.GameStateManager.currentState);
            localStorage.previousGameState = JSON.stringify(game.GameStateManager.previousState);
        },

        /**
         * Loads the game state.
         */
        loadGameState: function() {
            game.GameStateManager.hideTransitionButtons();

            var currentState = JSON.parse(localStorage.currentGameState);
            var previousState = JSON.parse(localStorage.previousGameState);

            game.GameStateManager.currentState = currentState;
            game.GameStateManager.previousState = previousState;


            // Fake a transition from the previous state to the current state to
            // set things like button visibility. We only DON'T do this if we're
            // in normal gameplay, because then the "fake" state transition
            // might generate a new map, which is costly since we're loading a
            // map anyway.
            if ( !game.GameStateManager.isNormalGameplay() ) {
                game.GameStateManager.currentState = previousState;
                game.GameStateManager.setState(currentState);
            }
        }
        
    };
}()); 