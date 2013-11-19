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
         * Indicates whether the game is currently being loaded. When this is
         * true, the game will not be save-able so that you don't save an
         * unfinished state.
         * @type {Boolean}
         */
        loadingGame: false,

        /**
         * This is mostly for debugging. If true, this will log all messsages
         * sent to the 'log' function.
         * @type {Boolean}
         */
        verboseLogging: false,

        /**
         * Logs text to the console.
         * @param  {String} text    - the text to log
         * @param  {Boolean} verbose - if true or undefined, this message is
         * considered verbose and will not be printed unless verboseLogging is
         * enabled. I.e. if you have a message that should always print, call
         * this function with verbose==false.
         */
        log: function(text, verbose) {
            if ( (verbose === undefined || verbose == true) && !this.verboseLogging ) {
                return;
            }

            console.log(text);
        },

        /**
         * Saves everything in the game.
         */
        saveGame: function() {
            // You can't save while you're currently loading.
            if ( this.loadingGame ) {
                return;
            }

            var curTime = new Date();
            var version = game.SAVE_DATA_VERSION;
            this.log('Saving the game (version ' + version + ') at ' + curTime);

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

            this.log('Saving settings');
            this.saveSettings();
            this.log('Saving the map');
            this.saveMap();
            this.log('Saving generators');
            this.saveGenerators();
            this.log('Saving quests');
            this.saveQuests();
            this.log('Saving the camera');
            this.saveCamera();
            this.log('Saving battles');
            this.saveBattles();
            this.log('Saving units');
            this.saveUnits();
            this.log('Saving collectibles');
            this.saveCollectibles();
            this.log('Saving the inventory');
            this.saveInventory();
            this.log('Saving the player');
            this.savePlayer();
            this.log('Saving game state');
            this.saveGameState();

            // Restore leftList and rightList so that our current game still
            // works.
            for (var i = 0; i < game.currentMap.mapTiles.length; i++) {
                game.currentMap.mapTiles[i].leftList = leftLists[i];
                game.currentMap.mapTiles[i].rightList = rightLists[i];
            };
        },

        /**
         * @return {Boolean} true if you have a saved game of the correct
         * version.
         */
        hasSavedGame: function() {
            var savedVersion = localStorage.saveVersion;
            var expectedVersion = game.SAVE_DATA_VERSION;

            if ( expectedVersion == savedVersion ) {
                return true;
            }

            // If you have a save file but it's the incorrect version, then
            // print when you saved it.
            if ( localStorage.saveTime !== undefined ) {
                this.log('Your save file\'s version (' + savedVersion + 
                    ') does not match the expected version (' + expectedVersion + 
                    '). Your save file will be deleted (in the future, ' +
                    'we will autoupdate to the latest version). It was saved on ' + 
                    localStorage.saveTime + '.', false);
            }
            return false;
        },

        /**
         * Deletes the saved game by removing everything from localStorage.
         */
        deleteSavedGame: function() {
            // Makes sure not to delete UI settings
            var uiSettings = localStorage.uiSettings;
            this.log('Wiping out localStorage (deleteSavedGame was called).', false);
            localStorage.clear();
            localStorage.uiSettings = uiSettings;
        },

        /**
         * Loads everything in the game.
         */
        loadGame: function() {
            if ( !this.hasSavedGame() ) {
                return;
            }

            this.loadingGame = true;

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
            game.UICanvas.scrollToPortrait();

            var curTime = new Date();
            this.log('Loading a save (version ' + localStorage.saveVersion + ') from ' + localStorage.saveTime);

            // Some of this ordering is important. For example, the map should
            // be loaded before basically anything else.
            this.log('Loading the game state');
            this.loadGameState();
            this.log('Loading the map');
            this.loadMap();
            this.log('Loading the settings');
            this.loadSettings();
            this.log('Loading generators');
            this.loadGenerators();
            this.log('Loading quests');
            this.loadQuests();
            this.log('Loading the camera');
            this.loadCamera();
            this.log('Loading battles');
            this.loadBattles();
            this.log('Loading units');
            this.loadUnits();
            this.log('Loading projectiles');
            this.loadProjectiles();
            this.log('Loading collectibles');
            this.loadCollectibles();

            // Load the inventory after units have been loaded. No code depends
            // on this at the time of writing, but that assumption may
            // eventually change, and I don't want to have to track down a bug
            // having to do with mis-ordering.
            this.log('Loading the inventory');
            this.loadInventory();

            this.log('Loading the player');
            this.loadPlayer();

            // If you had enough coins in your current game to buy a new slot,
            // then you loaded a game where you didn't have enough coins, this
            // would cover the state-change that would disable the "buy" button.
            game.UnitPlacementUI.playerCoinsChanged();

            this.loadingGame = false;
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
                game.util.copyProps(parsedSlot, finalSlot, []);
                finalSlots.push(finalSlot);

                // The following line of code assumes that we never change the
                // number of slots you can have, otherwise we'd need to modify
                // playerInventoryUI's slots and the HTML backing them.
                game.playerInventoryUI.slots[finalSlot.slotIndex].slot = finalSlot;

                var parsedItem = finalSlot.item;
                var finalItem = null;
                if ( parsedItem != null ) {
                    finalItem = new game.Item(parsedItem.itemID);
                    game.util.copyProps(parsedItem, finalItem, []);

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
                game.util.copyProps(parsedUnit, finalUnit, ['battleData', 'mods']);

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
                    game.util.copyProps(effect, finalEffect, ['target']);
                    finalUnit.statusEffects[j] = finalEffect;
                };

                // Change itemsDropped from Objects into LootTableEntrys
                if ( finalUnit.itemsDropped !== undefined ) {
                    for (var j = 0; j < finalUnit.itemsDropped.length; j++) {
                        var lootTableEntry = finalUnit.itemsDropped[j];
                        var finalEntry = new game.LootTableEntry(lootTableEntry.itemID, lootTableEntry.relativeWeight);

                        game.util.copyProps(lootTableEntry, finalEntry, []);
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
                    game.util.copyProps(parsedUnit.battleData, finalUnit.battleData, ['battle']);
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
                game.util.copyProps(parsedCollectible, finalCollectible, []);
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
                game.util.copyProps(parsedGenerator, finalGenerator, []);

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
                    game.util.copyProps(parsedQuest, game.QuestManager.quests[i], []);
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
                game.util.copyProps(parsedBattle, finalBattle, ['enemyUnits', 'playerUnits', 'units']);

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
                    debugger;
                    var target = game.UnitManager.getUnitByID(parsedProjectile.target.id);
                    var owner = game.UnitManager.getUnitByID(parsedProjectile.owner.id);
                    var x = parsedProjectile.x;
                    var y = parsedProjectile.y;
                    var actionOnHit = parsedProjectile.actionOnHit;
                    var finalProjectile = new game.Projectile(x, y, actionOnHit, owner, target);
                    battle.projectiles[j] = finalProjectile;
                };
            };
        },

        loadSettings: function() {
            // Defaults that will be used if UI settings were never saved
            var graphicsSetting = game.GraphicsSettings.HIGH;
            var audioEnabledSetting = game.AUDIO_DEFAULT_ENABLED;
            var soundVolumeSetting = game.DEFAULT_SOUND_VOLUME;
            var musicVolumeSetting = game.DEFAULT_MUSIC_VOLUME;
            var minimapPositionSetting = game.MINIMAP_DEFAULT_POSITION;
            var minimapIsVisible = game.MINIMAP_DEFAULT_VISIBILITY;

            // Use the settings that were saved if they exist
            if ( localStorage.uiSettings !== undefined ) {
                var uiSettings = JSON.parse(localStorage.uiSettings);
                graphicsSetting = uiSettings.graphicsSetting;
                audioEnabledSetting = uiSettings.audioEnabledSetting;
                soundVolumeSetting = uiSettings.soundVolumeSetting;
                musicVolumeSetting = uiSettings.musicVolumeSetting;
                minimapPositionSetting = uiSettings.minimapPositionSetting;
                minimapIsVisible = uiSettings.minimapIsVisible;
            }
            game.graphicsUtil.setGraphicsSettings(graphicsSetting);
            game.AudioManager.setAudioEnabled(audioEnabledSetting);
            game.AudioManager.setSoundVolume(soundVolumeSetting);
            game.AudioManager.setMusicVolume(musicVolumeSetting);
            game.Minimap.setPanelPosition(minimapPositionSetting, minimapIsVisible);
            game.Minimap.setVisible(minimapIsVisible);
        },

        saveSettings: function() {
            var uiSettings = {};
            uiSettings.graphicsSetting = game.graphicsSetting;
            uiSettings.audioEnabledSetting = game.AudioManager.canPlayAudio();
            uiSettings.soundVolumeSetting = game.AudioManager.soundVolume;
            uiSettings.musicVolumeSetting = game.AudioManager.musicVolume;
            uiSettings.minimapPositionSetting = game.Minimap.position;
            uiSettings.minimapIsVisible = game.Minimap.visible;
            localStorage.uiSettings = JSON.stringify(uiSettings);
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

            // Our save file basically contains the old browser size, so call
            // this function to fix it.
            game.Camera.browserSizeChanged();
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