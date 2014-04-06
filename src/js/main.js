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

    var gameloopId;

    var ctxOrigZoom;

    // Time (in MS) of the last update.
    var lastUpdate;

    // The canvas context
    var ctx = null;

    // Prevent these keys from doing their default action.
    var browserKeysToStop = new Array(game.Key.DOM_VK_PAGE_UP, game.Key.DOM_VK_PAGE_DOWN, 
        game.Key.DOM_VK_END, game.Key.DOM_VK_HOME, game.Key.DOM_VK_LEFT, game.Key.DOM_VK_UP, 
        game.Key.DOM_VK_RIGHT, game.Key.DOM_VK_DOWN, game.Key.DOM_VK_SPACE, 
        game.Key.DOM_VK_F7/*I don't even think F7 does anything*/, game.Key.DOM_VK_F10);

    // This is a dictionary of keycode --> boolean representing whether it is held.
    var keysDown = {};

    /**
     * The number of spritesheets that have been loaded so far.
     * @type {Number}
     */
    var numSpritesheetsLoaded = 0;

    /**
     * The number of spritesheets that the game has to load.
     * @type {Number}
     */
    var NUM_SPRITESHEETS_TO_LOAD = 6;

    // This is global.
    game.$canvas = null;

    /**
     * I plan on releasing this game with the full source code, so I don't
     * really care if people cheat, but I don't want them to accidentally ruin
     * their experience by pressing a "dev" button like "H" to automatically win
     * a map, so they first need to press F10 to be able to "cheat".
     * @type {Boolean}
     */
    game.devModeEnabled = false;

    $(window).load(function() {
        init();
    });

    /**
     * Initialize everything.
     */
    function init() {
        initSettings();

        envSheet = new game.SpriteSheet(game.imagePath + '/env_24.png', game.TILESIZE, loadedSpritesheet);
        eff24Sheet = new game.SpriteSheet(game.imagePath + '/eff_24.png', game.TILESIZE, loadedSpritesheet);
        eff32Sheet = new game.SpriteSheet(game.imagePath + '/eff_32.png', game.ITEM_SPRITE_SIZE, loadedSpritesheet);
        charSheet = new game.SpriteSheet(game.imagePath + '/char_24.png', game.TILESIZE, loadedSpritesheet);
        itemSheet = new game.SpriteSheet(game.imagePath + '/item_32.png', game.ITEM_SPRITE_SIZE, loadedSpritesheet);
        iconSheet = new game.SpriteSheet(game.imagePath + '/icon_16.png', game.ICON_SPRITE_SIZE, loadedSpritesheet);
    }

    /**
     * When you're finished loading a spritesheet, call this. When all
     * spritesheets are done loading, this will call the next function in the
     * setup chain.
     */
    function loadedSpritesheet() {
        numSpritesheetsLoaded++;
        LoadingManager.addProgress();

        if ( numSpritesheetsLoaded >= NUM_SPRITESHEETS_TO_LOAD ) {
            doneLoadingEverything();
        }
    }

    /**
     * This is called after makeUI is called and everything is loaded.
     */
    function setStartingGameState() {
        game.GameStateManager.switchToOverworldMap();

        // Now that the overworld map is setup autoload a saved game. If, as a
        // programmer, you don't want this here because you're testing
        // something, then instead put "game.GameDataManager.loadSettings()".
        game.GameDataManager.loadGame();

        // Uncomment this if you want to jump directly to normal gameplay when
        // you first start the game.
        // game.GameStateManager.debugTransitionFromOverworldToNormalMap();
    }

    function makeUI() {
        // This requires that the spritesheets were loaded.
        game.MinigameUI.setupUI();

        var $lowGraphicsButton = $('#graphicsLow');
        var $highGraphicsButton = $('#graphicsHigh');
        var $audioOffButton = $('#audioOff');
        var $audioOnButton = $('#audioOn');
        var $soundSlider = $('#soundSlider');
        var $musicSlider = $('#musicSlider');
        var $minimapUpLeftButton = $('#minimapUpLeft');
        var $minimapUpRightButton = $('#minimapUpRight');
        var $minimapDownLeftButton = $('#minimapDownLeft');
        var $minimapDownRightButton = $('#minimapDownRight');
        var $showLootNotifications = $('#showLootNotifications');
        var $showLifebarPlayer = $('#showLifebarPlayer');
        var $showLifebarEnemy = $('#showLifebarEnemy');
        var $showLifebarCastle = $('#showLifebarCastle');

        var $settingsButton = $('#settingsButton');
        var $toggleMinimapVisibility = $('#toggleMinimapVisibility');
        var $showInventory = $('#showInventory');
        var $showShop = $('#showShop');
        var $forfeit = $('#forfeit');

        $settingsButton.button({
            icons: {
                primary: 'ui-icon-gear'
            },
            text: false
        });
        $settingsButton.click(function() {
            $settingsDialog.dialog('open');
            $settingsButton.hide();
        });

        $toggleMinimapVisibility.button({
            icons: {
                primary: 'ui-icon-minus'
            },
            text: false
        });
        $toggleMinimapVisibility.click(function() {
            game.Minimap.toggleVisibility();
        });

        // Set it to whatever we coded the minimap to be.
        game.Minimap.setVisible(game.Minimap.visible);

        game.GameStateManager.setupTransitionButtons();

        $showInventory.button();
        $showInventory.click(function() {
            $settingsDialog.dialog('close');
            game.playerInventoryUI.show();
        });

        $showShop.button();
        $showShop.click(function() {
            $settingsDialog.dialog('close');
            $('#shop-screen').dialog('open');
        });

        $forfeit.button();
        $forfeit.click(function() {
            $settingsDialog.dialog('close');

            game.GameStateManager.enterLoseState();
        });
        $forfeit.button('disable');

        var $settingsDialog = $('#settingsDialog');
        $settingsDialog.dialog({
            autoOpen: false,
            draggable:false,
            resizable:false,
            hide: {
                // Effects that call createWrapper or clone could break
                // positioning, theming, or both.
                // 
                // Fade is one of the few effects we can use.
                effect: 'fade',
                duration: game.DIALOG_HIDE_MS
            },

            maxHeight: 470,

            // Wrap the dialog in a span so that it gets themed correctly.
            // 
            // An alternative to this would be to make a 'create' event with:
            // $settingsDialog.parent().wrap('<span class="le-frog"/>');
            // 
            // Note: I don't use dialogClass here for the theming because it
            // only adds whatever class you specify to the end of the ui-dialog
            // div so that you get: class="ui-dialog ui-widget ui-widget-content
            // ui- corner-all le-frog"
            appendTo:"#settingsDialogThemeSpan",

            // Position the element at the upper right of the canvas.
            position: {
                // This says: "my upper right goes at the upper right of the
                // canvas"
                my: 'right top',
                at: 'right top',
                of: game.$canvas
            },

            close: function(event, ui) {
                $settingsButton.show();
            }

        });

        game.DialogManager.addDialog($settingsDialog);

        $lowGraphicsButton.button();
        $highGraphicsButton.button();

        $lowGraphicsButton.click(function() {
            game.graphicsUtil.setGraphicsSettings(game.GraphicsSettings.LOW);
        });
        $highGraphicsButton.click(function() {
            game.graphicsUtil.setGraphicsSettings(game.GraphicsSettings.HIGH);
        });

        $audioOffButton.button();
        $audioOnButton.button();

        $audioOffButton.click(function() {
            game.AudioManager.setAudioEnabled(false);
        });
        $audioOnButton.click(function() {
            game.AudioManager.setAudioEnabled(true);
        });

        $minimapUpLeftButton.button({
            icons: {
            primary: 'ui-icon-arrow-1-nw'
            },
            text: false
        });
        $minimapUpRightButton.button({
            icons: {
                primary: 'ui-icon-arrow-1-ne'
            },
            text: false
        });
        $minimapDownLeftButton.button({
            icons: {
                primary: 'ui-icon-arrow-1-sw'
            },
            text: false
        });
        $minimapDownRightButton.button({
            icons: {
                primary: 'ui-icon-arrow-1-se'
            },
            text: false
        });

        $minimapUpLeftButton.click(function() {
            game.Minimap.setPanelPosition(game.DirectionFlags.UP | game.DirectionFlags.LEFT, true);
        });
        $minimapUpRightButton.click(function() {
            game.Minimap.setPanelPosition(game.DirectionFlags.UP | game.DirectionFlags.RIGHT, true);
        });
        $minimapDownLeftButton.click(function() {
            game.Minimap.setPanelPosition(game.DirectionFlags.DOWN | game.DirectionFlags.LEFT, true);
        });
        $minimapDownRightButton.click(function() {
            game.Minimap.setPanelPosition(game.DirectionFlags.DOWN | game.DirectionFlags.RIGHT, true);
        });

        $showLootNotifications.click(function() {
            game.LootUI.setShowLootNotifications();
        });

        $showLifebarPlayer.click(function() {
            game.Player.setShowLifebars($showLifebarPlayer.prop('checked'), undefined, undefined);
        });

        $showLifebarEnemy.click(function() {
            game.Player.setShowLifebars(undefined, $showLifebarEnemy.prop('checked'), undefined);
        });

        $showLifebarCastle.click(function() {
            game.Player.setShowLifebars(undefined, undefined, $showLifebarCastle.prop('checked'));
        });

        // Set up the audio volume sliders
        $.each([$soundSlider, $musicSlider], function(index, value) {
            value.slider({
                min:0,
                max:100,
                value:((value === $soundSlider) ? game.DEFAULT_SOUND_VOLUME : game.DEFAULT_MUSIC_VOLUME),
                range:'max',
                slide: function( event, ui ) {
                    // We're in a $.each here, so make sure we're modifying the
                    // correct audio volume.
                    if ( value === $soundSlider ) {
                        game.AudioManager.setSoundVolume(ui.value, true);
                    } else {
                        game.AudioManager.setMusicVolume(ui.value, true);
                    }
                }
            });
        });

        $('#soundSlider > .ui-slider-range').css({
            'background': '#000'
        });

        $('#musicSlider > .ui-slider-range').css({
            'background': '#000'
        });

        // To see what's in Hammer events, look at their wiki (currently located
        // here: https://github.com/EightMedia/hammer.js/wiki/Getting-Started).
        // 
        // game.util.dumpObject comes in handy here too.
        var hammertime = game.$canvas.hammer({prevent_default:true});

        // Get all of the camera's event handlers.
        hammertime.on('transformstart', game.Camera.getTransformStartEventHandler());
        hammertime.on('transform', game.Camera.getTransformEventHandler());
        hammertime.on('dragstart', game.Camera.getDragStartEventHandler());
        hammertime.on('drag', game.Camera.getDragEventHandler());
        hammertime.on('dragend', game.HammerHelper.getResetDraggingHandler() );
        hammertime.on('transformend', function(event) { game.HammerHelper.hammerResetTransforming = true; } );

        // Handle all the events from a user clicking/tapping the canvas
        hammertime.on('release', function(event) {
            if ( game.HammerHelper.hammerDragging == true || game.HammerHelper.hammerTransforming == true ) return;
            // This works on Chrome, Firefox, and IE on a desktop, and Safari and Chrome on an iPad, so it probably works for everything.
            var offsetX = event.gesture.center.pageX - event.gesture.target.offsetLeft;
            var offsetY = event.gesture.center.pageY - event.gesture.target.offsetTop;

            // Convert to world coordinates and also tile coordinates
            var worldX = game.Camera.canvasXToWorldX(offsetX);
            var worldY = game.Camera.canvasYToWorldY(offsetY);
            var tileX = Math.floor(worldX / game.TILESIZE);
            var tileY = Math.floor(worldY / game.TILESIZE);

            // This is a debug function that we should really take out.
            //
            // Ctrl+click will display the tile number, and if it's an overworld
            // map node, it will reveal fog as though you beat that map.
            if ( keysDown[game.Key.DOM_VK_CONTROL] && game.devModeEnabled ) {
                var tileStr = 'Tile: (' + tileX + ', ' + tileY + ')';
                var textObj = new game.TextObj(worldX, worldY, tileStr, true, '#0f0', true);
                game.TextManager.addTextObj(textObj);


                var nodeOfMap = game.OverworldMapData.getOverworldNode(tileX, tileY);
                if ( nodeOfMap != null ) {
                    var fogToClear = nodeOfMap.clearFog;
                    if ( fogToClear !== undefined ) {
                        for (var i = 0; i < fogToClear.length; i++) {
                            var fogData = fogToClear[i];
                            var drawCircular = fogData[3] !== undefined ? fogData[3] : false;
                            game.overworldMap.setFog(fogData[0], fogData[1], fogData[2], false, drawCircular);
                        };
                    }
                }

                return;
            }

            // Tapping anywhere with a book open will close the book.
            if ( game.GameStateManager.isReadingABook() ) {
                game.BookManager.stopReadingBook();
                return;
            }

            if ( game.Minimap.pointInMinimap(offsetX, offsetY) ) {
                game.Minimap.centerMinimapOn(offsetX, offsetY);
                return;
            }

            // Make sure the tile is in-bounds
            if ( tileX < 0 || tileX >= game.currentMap.numCols || tileY < 0 || tileY >= game.currentMap.numRows ) {
                return;
            }

            var tile = game.currentMap.getTile(tileX, tileY);
            var isFoggy = game.currentMap.isFoggy(tileX, tileY);
            
            // If you're currently trying to use an item, then check to see if
            // the user clicked a valid target
            if ( game.playerInventoryUI.attemptToUseItem(worldX, worldY) ) {
                // If that worked, then we don't attempt to open the spawners
                // (perhaps you were targeting a unit on your spawner, or you
                // were targeting the spawner itself - you wouldn't want to open
                // the placement UI).
                return;
            }

            // Check to see if you opened a book.
            if ( game.GameStateManager.inOverworldMap() && !isFoggy && game.BookManager.openBookIfOneExistsHere(tileX, tileY) ) {
                return;
            }

            // Check to see if you clicked a statue.
            if ( game.GameStateManager.inOverworldMap() && game.overworldMap.tileContainsStatue(tileX, tileY) ) {
                var textX = Math.min(game.canvasWidth - 200, offsetX);
                var textY = Math.min(game.canvasHeight - 75, offsetY);
                var textBox = new game.TextBox(textX, textY, 'This statue indicates that you\'ve beaten the adjacent world.', 400);
                textBox.ttl /= 2;
                game.TextManager.textBoxes.push(textBox);
                return;
            }

            var tileIsSpawnPoint = game.currentMap.isSpawnerPoint(tileX, tileY);

            // Clicking a "spawner" in the overworld will take you to a map to
            // play normally on.
            if ( game.GameStateManager.inOverworldMap() && tileIsSpawnPoint && !isFoggy) {
                // If you haven't purchased a unit when you tried to enter the
                // map, then you should be told how the game works.
                if ( !game.UnitPlacementUI.purchasedAtLeastOneUnit() ) {
                    game.BookManager.forceBookToOpen(0);
                    return;
                }

                game.overworldMap.tileOfLastMap = tile;
                game.GameStateManager.transitionToNormalMap();
                game.AudioManager.playAudio(game.Audio.BLIP_1);
                return;
            }

            // Check to see if the user tapped a spawner
            if (game.UnitPlacementUI.canSpawnUnits() && tileIsSpawnPoint) {
                game.UnitPlacementUI.setSpawnPoint(tileX, tileY);
                game.AudioManager.playAudio(game.Audio.BLIP_1);
            }
        });

        $(window).resize(function() {
            game.Camera.browserSizeChanged();
            game.DialogManager.browserSizeChanged();
            game.Minimap.browserSizeChanged();
            game.BookManager.browserSizeChanged();
        });

        game.$canvas.mousewheel(game.Camera.getMouseWheelEventHandler());

        // Initialize the UI showing the inventory.
        // We initialize the UI first so that the character pictures show up
        // before the equipment slots.
        game.playerInventoryUI = new game.PlayerInventoryUI();
        game.Player.inventory = new game.PlayerInventory();

        game.BookDialog.setupUI();
        game.ShopUI = new game.ShopUI();
        game.ShopInventory = new game.ShopInventory();

        game.AudioManager.initialize();
        game.AudioManager.setAudioEnabled(game.AudioManager.audioEnabled);

        game.LootUI.setupUI();
    }

    function initSettings() {
        game.$canvas = $('#canvas');
        ctx = game.$canvas[0].getContext('2d');

        //Calculate canvas height and width
        game.canvasWidth = parseInt(game.$canvas.attr('width'));
        game.canvasHeight = parseInt(game.$canvas.attr('height'));

        game.UICanvas.initialize();

        addKeyboardListeners();
    }

    function addKeyboardListeners() {
        // Pixels/second
        speed = 150;
        $(document).keydown(function(evt) {
            if ( !game.playerUsedKeyboard ) {
                // The player used the keyboard for the first time. This means
                // we know they have a keyboard! We can change certain logic to
                // accommodate this.
                game.playerUsedKeyboard = true;

                game.playerInventoryUI.updateSellButton();
            }
            keysDown[evt.keyCode] = true;

            if ($.inArray(evt.keyCode, browserKeysToStop) > -1) {
                // Stop the browser from handling this
                evt.preventDefault();
            }

            // Press ALT to show life bars
            if ( evt.keyCode == game.Key.DOM_VK_ALT ) {
                game.keyPressedToDisplayLifeBars = true;

                // Stop the browser from going to the alt menu
                evt.preventDefault();
            }

            // '+' - zoom in
            if ( evt.keyCode == game.Key.DOM_VK_ADD || evt.keyCode == game.Key.DOM_VK_EQUALS || evt.keyCode == game.Key.DOM_VK_EQUALS2 ) {
                game.Camera.modifyZoomBy(1);
            }
            
            // '-' - zoom out
            if ( evt.keyCode == game.Key.DOM_VK_SUBTRACT || evt.keyCode == game.Key.DOM_VK_SUBTRACT2 || evt.keyCode == game.Key.DOM_VK_SUBTRACT3 ) {
                game.Camera.modifyZoomBy(-1);
            }

            // 'Right arrow key'
            if ( evt.keyCode == game.Key.DOM_VK_RIGHT ) {
                game.UICanvas.highlightNewUnit(game.DirectionFlags.RIGHT);
            }

            // 'Left' arrow key
            if ( evt.keyCode == game.Key.DOM_VK_LEFT ) {
                game.UICanvas.highlightNewUnit(game.DirectionFlags.LEFT);
            }

            // 'Up' arrow key - select previous spawner
            if ( evt.keyCode == game.Key.DOM_VK_UP ) {
                game.UnitPlacementUI.selectSpawner(false);
            }            

            // 'Down' arrow key - select next spawner
            if ( evt.keyCode == game.Key.DOM_VK_DOWN ) {
                game.UnitPlacementUI.selectSpawner(true);
            }

            // 'Enter' or 'numpad enter' - select "return to overworld" on the
            // 'minigame-win screen.
            if ( evt.keyCode == game.Key.DOM_VK_RETURN || evt.keyCode == game.Key.DOM_VK_ENTER ) {
                if ( game.GameStateManager.inMinigameWinState() ) {
                    game.GameStateManager.enterOverworldState();
                }
            }

        });

        $(document).keyup(function(evt) {

            if ( evt.keyCode == game.Key.DOM_VK_ALT ) {
                game.keyPressedToDisplayLifeBars = false;
            }

            // Spacebar
            if ( evt.keyCode == game.Key.DOM_VK_SPACE ) {
                game.UICanvas.buyCurrentUnit();
            }

            // 'Q' - sell selected item
            if ( evt.keyCode == game.Key.DOM_VK_Q ) {
                game.playerInventoryUI.sellSelectedItem();
            }

            // 'Z' - save game
            if ( evt.keyCode == game.Key.DOM_VK_Z && game.devModeEnabled) {
                game.GameDataManager.saveGame();
                var textObj = new game.TextObj(game.canvasWidth / 2, game.canvasHeight / 2, 'SAVING', true, '#0f0', false);
                game.TextManager.addTextObj(textObj);
            }

            // 'X' - load game
            if ( evt.keyCode == game.Key.DOM_VK_X && game.devModeEnabled) {
                game.GameDataManager.loadGame();
                var textObj = new game.TextObj(game.canvasWidth / 2, game.canvasHeight / 2, 'LOADING', true, '#0f0', false);
                game.TextManager.addTextObj(textObj);
            }

            // Pressing 'B' will toggle between showing life bars while units
            // are battling and not showing them
            if ( evt.keyCode == game.Key.DOM_VK_B ) {
                game.displayLifeBarsInBattle = !game.displayLifeBarsInBattle;
            }

            // 'F' - Clears all fog from current map
            if ( evt.keyCode == game.Key.DOM_VK_F && game.devModeEnabled ) {
                game.currentMap.clearAllFog();
            }

            // 'F7' - delete the save file
            if ( evt.keyCode == game.Key.DOM_VK_F7 && game.devModeEnabled ) {
                game.GameDataManager.deleteSavedGame();
            }

            // 'F10' - toggle dev mode
            if ( evt.keyCode == game.Key.DOM_VK_F10) {
                game.devModeEnabled = !game.devModeEnabled;
                var text = 'Dev mode is ' + (game.devModeEnabled ? 'enabled' : 'disabled') + '! (F10)';
                var color = game.devModeEnabled ? '#0f0' : '#f00';

                var textObj = new game.TextObj(game.canvasWidth / 2, game.canvasHeight / 2, text, true, color, false);
                game.TextManager.addTextObj(textObj);
            }

            // 'U' - shake the camera
            if (evt.keyCode == game.Key.DOM_VK_U && game.devModeEnabled ) {
                // Shake the camera for approximately 20 game loops
                game.Camera.shakeTimer = 20 * game.MS_PER_FRAME;
            }

            // 'C' - generate a collectible on the map
            if (evt.keyCode == game.Key.DOM_VK_C && game.devModeEnabled ) {
                game.CollectibleManager.addNewCollectible();
            }

            // 'K' - create random items for the player
            if (evt.keyCode == game.Key.DOM_VK_K && game.devModeEnabled ) {
                for (var i = 0; i < 10; i++) {
                    var minLevel = 1;
                    var maxLevel = 1000;
                    // Guarantee both usable and equippable over the course of
                    // this loop.
                    game.Player.inventory.addItem(game.GenerateRandomItem(minLevel, maxLevel, i <= 4, i >= 4));
                };
            }

            // 'O' - add equippable item to inventory
            // 'P' - add usable item to inventory
            var itemID = null;
            if (evt.keyCode == game.Key.DOM_VK_O && game.devModeEnabled ) {
                itemID = game.ItemType.SHIELD.id;
            }
            if (evt.keyCode == game.Key.DOM_VK_P && game.devModeEnabled ) {
                itemID = game.ItemType.MEGA_CREATE_SPAWNER.id;
            }

            if ( itemID != null ) {
                game.Player.inventory.addItem(new game.Item(itemID));
            }

            // 'M' - if not positive, bring money to 1000. Otherwise, double it.
            // Same for diamonds.
            if (evt.keyCode == game.Key.DOM_VK_M && game.devModeEnabled ) {
                var coins = game.Player.coins;
                coins = coins <= 0 ? (-coins + 1000) : coins;
                game.Player.modifyCoins(coins);

                var diamonds = game.Player.diamonds;
                diamonds = diamonds <= 0 ? (-diamonds + 1000) : diamonds;
                game.Player.modifyDiamonds(diamonds);
            }

            // 'Y' - Opens shopUI
            if (evt.keyCode == game.Key.DOM_VK_Y) {
                var $shopUIScreen = $('#shop-screen');
                if ( $shopUIScreen.is(":visible") ) {
                    game.ShopUI.hide();
                } else {
                    game.ShopUI.show();
                }
            }

            // 'R' - place all unplaced units
            if (evt.keyCode == game.Key.DOM_VK_R ) {
                var tileX = game.UnitPlacementUI.spawnPointX;
                var tileY = game.UnitPlacementUI.spawnPointY;
                game.UnitManager.placeAllPlayerUnits(tileX, tileY, game.MovementAI.FOLLOW_PATH, !game.devModeEnabled);
            }

            // 'H' - win the game.
            if (evt.keyCode == game.Key.DOM_VK_H && game.devModeEnabled ) {
                game.GameStateManager.enterWinState();
            }

            // 'J' - lose the game.
            if (evt.keyCode == game.Key.DOM_VK_J && game.devModeEnabled ) {
                game.GameStateManager.enterLoseState();
            }

            // 'I' - toggle the inventory screen
            if (evt.keyCode == game.Key.DOM_VK_I) {
                game.playerInventoryUI.toggleVisibility();
            }

            // 'E' - play music
            if (evt.keyCode == game.Key.DOM_VK_E) {
                game.AudioManager.playAudio(game.Audio.NEW_3);
            }

            // 'Escape' - exit USE mode or close a JQuery UI dialog.
            if (evt.keyCode == game.Key.DOM_VK_ESCAPE) {
                if ( game.playerInventoryUI.isInUseMode() ) {
                    game.playerInventoryUI.exitUseMode();
                }
            }

            keysDown[evt.keyCode] = false;
        });
    }

    function gameLoop() {
        // Get the time that passed since the last update.
        var delta = Date.now() - lastUpdate;
        lastUpdate = Date.now();

        // Immediately tell the framerate limiter
        game.FramerateLimiter.update(delta);
        // Allow for some variability in the framerate, but not too much,
        // otherwise everything that uses this delta could hit problems. This is
        // because the user has control over this simply by pausing Javascript
        // execution in their browser, which means they can get this value
        // infinitely high.
        // 
        // An example of a bug that could result from an infinite delta is unit
        // movement; they would jump so far ahead on the path that they wouldn't
        // engage in battles.
        delta = Math.min(delta, game.MS_PER_FRAME * 2);

        // 'G' - speed up the game. This is only a debug function, so it may
        // 'cause glitches.
        if ( keysDown[game.Key.DOM_VK_G] && game.devModeEnabled ) {
            delta *= 2;
        }

        // 'V' - speed up the game (see 'G'). Can be combined with 'G'.
        if ( keysDown[game.Key.DOM_VK_V] && game.devModeEnabled ) {
            delta *= 4;
        }

        var deltaAsSec = delta / 1000;

        game.alphaBlink += deltaAsSec;

        game.Camera.update(keysDown, delta);

        // Draw a solid background on the canvas in case anything is transparent
        // This should eventually be unnecessary - we should instead draw a
        // parallax background or not have a transparent map.
        ctx.save();
        ctx.fillStyle = '#373737';
        ctx.fillRect(0, 0, game.canvasWidth, game.canvasHeight);

        ctx.restore();

        game.GameStateManager.update(delta);

        game.HammerHelper.update();

        // Update battles before units so that when the battle is over, the dead
        // units can be removed immediately by the UnitManager
        game.Player.update(delta);
        game.LootUI.update(delta);
        game.GeneratorManager.update(delta);
        game.CollectibleManager.update(delta);
        game.BattleManager.update(delta);
        game.UnitManager.update(delta);
        game.ParticleManager.update(delta);
        game.AnimatedSpriteManager.update(delta);
        game.TextManager.update(delta);
        game.AudioManager.update(delta);
        game.ShopInventory.update(deltaAsSec);

        // Draw under everything else
        game.FramerateLimiter.draw(ctx);


        ctx.save();
        game.Camera.scaleAndTranslate(ctx);

        game.currentMap.draw(ctx, false);
        ctx.restore();
        ctx.save();
        game.Camera.scaleAndTranslate(ctx);

        game.UnitPlacementUI.highlightCurrentSpawnPoint(ctx);
        game.GeneratorManager.draw(ctx);
        game.CollectibleManager.draw(ctx);
        game.UnitManager.draw(ctx);
        game.BattleManager.draw(ctx);
        game.ParticleManager.draw(ctx);
        game.AnimatedSpriteManager.draw(ctx);

        // Fog will cover everything drawn before this line of code (e.g. units,
        // projectiles).
        game.currentMap.drawFog(ctx);

        game.currentMap.drawOverworldDescriptions(ctx);

        // Restore so that the camera will stop affecting the following draw
        // commands.
        ctx.restore();
        game.TextManager.draw(ctx, true);

        game.Player.drawCastleLife(ctx);

        // Draw text that uses screen coordinates now that we've concealed the
        // non-world area.
        game.TextManager.draw(ctx, false);

        // The stuff that is drawn now will show up even over the "concealed"
        // areas.
        game.GameStateManager.draw(ctx);

        game.TextManager.drawTextBoxes(ctx, false);

        // Book contents won't be frosted over by the GameStateManager.
        game.BookManager.draw(ctx);
        game.Player.drawCurrencyTotal(ctx);
        game.Minimap.draw(ctx);

        game.LootUI.draw(ctx);

        game.UICanvas.draw();

        // The final addProgress is called after we've rendered everything once
        // already. That way we don't see a white screen flash due to the
        // canvases being unfilled. Note that this will be called every game
        // loop, but it's harmless unless we end up reusing the LoadingManager.
        LoadingManager.addProgress();
    }

    function doneLoadingEverything() {
        makeUI();
        setStartingGameState();

        lastUpdate = Date.now();

        // This will wipe out the timer (if it's non-null)
        clearInterval(gameloopId);
        gameloopId = setInterval(gameLoop, game.MS_PER_FRAME);
    }

}());
