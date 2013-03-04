( function() {

    // Global
    tileSize = 32;

    // The character sprite sheet (global)
    charSheet = null;

    var gameloopId;
    var screenWidth;
    var screenHeight;

    var slotImage = new Image();

    // This is global so that units can summon more units in a battle.
    gameUnits = new Array();

    var charX = 0;
    var charY = 0;

    var ctxZoom = 1;
    
    var pinchZoomStart;
    var ctxOrigZoom;


    // Time (in MS) of the last update.
    var lastUpdate;

    // The environment sprite sheet
    var envSheet;

    var particleSystem;

    // Get a reference to the canvas
    var ctx = null;

    // PgUp(33), PgDn(34), End(35), Home(36), Left(37), Up(38), Right(39), Down(40)
    var browserKeysToStop = new Array(33, 34, 35, 36, 37, 38, 39, 40);

    var angle = 0;
    var scale = 1.0;
    var scaleDir = 1;
    var graphicToUse = 0;

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

        envSheet = new game.SpriteSheet('img/env_32.png', tileSize, function() {
            objSheet = new game.SpriteSheet('img/obj_32.png', tileSize, function() {
                charSheet = new game.SpriteSheet('img/char_32.png', tileSize, doneLoadingEverything);
            });
        });

        particleSystem = new game.ParticleSystem(400,300);
        particleSystem.spawnedAll = true;
    }

    function doneLoadingImages() {
        makeUI();
    }

    function loadImages() {
        slotImage.src = 'img/archer.png';
        slotImage.onload = doneLoadingImages;
    }

    function makeUI() {
        for (var i = 0; i < 32; i++) {
            game.Inventory.addSlot(new game.Slot('#equippable-item-scroll-pane', window.game.SlotTypes.EQUIP, game.Inventory.slots.length));
        };
        for (var i = 0; i < 32; i++) {
            game.Inventory.addSlot(new game.Slot('#usable-item-scroll-pane', window.game.SlotTypes.USABLE, game.Inventory.slots.length));
        };

        $('#createPlayer').click(function() {
            var newUnit = new game.Unit(1,9,0,true);
            gameUnits.push(newUnit);
        });
        $('#createEnemy').click(function() {
            var newUnit = new game.Unit(24,9,0,false);
            gameUnits.push(newUnit);
        });

        var $canvas = $('#canvas');


        // $canvas.hammer().bind('tap', function(e) {
            // $('#testeroo').text('hhhhhhh');
        // });
        
        // $canvas.hammer().bind('tap', function(event) {
//  
            // var output = '';
            // for (property in event) {
                // output += property + ': ' + event[property] + '; ';
            // }
            // alert(output); 
        // });
        
        // Look at https://github.com/EightMedia/hammer.js/blob/master/hammer.js to figure out what's in the event.
        // You get scale, rotation, distance, etc.
        // 
        // 
        // 
        // Pretty sure you should only call this once. Calling it multiple times will result in multiple events being fired.
        $canvas.hammer({prevent_default:true});
        
        $canvas.bind('transformstart', function(event) {
           pinchZoomStart = event.scale; 
           ctxOrigZoom = ctxZoom;
           
        });
        
        $canvas.bind('transform', function(event) {

            // var output = '';
            // for (property in event) {
                // output += property + ': ' + event[property] + '; ';
            // }
            // alert(output); 
            ctxZoom = ctxOrigZoom + (event.scale - pinchZoomStart) / 2.0;
            if ( ctxZoom < 1.0 ) 
            {
                ctxZoom = 1.0;
            }
            
            if (ctxZoom > 10.0 )
            {
                ctxZoom = 10.0
            }
            // $('#testeroo').text('posx: ' + event.position.x);
            // $('#testeroo2').text('posy: ' + event.position.y);
            // $('#testeroo3').text('scale: ' + event.scale);
            // $('#testeroo4').text('dstx: ' + event.distanceX);
            // $('#testeroo5').text('dist: ' + event.distance);
            
        });
        $canvas.bind('transformend', function(event) {
        });
        $canvas.bind('dragstart', function(event) {
                // TODO: this is a global now. It shouldn't be a global.
                scrollPos = {
                    x : event.pageX,
                    y : event.pageY,
                    charX: charX,
                    charY: charY
                };

        });
        $canvas.bind('drag', function(event) {

                
                // var mouseXDifference = scrollPos.x - event.pageX;
                // var mouseYDifference = scrollPos.y - event.pageY;

                charX = scrollPos.charX + event.distanceX;
                charY = scrollPos.charY + event.distanceY;

                // // The mouse is the desired X
                // var distX = event.originalEvent.pageX - 400;
                // var distY = event.originalEvent.pageY - 300;
                // var angle = Math.atan2(distY, distX);
                // $('#testeroo2').text("Angle: " + angle);
                // $('#testeroo3').text("diff: (" + distX + ", " + distY + ")");
                
                // $('#testeroo').text('posx: ' + event.distanceX);
                // $('#testeroo2').text('charx: ' + scrollPos.charX);
        });

        
        // $canvas.bind('pinch',function(e,o)
            // {
//                     
                // alert("hi" + e + o);
            // });
        // $('#testeroo').bind('pinch',function(e,o)
            // {
                // alert("hi" + e + o);
            // });
        // $canvas.bind('swipeone',function(e,o)
            // {
                // alert("hi" + e + o);
                // e.stopPropagation();
                // e.originalEvent.stopPropagation();
            // });
//                 

        $canvas.mousewheel(function(event, delta) {
            if (delta > 0 ) {
                ctxZoom+=.5;
            } else if ( ctxZoom > 1 ) {
                ctxZoom -= .5;
            }
        });

        var width = $canvas.width();
        var canvasPos = $canvas.position();
        // canvasPos.top -= 100;
        // canvasPos.left -= 400;

        $('#equippable-item-scroll-pane').css({
            position : 'absolute',
            top : (canvasPos.top + 350) + 'px',
            left : (canvasPos.left + width + 175) + 'px'
        });

        var equipPanePos = $('#equippable-item-scroll-pane').position();
        var equipPaneWidth = $('#equippable-item-scroll-pane').width();
        var equipPaneHeight = $('#equippable-item-scroll-pane').height();
        $('#usable-item-scroll-pane').css({
            position : 'absolute',
            top : (equipPanePos.top) + 'px',
            left : (equipPanePos.left + equipPaneWidth + 5) + 'px'
        });
        $('#item-description').css({
            position : 'absolute',
            top : (equipPanePos.top + equipPaneHeight + 5) + 'px',
            left : (canvasPos.left + width + 5) + 'px'
        });

        $('#scrollValues').css({
            position : 'absolute',
            top : (canvasPos.top + 300) + 'px',
            left : (canvasPos.left + width + 5) + 'px'
        });

        $('#scrollValues2').css({
            position : 'absolute',
            top : (canvasPos.top + 300) + 'px',
            left : (canvasPos.left + width + 50) + 'px'
        });

        $('#war-section').append('<img src="img/img_trans.png" class="' + 'char-sprite war32-png' + '"/>');
        $('#war-section').css({
           position: 'absolute',
           top: (equipPanePos.top) + 'px',
           left: (canvasPos.left + width + 5) + 'px'
        });
        
        var warPos = $('#war-section').position();
        var warHeight = $('#war-section').height();
        $('#wiz-section').append('<img src="img/img_trans.png" class="' + 'char-sprite wiz32-png' + '"/>');
        $('#wiz-section').css({
           position: 'absolute',
           top: (warPos.top + warHeight + 5) + 'px',
           left: (warPos.left) + 'px'
        });
        
        var wizPos = $('#wiz-section').position();
        var wizHeight = $('#wiz-section').height();
        $('#arch-section').append('<img src="img/img_trans.png" class="' + 'char-sprite arch32-png' + '"/>');
        $('#arch-section').css({
           position: 'absolute',
           top: (wizPos.top + wizHeight + 5) + 'px',
           left: (wizPos.left) + 'px'
        });
        
        for (var i = 0; i < 2; i++) {
            game.Inventory.addSlot(new game.Slot('#war-section', window.game.SlotTypes.WAR, game.Inventory.slots.length));
        };
        for (var i = 0; i < 2; i++) {
            game.Inventory.addSlot(new game.Slot('#wiz-section', window.game.SlotTypes.WIZ, game.Inventory.slots.length));
        };
        for (var i = 0; i < 2; i++) {
            game.Inventory.addSlot(new game.Slot('#arch-section', window.game.SlotTypes.ARCH, game.Inventory.slots.length));
        };


        window.ui.setSlider($('#equippable-item-scroll-pane'));
        window.ui.setSlider($('#usable-item-scroll-pane'));


        $('#item-description').html('<h1>Click here to close the whole screen.</h1>');
        $('#item-description').click(function() {
            if (window.game.Inventory.getSelectedSlot() == null )
            {
                $('#inventory-screen').hide();
            }
        });
    }

    function initSettings() {
        ctx = $('#canvas')[0].getContext('2d');

        $('#container').mousemove(function(e) {
            // I'd need to subtract the canvas X/Y here since these are in page coordinates.
            // charX = e.pageX;
            // charY = e.pageY;
        });

        var canvasPos = $('#canvas').position();

        //Calculate screen height and width
        screenWidth = parseInt($('#canvas').attr('width'));
        screenHeight = parseInt($('#canvas').attr('height'));

        charX = screenWidth / 2;
        charY = screenHeight / 2;

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
                gameUnits.push(newUnit);
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
                gameUnits.push(newUnit);
            }


            if (evt.keyCode == game.Key.DOM_VK_9) {
                for (var i = 0; i < 20; i++) {
                    var newUnit = new game.Unit(1,9,0,true);
                    gameUnits.push(newUnit);
                };
            }
            if (evt.keyCode == game.Key.DOM_VK_0) {
                for (var i = 0; i < 20; i++) {
                    var newUnit = new game.Unit(24,9,0,false);
                    gameUnits.push(newUnit);
                };
            }

            // 't' for text
            if (evt.keyCode == game.Key.DOM_VK_T) {
                var textObj = new game.TextObj(300,200,"Hello world!");
                game.TextManager.addTextObj(textObj);
            }

            keysDown[evt.keyCode] = false;
        });
    }

    function gameLoop() {
        // Get the time that passed since the last update.
        var delta = Date.now() - lastUpdate;
        lastUpdate = Date.now();

        // Slow down the whole game (debug)
        // delta /= 5;

        var deltaAsSec = delta / 1000;

        // 37: left
        // 38: up
        // 39: right
        // 40: down
        if (keysDown[game.Key.DOM_VK_RIGHT]) {
            charX += speed * deltaAsSec;
        } else if (keysDown[game.Key.DOM_VK_LEFT]) {
            charX -= speed * deltaAsSec;
        }

        if (keysDown[game.Key.DOM_VK_UP]) {
            charY -= speed * deltaAsSec;
        } else if (keysDown[game.Key.DOM_VK_DOWN]) {
            charY += speed * deltaAsSec;
        }

        // When you press 'space', allow the particle system to spawn more
        if (keysDown[game.Key.DOM_VK_SPACE]) {
            particleSystem.spawnedAll = false;
            particleSystem.x = charX;
            particleSystem.y = charY;
        }

        // Sets the canvas to transparent
        ctx.clearRect(0, 0, screenWidth, screenHeight);

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
        ctx.translate(charX, charY);
        var halfTile = charSheet.tileSize / 2;

        angle += .1;

        if (scaleDir == 1) {
            scale += .02;
            if (scale > 8) {
                scaleDir = 0;
            }
        } else {
            scale -= .02;
            if (scale < .5) {
                scaleDir = 1;
            }
        }

        graphicToUse += .01;
        // graphicToUse = 2;
        // angle = 3;
        // angle = 0;
        // scale = 6;
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;

        // ctx.rotate(angle);
        // ctx.scale(scale, scale);

        // charSheet.drawSprite(ctx, Math.floor(graphicToUse), -halfTile, -halfTile);

        ctx.restore();
        // charSheet.drawSprite(ctx, 0, 400 - halfTile, 300 - halfTile);
        charSheet.drawSprite(ctx, 0, charX, charY);

        ctx.save();
        particleSystem.update(delta);
        particleSystem.draw(ctx);

        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();


        ctx.save();
        $('#testeroo').text(gameUnits.length);
        for (var i = 0; i < gameUnits.length; i++) {
            // Remove units that died in battle
            if (gameUnits[i].removeFromGame) {
                gameUnits.splice(i, 1);
                i--;
                continue;
            }

            gameUnits[i].update(delta);
            gameUnits[i].draw(ctx);
        };

        game.BattleManager.checkForBattles(gameUnits);
        game.BattleManager.update(delta);

        game.BattleManager.debugDrawBattleBackground(ctx);
        game.BattleManager.draw(ctx);

        game.ParticleManager.update(delta);
        game.ParticleManager.draw(ctx);

        game.TextManager.update(delta);
        game.TextManager.draw(ctx);

        ctx.restore();

        /*
        ctx.save();
        var font = "120px Futura, Helvetica, sans-serif"
        ctx.font = font;
        var text = "Hello world!";
        var blur = 5;
        var width = ctx.measureText(text).width + blur * 2;

        var gradient = ctx.createLinearGradient(0, 0, 630, 0);
        gradient.addColorStop(0, "rgba(255, 0, 0, 1)");
        gradient.addColorStop(0.15, "rgba(255, 255, 0, 1)");
        gradient.addColorStop(0.3, "rgba(0, 255, 0, 1)");
        gradient.addColorStop(0.5, "rgba(0, 255, 255, 1)");
        gradient.addColorStop(0.65, "rgba(0, 0, 255, 1)");
        gradient.addColorStop(0.8, "rgba(255, 0, 255, 1)");
        gradient.addColorStop(1, "rgba(255, 0, 0, 1)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 630, 120);

        ctx.textBaseline = "top";
        ctx.shadowColor = "#fff";
        ctx.shadowOffsetX = width;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = blur;
        ctx.fillStyle = "#f00";
        ctx.fillText(text, width * -1, 0);
        ctx.restore();
        */

    }

    function doneLoadingEverything() {
        lastUpdate = Date.now();

        // This will wipe out the timer (if it's non-null)
        clearInterval(gameloopId);
        gameloopId = setInterval(gameLoop, 15);
        // gameloopId = setInterval(gameLoop, 50);
    }

}());
