( function() {

    // Global
    tileSize = 32;

    var gameloopId;

    var slotImage = new Image();
    
    var pinchZoomStart;
    var ctxOrigZoom;

    /**
     * The map we're looking at right now.
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
        $settingsButton.button({
              icons: {
                primary: 'ui-icon-gear'
              },
              text: false
          });


        $showInventory.button();
        $showInventory.click(function() {
            $settingsDialog.dialog('close');
            $('#inventory-screen').dialog('open');

            // See the comment for setScrollbars to see why this is needed.
            game.InventoryUI.setScrollbars();
        });

        $showUnitPlacement.button(); // Turns the button into a JQuery UI button
        $showUnitPlacement.click(function() {
            $settingsDialog.dialog('close');
            $('#buyingScreenContainer').dialog('open');
        });

        // Handle all the events from a user clicking/tapping the canvas
        $canvas.click(function(event) {

            // Check to see if the user tapped a spawner
            var tileX = Math.floor(event.offsetX / tileSize);
            var tileY = Math.floor(event.offsetY / tileSize);
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

        $('#createPlayer').click(function() {
            var newUnit = new game.Unit(0,true);
            newUnit.placeUnit(1, 9);
            game.UnitManager.addUnit(newUnit);
        });
        $('#createEnemy').click(function() {
            var newUnit = new game.Unit(0,false);
            newUnit.placeUnit(24, 9);
            game.UnitManager.addUnit(newUnit);
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
    }

    function initSettings() {
        ctx = $('#canvas')[0].getContext('2d');

        var canvasPos = $('#canvas').position();

        //Calculate screen height and width
        screenWidth = parseInt($('#canvas').attr('width'));
        screenHeight = parseInt($('#canvas').attr('height'));

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

        });

        $(document).keyup(function(evt) {
            var unitType = null;
            if (evt.keyCode == game.Key.DOM_VK_1) {
                unitType = 0;
            }
            if (evt.keyCode == game.Key.DOM_VK_2) {
                unitType = window.game.twoByOneUnit;
            }
            if (evt.keyCode == game.Key.DOM_VK_3) {
                unitType = window.game.oneByTwoUnit;
            }
            if (evt.keyCode == game.Key.DOM_VK_4) {
                unitType = window.game.twoByTwoUnit;
            }
            if ( unitType != null ) {
                var newUnit = new game.Unit(unitType,true);
                newUnit.placeUnit(1, 9);
                game.UnitManager.addUnit(newUnit);
            }

            var enemyUnitType = null;
            if (evt.keyCode == game.Key.DOM_VK_5) {
                enemyUnitType = 0;
            }
            if (evt.keyCode == game.Key.DOM_VK_6) {
                enemyUnitType = window.game.twoByOneUnit;
            }
            if (evt.keyCode == game.Key.DOM_VK_7) {
                enemyUnitType = window.game.oneByTwoUnit;
            }
            if (evt.keyCode == game.Key.DOM_VK_8) {
                enemyUnitType = window.game.twoByTwoUnit;
            }
            if ( enemyUnitType != null ) {
                var newUnit = new game.Unit(enemyUnitType,false);
                newUnit.placeUnit(24,9);
                game.UnitManager.addUnit(newUnit);
            }

            if (evt.keyCode == game.Key.DOM_VK_9) {
                for (var i = 0; i < 20; i++) {
                    var newUnit = new game.Unit(0,true);
                    newUnit.placeUnit(1,9);
                    game.UnitManager.addUnit(newUnit);
                };
            }
            if (evt.keyCode == game.Key.DOM_VK_0) {
                for (var i = 0; i < 20; i++) {
                    var newUnit = new game.Unit(0,false);
                    newUnit.placeUnit(24,9);
                    game.UnitManager.addUnit(newUnit);
                };
            }

            keysDown[evt.keyCode] = false;
        });
    }

    function gameLoop() {
        // Get the time that passed since the last update.
        var delta = Date.now() - lastUpdate;
        lastUpdate = Date.now();

        var deltaAsSec = delta / 1000;

        game.Camera.handleInput(keysDown, delta);

        // Draw a solid background on the canvas in case anything is transparent
        // This should eventually be unnecessary - we should instead draw a
        // parallax background or not have a transparent map.
        ctx.fillStyle = '#373737';
        ctx.fillRect(0, 0, screenWidth, screenHeight);

        ctx.save();
        game.Camera.scaleAndTranslate(ctx);

        currentMap.draw(ctx);
        game.UnitManager.update(delta);
        game.BattleManager.update(delta);
        game.ParticleManager.update(delta);
        game.TextManager.update(delta);

        ctx.restore();
        ctx.save();
        game.Camera.scaleAndTranslate(ctx);

        game.UnitManager.draw(ctx);
        game.BattleManager.draw(ctx);
        game.ParticleManager.draw(ctx);
        game.TextManager.draw(ctx);

        ctx.restore();
    }

    function doneLoadingEverything() {
        lastUpdate = Date.now();

        // This will wipe out the timer (if it's non-null)
        clearInterval(gameloopId);
        gameloopId = setInterval(gameLoop, 15);
    }

}());
