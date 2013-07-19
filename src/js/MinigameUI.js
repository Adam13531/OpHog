( function() {

    /**
     * Each minigame div's ID will be prefixed with this string.
     * @type {String}
     */
    window.game.MINIGAME_DIV_ID_PREFIX = 'minigame';

    /**
     * This is simply an incrementing ID so that we always have a way to
     * uniquely identify the DOM elements in a minigame.
     * @type {Number}
     */
    window.game.domID = 0;

    window.game.MinigameUI = {

        numDifficulties: 5,

        /**
         * This contains all of the data for the minigames so that we know which
         * enemies to spawn when you click a row. It's not stored in a smart way
         * right now. The number of entries in this array is equal to
         * numDifficulties, and each entry is an array whose elements are
         * [game.UnitType, Number] (the enemy to be spawned and the number to
         * spawn).
         *
         * The first entry in this array is the hardest difficulty (i.e. the top
         * row).
         * @type {Array:Array}
         */
        minigameData: [],

        /**
         * Sets up the entire quest UI.
         */
        setupUI: function() {
            $('#minigame-ui').dialog({
                autoOpen: false, 

                // Set a reasonable width
                width:400,

                height:425,
                resizable:false,

                // Wrap the dialog in a span so that it gets themed correctly.
                appendTo:"#minigameUIThemeSpan",

                // Fade in very quickly
                show: {
                    effect: 'fade',
                    duration: 150
                },

                // Position at the center of the canvas
                position: {
                    my: 'center',
                    at: 'center',
                    of: ('#canvas')
                },
                
            });

            var heightPercent = Math.floor(100 / this.numDifficulties) - 2;

            // Set up each minigame's data. The first is at the top (hardest),
            // fifth is at the bottom (easiest).
            var snake = game.UnitType.SNAKE;
            var scorpion = game.UnitType.SCORPION;
            var spider = game.UnitType.SPIDER;
            var orc = game.UnitType.ORC;
            var firstMinigame  = [[snake,10], [scorpion,10], [spider,10], [orc,10]];
            var secondMinigame = [[snake,10], [scorpion,10], [spider,10]];
            var thirdMinigame  = [[snake,10], [scorpion,10]];
            var fourthMinigame = [[snake,5], [scorpion,5]];
            var fifthMinigame  = [[snake,5]];

            this.minigameData = [firstMinigame, secondMinigame, thirdMinigame, fourthMinigame, fifthMinigame];

            for (var i = 0; i < this.numDifficulties; i++) {
                var divID = game.MINIGAME_DIV_ID_PREFIX + i;
                $('#minigame-ui').append('<div id="' + divID + '"></div>');

                // The css to set, which we conditionally add to
                var cssToSet = {
                    'border':'2px solid',
                    'border-color':'#004400',
                    'height':heightPercent + '%'
                };

                // Don't add a margin-bottom to the last minigame since it's
                // already at the bottom of the UI
                if ( i < this.numDifficulties - 1 ) {
                    cssToSet['margin-bottom'] = '2px';
                }

                // Populate the UI based on the minigame
                var thisMinigameData = this.minigameData[i];

                for (var j = 0; j < thisMinigameData.length; j++) {
                    var enemyData = thisMinigameData[j][0];
                    var quantity = thisMinigameData[j][1];
                    this.addIcon(i, charSheet.getSpriteDataFromUnitData(enemyData, true), quantity);
                };

                // Note: the money given isn't actually granted to the player
                // yet.
                var moneyGiven = (10 - i) * (5 - i) * 500;
                this.addIcon(i, objSheet.getSpriteDataFromSingleIndex(0, true), moneyGiven);

                $('#' + divID).css(cssToSet);
                $('#' + divID).click(this.getStartMinigameFunction(i));
            };
        },

        /**
         * This simply encloses minigameID in the function that's returned.
         * @param  {Number} minigameID - the row of the minigame. This is in the
         * range [0, numDifficulties).
         * @return {Function} - the "click" function for the minigame.
         */
        getStartMinigameFunction: function(minigameID) {
            var minigameUI = this;
            return function() {
                game.GameStateManager.enterMinigameGameplay();
                minigameUI.startMinigame(minigameID);
            };
        },

        /**
         * This actually starts the minigame by placing the players/enemies.
         * @param  {Number} minigameID - the row of the minigame. This is in the
         * range [0, numDifficulties).
         */
        startMinigame: function(minigameID) {
            var thisMinigameData = this.minigameData[minigameID];

            // For now, the battle takes place in the middle of the map
            var tileX = Math.floor(currentMap.numCols / 2);
            var tileY = Math.floor(currentMap.numRows / 2);

            // Move camera to middle of the map
            game.Camera.panInstantlyTo(tileX * tileSize, tileY * tileSize);

            // Spawn all of your units
            game.UnitManager.placeAllPlayerUnits(tileX, tileY, game.MovementAI.FOLLOW_PATH);

            // Spawn the enemies
            var enemyLevel = 5;
            for (var i = 0; i < thisMinigameData.length; i++) {
                var enemyData = thisMinigameData[i][0];
                var quantity = thisMinigameData[i][1];
                for (var j = 0; j < quantity; j++) {
                    var newUnit = new game.Unit(enemyData.id, game.PlayerFlags.ENEMY, enemyLevel);
                    newUnit.placeUnit(tileX, tileY, game.MovementAI.FOLLOW_PATH);
                    game.UnitManager.addUnit(newUnit);
                }
            };

            game.MinigameUI.hide();
        },
        
        /**
         * Adds the specified image data as an icon in this minigame.
         * @param  {Number} minigameID - the row of the minigame. This is in the
         * range [0, numDifficulties).
         * @param  {String} imageData - base64-encoded image data
         * @param  {Number} quantity  - the number to display on this icon
         */
        addIcon: function(minigameID, imageData, quantity) {
            var width = 64;
            var height = 64;

            // We need a way to uniquely identify these spans, so we use
            // game.domID, which always increments.
            var thisDomID = game.domID++;
            var divID = game.MINIGAME_DIV_ID_PREFIX + minigameID;
            var firstSpanID = 'minigame_img' + minigameID + 'e' + thisDomID;
            var secondSpanID = 'minigame_text' + minigameID + 'e' + thisDomID;
            $('#' + divID).append('<span id="' + firstSpanID + '"><span id="' + secondSpanID + '"></span></span>');
            var $firstSpan = $('#' + firstSpanID);
            var $secondSpan = $('#' + secondSpanID);

            $firstSpan.css({
                'background':'url(' + imageData + ')',
                'display':'inline-block',
                'width': width + 'px',
                'height': height + 'px',
                'margin-right':'1px'
            });

            $secondSpan.css({
                'color': 'white',
                'font-size': '.95em',
                'vertical-align': 'bottom',
                'position': 'relative',
                'left': '35px',
                'top': '40px'
            })

            $secondSpan.html('<b>x' + quantity + '</b>');
            $secondSpan.addClass('outline-font');
        },

        show: function() {
            $('#minigame-ui').dialog('open');
        },
        hide: function() {
            $('#minigame-ui').dialog('close');
        }

    };
}()); 