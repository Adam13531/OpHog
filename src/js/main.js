( function() {

    // Global
    tileSize = 32;

    var gameloopId;
    var screenWidth;
    var screenHeight;

    var slotImage = new Image();

    var ctxZoom = 1;
    
    var pinchZoomStart;
    var ctxOrigZoom;

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
        $('#createPlayer').click(function() {
            var newUnit = new game.Unit(1,9,0,true);
            game.UnitManager.addUnit(newUnit);
        });
        $('#createEnemy').click(function() {
            var newUnit = new game.Unit(24,9,0,false);
            game.UnitManager.addUnit(newUnit);
        });

        var $canvas = $('#canvas');
        
        // Look at https://github.com/EightMedia/hammer.js/blob/master/hammer.js to figure out what's in the event.
        // You get scale, rotation, distance, etc.
        // 
        // Pretty sure you should only call this once. Calling it multiple times will result in multiple events being fired.
        $canvas.hammer({prevent_default:true});
        
        $canvas.bind('transformstart', function(event) {
           pinchZoomStart = event.scale; 
           ctxOrigZoom = ctxZoom;
           
        });
        
        $canvas.bind('transform', function(event) {
            ctxZoom = ctxOrigZoom + (event.scale - pinchZoomStart) / 2.0;
            if ( ctxZoom < 1.0 ) 
            {
                ctxZoom = 1.0;
            }
            
            if (ctxZoom > 10.0 )
            {
                ctxZoom = 10.0
            }
        });
        $canvas.bind('transformend', function(event) {
        });
        $canvas.bind('dragstart', function(event) {
                // TODO: this is a global now. It shouldn't be a global.
                scrollPos = {
                    x : event.pageX,
                    y : event.pageY
                };

        });
        $canvas.bind('drag', function(event) {
            // Drag code goes here
        });

        $canvas.mousewheel(function(event, delta) {
            if (delta > 0 ) {
                ctxZoom+=.5;
            } else if ( ctxZoom > 1 ) {
                ctxZoom -= .5;
            }

            event.originalEvent.preventDefault();
        });

		// Commenting this out for now due to our ghetto branch structure
        // game.Inventory.setupUI();
        // game.UnitPlacementUI.setupUI();
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
                var newUnit = new game.Unit(1,9,unitType,true);
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
                var newUnit = new game.Unit(24,9,enemyUnitType,false);
                game.UnitManager.addUnit(newUnit);
            }

            if (evt.keyCode == game.Key.DOM_VK_9) {
                for (var i = 0; i < 20; i++) {
                    var newUnit = new game.Unit(1,9,0,true);
                    game.UnitManager.addUnit(newUnit);
                };
            }
            if (evt.keyCode == game.Key.DOM_VK_0) {
                for (var i = 0; i < 20; i++) {
                    var newUnit = new game.Unit(24,9,0,false);
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

        // Draw a solid background on the canvas in case anything is transparent
        // This should eventually be unnecessary - we should instead draw a
        // parallax background or not have a transparent map.
        ctx.fillStyle = '#373737';
        ctx.fillRect(0, 0, screenWidth, screenHeight);

        ctx.save();
        ctx.scale(ctxZoom, ctxZoom);

        // 25x19      
        var mapTiles = new Array(
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,67,88,88,88,88,88,88,88,88,88,88,88,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,67,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,93,
            5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,
            93,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,
            93,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,67,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 
            );
        var numCols = 25;
        var numRows = mapTiles.length / numCols;

        for (var y = 0; y < numRows; y++) {
            for (var x = 0; x < numCols; x++) {
                var graphic = mapTiles[y * numCols + x];
                envSheet.drawSprite(ctx, graphic, 0,0);
                ctx.translate(tileSize, 0);
            }
            ctx.translate(-tileSize * numCols, tileSize);
        }

        ctx.restore();
        ctx.save();

        game.UnitManager.update(delta);
        game.UnitManager.draw(ctx);

        game.BattleManager.update(delta);

        // game.BattleManager.debugDrawBattleBackground(ctx);
        game.BattleManager.draw(ctx);

        game.ParticleManager.update(delta);
        game.ParticleManager.draw(ctx);

        game.TextManager.update(delta);
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
