( function() {

    // Global
    tileSize = 32;

    var gameloopId;

    var slotImage = new Image();
    
    var pinchZoomStart;
    var ctxOrigZoom;

    /**
     * [Global] The map we're looking at right now.
     * @type {Map}
     */
    currentMap = new game.Map();

    // Time (in MS) of the last update.
    var lastUpdate;

    // The canvas context
    var ctx = null;

    // Prevent these keys from doing their default action.
    var browserKeysToStop = new Array(game.Key.DOM_VK_PAGE_UP, game.Key.DOM_VK_PAGE_DOWN, game.Key.DOM_VK_END, game.Key.DOM_VK_HOME, game.Key.DOM_VK_LEFT, game.Key.DOM_VK_UP, game.Key.DOM_VK_RIGHT, game.Key.DOM_VK_DOWN);

    // This is a dictionary of keycode --> boolean representing whether it is held.
    var keysDown = {};

    $(document).ready(function() {
        init();
    });

    /**
     * Initialize everything.
     */
    function init() {
        initSettings();

        loadImages();

        envSheet = new game.SpriteSheet(game.imagePath + '/env_32.png', tileSize, function() {
            objSheet = new game.SpriteSheet(game.imagePath + '/obj_32.png', tileSize, function() {
                charSheet = new game.SpriteSheet(game.imagePath + '/char_32.png', tileSize, doneLoadingEverything);
            });
        });
    }

    function doneLoadingImages() {
        makeUI();
    }

    function loadImages() {
        slotImage.src = game.imagePath + '/archer.png';
        slotImage.onload = doneLoadingImages;
    }

    function makeUI() {
        var $canvas = $('#canvas');
        var canvasPos = $canvas.position();
        var $toggleParticlesButton = $('#toggleParticlesButton');

        var $settingsButton = $('#settingsButton');
        var $showInventory = $('#showInventory');
        var $showUnitPlacement = $('#showUnitPlacement');
        var $createUnits = $('#createUnits');
        $settingsButton.button({
              icons: {
                primary: 'ui-icon-gear'
              },
              text: false
          });


        $showInventory.button();
        $showInventory.click(function() {
            $settingsDialog.dialog('close');
            game.InventoryUI.show();
        });

        $showUnitPlacement.button(); // Turns the button into a JQuery UI button
        $showUnitPlacement.click(function() {
            $settingsDialog.dialog('close');
            $('#buyingScreenContainer').dialog('open');
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
                var newUnit = new game.Unit(game.UnitType.DEBUG,true);
                newUnit.placeUnit(1,9);
                game.UnitManager.addUnit(newUnit);
            };
            for (var i = 0; i < 30; i++) {
                var newUnit = new game.Unit(game.UnitType.DEBUG,false);
                newUnit.placeUnit(23,9);
                game.UnitManager.addUnit(newUnit);
            };
        });

        // Handle all the events from a user clicking/tapping the canvas
        $canvas.click(function(event) {
            // Apparently offsetX and offsetY aren't in every browser...
            // http://stackoverflow.com/questions/11334452/event-offsetx-in-firefox
            var offsetX = event.offsetX==undefined?event.originalEvent.layerX:event.offsetX;
            var offsetY = event.offsetY==undefined?event.originalEvent.layerY:event.offsetY;

            // Convert to world coordinates and also tile coordinates
            var worldX = game.Camera.canvasXToWorldX(offsetX);
            var worldY = game.Camera.canvasYToWorldY(offsetY);
            var tileX = Math.floor(worldX / tileSize);
            var tileY = Math.floor(worldY / tileSize);

            // Make sure the tile is in-bounds
            if ( tileX < 0 || tileX >= currentMap.numCols || tileY < 0 || tileY >= currentMap.numRows ) {
                return;
            }
            
            // If you're currently trying to use an item, then check to see if
            // the user clicked a valid target
            if ( game.InventoryUI.attemptToUseItem(worldX, worldY) ) {
                // If that worked, then we don't attempt to open the spawners
                // (perhaps you were targeting a unit on your spawner, or you
                // were targeting the spawner itself - you wouldn't want to open
                // the placement UI).
                return;
            }

            // Check to see if the user tapped a spawner
            if (currentMap.isSpawnerPoint(tileX, tileY)) {
                game.UnitPlacementUI.setSpawnPoint(tileX, tileY);
                $('#buyingScreenContainer').dialog('open');
            } else {
                $('#buyingScreenContainer').dialog('close');
            }
        });

        var settingsWidth = $settingsButton.width();

        $settingsButton.css({
            position : 'absolute',
            top : (canvasPos.top + 5) + 'px',
            left : (canvasPos.left + $canvas.width() - settingsWidth - 5) + 'px'
        });
        $settingsButton.click(function() {
            $settingsDialog.dialog('open');
            $settingsButton.hide();
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
                duration: 400
            },

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

        // This is done for theming
        $toggleParticlesButton.button();

        $toggleParticlesButton.click(function() {
            // Toggle particles
            game.ParticleManager.toggleEnabled();

            // Form the new text for this button
            var text = game.ParticleManager.enabled ? "Disable" : "Enable";
            text += " particles";

            // The text actually goes in a sibling label's child span.
            $($toggleParticlesButton.selector + ' ~ label > span').text(text);
        });

        // Look at https://github.com/EightMedia/hammer.js/blob/master/hammer.js to figure out what's in the event.
        // You get scale, rotation, distance, etc.
        // 
        // Pretty sure you should only call this once. Calling it multiple times will result in multiple events being fired.
        $canvas.hammer({prevent_default:true});
        
        // Get all of the camera's event handlers.
        $canvas.bind('transformstart', game.Camera.getTransformStartEventHandler());
        $canvas.bind('transform', game.Camera.getTransformEventHandler());
        $canvas.bind('transformend', function(event) {/*This does nothing*/});
        $canvas.bind('dragstart', game.Camera.getDragStartEventHandler());
        $canvas.bind('drag', game.Camera.getDragEventHandler());

        $canvas.mousewheel(game.Camera.getMouseWheelEventHandler());

        // Initialize the UI showing the inventory.
        // We initialize the UI first so that the character pictures show up
        // before the equipment slots.
        game.InventoryUI.setupUI();

        // Initialize the slots of our inventory.
        game.Inventory.initialize();

        game.UnitPlacementUI.setupUI();
        game.LootUI.setupUI();
    }

    function initSettings() {
        ctx = $('#canvas')[0].getContext('2d');

        var canvasPos = $('#canvas').position();

        //Calculate screen height and width
        screenWidth = parseInt($('#canvas').attr('width'));
        screenHeight = parseInt($('#canvas').attr('height'));

        game.Camera.initialize();

        addKeyboardListeners();
    }

    function addKeyboardListeners() {
        // Pixels/second
        speed = 150;
        $(document).keydown(function(evt) {
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

        });

        $(document).keyup(function(evt) {

            if ( evt.keyCode == game.Key.DOM_VK_ALT ) {
                game.keyPressedToDisplayLifeBars = false;
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

            // Pressing 'B' will toggle between showing life bars while units
            // are battling and not showing them
            if ( evt.keyCode == game.Key.DOM_VK_B ) {
                game.displayLifeBarsInBattle = !game.displayLifeBarsInBattle;
            }

            // Shake the camera when you press 'U'
            if (evt.keyCode == game.Key.DOM_VK_U) {
                // Shake the camera for approximately 20 game loops
                game.Camera.shakeTimer = 20 * 16;
            }

            var itemID = null;
            if (evt.keyCode == game.Key.DOM_VK_O) {
                itemID = game.ItemType.SHIELD.id;
            }
            if (evt.keyCode == game.Key.DOM_VK_P) {
                itemID = game.ItemType.LEAF.id;
            }

            if ( itemID != null ) {
                game.Inventory.addItem(new game.Item(itemID));
            }



            var unitType = null;
            if (evt.keyCode == game.Key.DOM_VK_1) {
                unitType = game.UnitType.DEBUG;
            }
            if (evt.keyCode == game.Key.DOM_VK_2) {
                unitType = game.UnitType.twoByOneUnit;
            }
            if (evt.keyCode == game.Key.DOM_VK_3) {
                unitType = game.UnitType.oneByTwoUnit;
            }
            if (evt.keyCode == game.Key.DOM_VK_4) {
                unitType = game.UnitType.twoByTwoUnit;
            }
            if ( unitType != null ) {
                var newUnit = new game.Unit(unitType,true);
                newUnit.placeUnit(1, 9);
                game.UnitManager.addUnit(newUnit);
            }

            var enemyUnitType = null;
            if (evt.keyCode == game.Key.DOM_VK_5) {
                enemyUnitType = game.UnitType.DEBUG;
            }
            if (evt.keyCode == game.Key.DOM_VK_6) {
                enemyUnitType = game.UnitType.twoByOneUnit;
            }
            if (evt.keyCode == game.Key.DOM_VK_7) {
                enemyUnitType = game.UnitType.oneByTwoUnit;
            }
            if (evt.keyCode == game.Key.DOM_VK_8) {
                enemyUnitType = game.UnitType.twoByTwoUnit;
            }
            if ( enemyUnitType != null ) {
                var newUnit = new game.Unit(enemyUnitType,false);
                newUnit.placeUnit(23,9);
                game.UnitManager.addUnit(newUnit);
            }

            if (evt.keyCode == game.Key.DOM_VK_9) {
                for (var i = 0; i < 20; i++) {
                    var newUnit = new game.Unit(game.UnitType.DEBUG,true);
                    newUnit.placeUnit(1,9);
                    game.UnitManager.addUnit(newUnit);
                };
            }
            if (evt.keyCode == game.Key.DOM_VK_0) {
                for (var i = 0; i < 20; i++) {
                    var newUnit = new game.Unit(game.UnitType.DEBUG,false);
                    newUnit.placeUnit(23,9);
                    game.UnitManager.addUnit(newUnit);
                };
            }

            // Pressing 'i' will toggle the inventory screen
            if (evt.keyCode == game.Key.DOM_VK_I) {
                var $invScreen = $('#inventory-screen');
                if ( $invScreen.is(":visible") ) {
                    $('#inventory-screen').dialog('close');
                } else {
                    game.InventoryUI.show();
                }
            }

            keysDown[evt.keyCode] = false;
        });
    }

    function gameLoop() {
        // Get the time that passed since the last update.
        var delta = Date.now() - lastUpdate;
        lastUpdate = Date.now();
        // Allow for some variability in the framerate, but not too much,
        // otherwise everything that uses this delta could hit problems. This is
        // because the user has control over this simply by pausing Javascript
        // execution in their browser, which means they can get this value
        // infinitely high.
        // 
        // An example of a bug that could result from an infinite delta is unit
        // movement; they would jump so far ahead on the path that they wouldn't
        // engage in battles.
        delta = Math.min(delta, game.msPerFrame * 2);

        // Allow for some variability in the framerate, but not too much,
        // otherwise everything that uses this delta could hit problems. This is
        // because the user has control over this simply by pausing Javascript
        // execution in their browser, which means they can get this value
        // infinitely high.
        // 
        // An example of a bug that could result from an infinite delta is unit
        // movement; they would jump so far ahead on the path that they wouldn't
        // engage in battles.
        delta = Math.min(delta, game.msPerFrame * 2);
        var deltaAsSec = delta / 1000;

        game.alphaBlink += deltaAsSec;

        game.Camera.update(keysDown, delta);

        // Draw a solid background on the canvas in case anything is transparent
        // This should eventually be unnecessary - we should instead draw a
        // parallax background or not have a transparent map.
        ctx.save();
        ctx.fillStyle = '#373737';
        ctx.fillRect(0, 0, screenWidth, screenHeight);

        ctx.restore();

        // Update battles before units so that when the battle is over, the dead
        // units can be removed immediately by the UnitManager
        game.LootUI.update(delta);
        game.GeneratorManager.update(delta);
        game.BattleManager.update(delta);
        game.UnitManager.update(delta);
        game.ParticleManager.update(delta);
        game.TextManager.update(delta);

        ctx.save();
        game.Camera.scaleAndTranslate(ctx);

        currentMap.draw(ctx);
        ctx.restore();
        ctx.save();
        game.Camera.scaleAndTranslate(ctx);

        game.GeneratorManager.draw(ctx);
        game.UnitManager.draw(ctx);
        game.BattleManager.draw(ctx);
        game.ParticleManager.draw(ctx);

        // Fog will cover everything drawn before this line of code (e.g. units,
        // projectiles).
        currentMap.drawFog(ctx);
        game.TextManager.draw(ctx);

        ctx.restore();
    }

    function doneLoadingEverything() {
        lastUpdate = Date.now();

        // This will wipe out the timer (if it's non-null)
        clearInterval(gameloopId);
        gameloopId = setInterval(gameLoop, game.msPerFrame);
    }

}());
