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
        game.Key.DOM_VK_F7/*I don't even think F7 does anything*/);

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
    var NUM_SPRITESHEETS_TO_LOAD = 3;

    $(document).ready(function() {
        init();
    });

    /**
     * Initialize everything.
     */
    function init() {
        initSettings();

        envSheet = new game.SpriteSheet(game.imagePath + '/env_24.png', game.TILESIZE, loadedSpritesheet);
        eff24Sheet = new game.SpriteSheet(game.imagePath + '/eff_24.png', game.TILESIZE, loadedSpritesheet);
        charSheet = new game.SpriteSheet(game.imagePath + '/char_24.png', game.TILESIZE, loadedSpritesheet);
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

        // Now that the overworld map is setup, check to see if we have a saved
        // game to load.
        if ( game.GameDataManager.hasSavedGame() ) {
            // Commenting this out because it produces too many oddities while
            // we're testing. This will be uncommented for production code.
            // 
            // NOTE: if you uncomment this, then make sure to get rid of the
            // loadSettings since it will be redundant.
            // game.GameDataManager.loadGame();
            
            game.GameDataManager.loadSettings();
        }

        // Uncomment this if you want to jump directly to normal gameplay when
        // you first start the game.
        // game.GameStateManager.debugTransitionFromOverworldToNormalMap();
    }

    function makeUI() {
        // This requires that the spritesheets were loaded.
        game.MinigameUI.setupUI();

        var $canvas = $('#canvas');
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

        var $settingsButton = $('#settingsButton');
        var $toggleMinimapVisibility = $('#toggleMinimapVisibility');
        var $showInventory = $('#showInventory');
        var $showQuests = $('#showQuests');
        var $showShop = $('#showShop');
        var $createUnits = $('#createUnits');
        var $grantMoney = $('#grantMoney');
        var $goToOverworld = $('#goToOverworld');

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

        $showQuests.button();
        $showQuests.click(function() {
            $(settingsDialog).dialog('close');
            $('#quest-ui').dialog('open');
        });

        $showShop.button();
        $showShop.click(function() {
            $settingsDialog.dialog('close');
            $('#shop-screen').dialog('open');
        });

        // This button is here for a couple of reasons:
        // 
        // 1. There are some pretty good bugs that've been found by spawning
        // multiple units at the same time or having units stacked on top of
        // each other.
        // 
        // 2. There's no other way on an iPad or something to spawn units
        // quickly.
        $createUnits.button();
        $createUnits.click(function() {
            $settingsDialog.dialog('close');
            for (var i = 0; i < 30; i++) {
                var newUnit = new game.Unit(game.UnitType.ORC.id,game.PlayerFlags.PLAYER,1);
                newUnit.placeUnit(1,9,game.MovementAI.FOLLOW_PATH);
                game.UnitManager.addUnit(newUnit);
            };
            for (var i = 0; i < 30; i++) {
                var newUnit = new game.Unit(game.UnitType.ORC.id,game.PlayerFlags.ENEMY,1);
                newUnit.placeUnit(23,9,game.MovementAI.FOLLOW_PATH);
                game.UnitManager.addUnit(newUnit);
            };
        });

        $grantMoney.button();
        $grantMoney.click(function() {
            $settingsDialog.dialog('close');
            game.Player.modifyCoins(9999999);
        });

        $goToOverworld.button();
        $goToOverworld.click(function() {
            $settingsDialog.dialog('close');

            // Set the game state to something that has a valid transition to
            // the overworld state. We may not have a valid transition to the
            // win state, so we manually set it here instead of going through
            // setState.
            game.GameStateManager.currentState = game.GameStates.NORMAL_WIN_SCREEN;
            game.GameStateManager.enterOverworldState();
        });

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
                of: $canvas
            },

            close: function(event, ui) {
                $settingsButton.show();
            }

        });

        game.DialogManager.addDialog($settingsDialog);

        $lowGraphicsButton.button();
        $highGraphicsButton.button();

        $lowGraphicsButton.click(function() {
            $settingsDialog.dialog('close');
            game.graphicsUtil.setGraphicsSettings(game.GraphicsSettings.LOW);
        });
        $highGraphicsButton.click(function() {
            $settingsDialog.dialog('close');
            game.graphicsUtil.setGraphicsSettings(game.GraphicsSettings.HIGH);
        });

        $audioOffButton.button();
        $audioOnButton.button();

        $audioOffButton.click(function() {
            $settingsDialog.dialog('close');
            game.AudioManager.setAudioEnabled(false);
        });
        $audioOnButton.click(function() {
            $settingsDialog.dialog('close');
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
            $settingsDialog.dialog('close');
            game.Minimap.setPanelPosition(game.DirectionFlags.UP | game.DirectionFlags.LEFT, true);
        });
        $minimapUpRightButton.click(function() {
            $settingsDialog.dialog('close');
            game.Minimap.setPanelPosition(game.DirectionFlags.UP | game.DirectionFlags.RIGHT, true);
        });
        $minimapDownLeftButton.click(function() {
            $settingsDialog.dialog('close');
            game.Minimap.setPanelPosition(game.DirectionFlags.DOWN | game.DirectionFlags.LEFT, true);
        });
        $minimapDownRightButton.click(function() {
            $settingsDialog.dialog('close');
            game.Minimap.setPanelPosition(game.DirectionFlags.DOWN | game.DirectionFlags.RIGHT, true);
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
                        game.AudioManager.setSoundVolume(ui.value);
                    } else {
                        game.AudioManager.setMusicVolume(ui.value);
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
        var hammertime = $canvas.hammer({prevent_default:true});

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

            if ( game.Minimap.pointInMinimap(offsetX, offsetY) ) {
                game.Minimap.centerMinimapOn(offsetX, offsetY);
                return;
            }

            // Make sure the tile is in-bounds
            if ( tileX < 0 || tileX >= game.currentMap.numCols || tileY < 0 || tileY >= game.currentMap.numRows ) {
                return;
            }

            var tile = game.currentMap.getTile(tileX, tileY);
            
            // If you're currently trying to use an item, then check to see if
            // the user clicked a valid target
            if ( game.playerInventoryUI.attemptToUseItem(worldX, worldY) ) {
                // If that worked, then we don't attempt to open the spawners
                // (perhaps you were targeting a unit on your spawner, or you
                // were targeting the spawner itself - you wouldn't want to open
                // the placement UI).
                return;
            }

            var tileIsSpawnPoint = game.currentMap.isSpawnerPoint(tileX, tileY);

            // Clicking a "spawner" in the overworld will take you to a map to
            // play normally on.
            if ( game.GameStateManager.inOverworldMap() && tileIsSpawnPoint && !game.currentMap.isFoggy(tileX, tileY)) {
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
        });

        $canvas.mousewheel(game.Camera.getMouseWheelEventHandler());

        // Initialize the UI showing the inventory.
        // We initialize the UI first so that the character pictures show up
        // before the equipment slots.
        game.playerInventoryUI = new game.PlayerInventoryUI();
        game.Player.inventory = new game.PlayerInventory();

        // Initialize the quest slots
        game.QuestManager.initialize();

        game.UnitPlacementUI.setupUI();
        game.LootUI.setupUI();
        game.QuestUI.setupUI();
        game.ShopUI = new game.ShopUI();
        game.ShopInventory = new game.ShopInventory();
        game.AudioManager.setAudioEnabled(game.AudioManager.audioEnabled);

        game.AudioManager.initialize();
    }

    function initSettings() {
        ctx = $('#canvas')[0].getContext('2d');

        //Calculate canvas height and width
        game.canvasWidth = parseInt($('#canvas').attr('width'));
        game.canvasHeight = parseInt($('#canvas').attr('height'));

        game.UICanvas.initialize();

        addKeyboardListeners();
    }

    function addKeyboardListeners() {
        // Pixels/second
        speed = 150;
        $(document).keydown(function(evt) {
            game.playerUsedKeyboard = true;
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

        });

        $(document).keyup(function(evt) {

            if ( evt.keyCode == game.Key.DOM_VK_ALT ) {
                game.keyPressedToDisplayLifeBars = false;
            }

            // Spacebar
            if ( evt.keyCode == game.Key.DOM_VK_SPACE ) {
                game.UICanvas.buyCurrentUnit();
            }

            // Pressing 'L' will toggle life bars between the following:
            // * Display for player
            // * Display for enemy
            // * Display for both
            // * Don't display
            if ( evt.keyCode == game.Key.DOM_VK_L ) {
                if ( game.displayLifeBarForPlayer == game.DisplayLifeBarFor.PLAYER_AND_ENEMY ) {
                    game.displayLifeBarForPlayer = 0;
                } else {
                    game.displayLifeBarForPlayer++;
                }
            }

            // 'Z' - save game
            if ( evt.keyCode == game.Key.DOM_VK_Z ) {
                game.GameDataManager.saveGame();
                var textObj = new game.TextObj(game.canvasWidth / 2, game.canvasHeight / 2, 'SAVING', true, '#0f0', false);
                game.TextManager.addTextObj(textObj);
            }

            // 'X' - load game
            if ( evt.keyCode == game.Key.DOM_VK_X ) {
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
            if ( evt.keyCode == game.Key.DOM_VK_F) {
                game.currentMap.clearAllFog();
            }

            // 'F7' - delete the save file
            if ( evt.keyCode == game.Key.DOM_VK_F7) {
                game.GameDataManager.deleteSavedGame();
            }

            // 'U' - shake the camera
            if (evt.keyCode == game.Key.DOM_VK_U) {
                // Shake the camera for approximately 20 game loops
                game.Camera.shakeTimer = 20 * game.MS_PER_FRAME;
            }

            // 'K' - add quest
            if (evt.keyCode == game.Key.DOM_VK_K) {
                game.QuestManager.addNewQuest();
            }

            // 'C' - generate a collectible on the map
            if (evt.keyCode == game.Key.DOM_VK_C) {
                game.CollectibleManager.addNewCollectible();
            }

            // 'O' - add equippable item to inventory
            // 'P' - add usable item to inventory
            var itemID = null;
            if (evt.keyCode == game.Key.DOM_VK_O) {
                itemID = game.ItemType.SHIELD.id;
            }
            if (evt.keyCode == game.Key.DOM_VK_P) {
                itemID = game.ItemType.MEGA_CREATE_SPAWNER.id;
            }

            if ( itemID != null ) {
                game.Player.inventory.addItem(new game.Item(itemID));
            }

            // 'M' - if not positive, bring money to 1000. Otherwise, double it.
            if (evt.keyCode == game.Key.DOM_VK_M) {
                var coins = game.Player.coins;
                coins = coins <= 0 ? (-coins + 1000) : coins;
                game.Player.modifyCoins(coins);
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

            // 'N' - add 3 of each unit type to the unit placement UI
            if (evt.keyCode == game.Key.DOM_VK_N) {
                game.UnitPlacementUI.debugAddUnits();
            }

            // 'R' - place all unplaced units for free
            if (evt.keyCode == game.Key.DOM_VK_R) {
                var tileX = game.UnitPlacementUI.spawnPointX;
                var tileY = game.UnitPlacementUI.spawnPointY;
                game.UnitManager.placeAllPlayerUnits(tileX, tileY, game.MovementAI.FOLLOW_PATH);
            }

            // 'H' - win the game.
            if (evt.keyCode == game.Key.DOM_VK_H) {
                game.GameStateManager.enterWinState();
            }

            // 'J' - lose the game.
            if (evt.keyCode == game.Key.DOM_VK_J) {
                game.GameStateManager.enterLoseState();
            }

            // 'I' - toggle the inventory screen
            if (evt.keyCode == game.Key.DOM_VK_I) {
                var $invScreen = $('#inventory-screen');
                if ( $invScreen.is(":visible") ) {
                    game.playerInventoryUI.hide();
                } else {
                    game.playerInventoryUI.show();
                }
            }

            // 'Q' - toggle the quest UI
            if (evt.keyCode == game.Key.DOM_VK_Q) {
                var $questUI = $('#quest-ui');
                if ( $questUI.is(":visible") ) {
                    $('#quest-ui').dialog('close');
                } else {
                    $('#quest-ui').dialog('open');
                }
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
        if ( keysDown[game.Key.DOM_VK_G] ) {
            delta *= 2;
        }

        // 'V' - speed up the game (see 'G'). Can be combined with 'G'.
        if ( keysDown[game.Key.DOM_VK_V] ) {
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

        // Fog will cover everything drawn before this line of code (e.g. units,
        // projectiles).
        game.currentMap.drawFog(ctx);

        game.currentMap.drawOverworldDescriptions(ctx);

        // Restore so that the camera will stop affecting the following draw
        // commands.
        ctx.restore();
        game.TextManager.draw(ctx);

        game.Player.drawCastleLife(ctx);

        game.Camera.concealOutOfBoundsAreas(ctx);

        // The stuff that is drawn now will show up even over the "concealed"
        // areas.
        game.GameStateManager.draw(ctx);
        game.Player.drawCoinTotal(ctx);
        game.Minimap.draw(ctx);

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
