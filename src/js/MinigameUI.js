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

        /**
         * The number of "options" you have in the minigame. For now, this is
         * how many divs will show with choices of enemies.
         * @type {Number}
         */
        numDifficulties: 5,

        /**
         * This contains all of the data for the minigames so that we know what
         * to do when you click a row. The number of entries in this array is
         * equal to numDifficulties.
         *
         * The first entry in this array is the hardest difficulty (i.e. the top
         * row).
         * @type {Array:MinigameData}
         */
        minigameData: [],

        /**
         * The minigame that you've selected to play. This corresponds to one of
         * the entries in minigameData.
         * @type {game.MinigameData}
         */
        selectedMinigame: null,

        /**
         * Sets up the entire minigame UI.
         */
        setupUI: function() {
            var $minigameUI = $('#minigame-ui');
            $minigameUI.dialog({
                autoOpen: false, 

                // Prevent the user from closing this by pressing escape.
                closeOnEscape: false,

                /**
                 * We only override this function so that we can prevent the
                 * close button from showing up. The user shouldn't be closing
                 * this UI.
                 */
                open: function(event, ui) {
                    // Hide the 'close' button on only this dialog.
                    $('#minigameUIThemeSpan').find('.ui-dialog-titlebar-close').hide();
                },

                // Set a reasonable width
                width:400,

                resizable:false,

                // Wrap the dialog in a span so that it gets themed correctly.
                appendTo:"#minigameUIThemeSpan",

                // Fade in very quickly
                show: {
                    effect: 'fade',
                    duration: game.DIALOG_SHOW_MS
                },

                // Position at the center of the canvas
                position: {
                    my: 'center',
                    at: 'center',
                    of: ('#canvas')
                },
                
            });

            game.DialogManager.addDialog($minigameUI);
        },

        /**
         * Figures out the minigame data for each choice in the UI.
         */
        computeMinigameData: function() {

            this.minigameData = [];
            var spread = game.currentMap.nodeOfMap.minigame.spread;

            if ( spread == game.MinigameEnemySpread.RANDOM ) {
                this.computeMinigameDataRandomSpread();
            }
        },

        /**
         * Randomly chooses enemies based on their relative weights.
         */
        computeMinigameDataRandomSpread: function() {
            // Data from the current map node
            var nodeOfMap = game.currentMap.nodeOfMap;
            var nodeData = nodeOfMap.minigame;
            var baseCoins = nodeData.baseCoins;
            var coinsPerLevel = nodeData.coinsPerLevel;

            // Start with the highest difficulty
            for (var i = this.numDifficulties - 1; i >= 0; i--) {

                // Get a list of all possible enemies in the map
                var possibleEnemies = [];
                for (var j = 0; j < nodeOfMap.enemies.length; j++) {
                    possibleEnemies.push(nodeOfMap.enemies[j]);
                };

                // Make sure we don't choose too many types.
                var numTypesToChoose = Math.min(possibleEnemies.length, Math.min(game.MAXIMUM_ENEMY_TYPES_IN_MINIGAME, this.numDifficulties));

                // These are the types of enemies that will actually show up.
                // It's an Array of enemies as they show up in the map node.
                var types = [];
                types = game.util.getElementsFromArray(possibleEnemies, numTypesToChoose, true);

                // Now figure out how many of each type we want. The key is an
                // enemy's ID, the value is the quantity of that enemy that will
                // show up.
                var enemiesAndQuantities = {};

                for (var j = 0; j < types.length; j++) {
                    enemiesAndQuantities[types[j].id] = 0;
                };

                // Figure out how many enemies will show up.
                var minEnemies = (i + 1) * 5;
                var maxEnemies = (i + 1) * 7;
                var numTotalEnemies = game.util.randomInteger(minEnemies, maxEnemies);

                // Make sure there's at least one enemy.
                numTotalEnemies = Math.max(1, numTotalEnemies);

                // Generate that many enemies
                for (var j = numTotalEnemies - 1; j >= 0; j--) {
                    var randomyEnemy = game.util.randomFromWeights(types);
                    enemiesAndQuantities[randomyEnemy.id]++;
                };

                // The minigame data takes the enemies as an array, so we
                // convert from a dict to an array here.
                var enemiesAsArray = [];
                for (var enemyID in enemiesAndQuantities) {
                    var quantity = enemiesAndQuantities[enemyID];
                    if ( quantity <= 0 ) continue;

                    // We only have the enemy's ID at this point, but we need
                    // the original data from the map node, so we go through and
                    // find the enemy by its ID. This is the reason why you're
                    // not allowed to have multiple enemies with the same ID in
                    // a map node. Search tag: [minigame_no_dupes].
                    var enemy = null;
                    for (var j = 0; j < types.length; j++) {
                        if ( types[j].id == enemyID ) {
                            enemy = types[j];
                            break;
                        }
                    };

                    enemiesAsArray.push(new game.PossibleEnemy(enemyID, enemy.relativeWeight, enemy.minLevel, enemy.maxLevel, quantity));
                };

                this.minigameData.push(new game.MinigameData(enemiesAsArray, baseCoins + coinsPerLevel * i));
            };
        },

        /**
         * This sets up the minigame divs according to the current map.
         */
        populateUI: function() {
            // Remove all existing divs
            $('#minigame-ui').empty();

            this.computeMinigameData();

            var heightPercent = Math.floor(100 / this.numDifficulties) - 2;
            this.selectedMinigame = null;

            for (var i = 0; i < this.numDifficulties; i++) {
                var divID = game.MINIGAME_DIV_ID_PREFIX + i;
                $('#minigame-ui').append('<div id="' + divID + '"></div>');

                // The css to set, which we conditionally add to
                var cssToSet = {
                    'border':'2px solid',
                    'border-color':'#004400',
                    'height':'64px'
                };

                cssToSet['margin-bottom'] = '2px';

                // Populate the UI based on the minigame
                var minigameData = this.minigameData[i];
                var enemies = minigameData.enemies;

                for (var j = 0; j < enemies.length; j++) {
                    var enemy = enemies[j];
                    var enemyData = game.GetUnitDataFromID(enemy.enemyID);
                    var quantity = enemy.quantity;
                    this.addIcon(i, charSheet.getSpriteDataFromUnitData(enemyData, true), quantity);
                };

                // Note: the money given isn't actually granted to the player
                // yet.
                this.addIcon(i, objSheet.getSpriteDataFromSingleIndex(0, true), minigameData.moneyGiven);

                // CSS properties for the money image and text that shows the
                // reward amount.
                var moneyCSSOptions = {
                    'float':'right'
                };

                // Align the award money to the right
                //
                // game.domID always holds a new ID that can be used, so subtract 
                // 1 from it to get the one that was just created for the money
                // span.
                var moneyDomID = game.domID-1;
                var moneySpanImgID = 'minigame_img' + i + 'e' + moneyDomID;
                var $moneyImgSpan = $('#' + moneySpanImgID);
                $moneyImgSpan.css(moneyCSSOptions);

                var moneySpanTextID = 'minigame_text' + i + 'e' + moneyDomID;
                var $moneyTextSpan = $('#' + moneySpanTextID);
                // Override any previous specification of "left" to make sure
                // the money amount doesn't go outside of the div
                moneyCSSOptions['left'] = '0px';
                $moneyTextSpan.css(moneyCSSOptions);

                $('#' + divID).css(cssToSet);
                $('#' + divID).click(this.getStartMinigameFunction(i));
            };

            this.addSkipButton();
        },

        /**
         * Adds the "skip minigame" button to the UI.
         */
        addSkipButton: function() {
            $('#minigame-ui').append('<div id="minigame-cancel-div"></div>');
            $('#minigame-cancel-div').css({
                // Despite the 2px margin that's on the last minigame div, we
                // still want more padding.
                'margin-top': '4px',

                // The next two properties will make sure the button is centered
                // at the bottom.
                'width': '100%',
                'text-align': 'center'
            });

            $('#minigame-cancel-div').append('<button id="minigame-cancel-button">'+ 
                                                'Skip minigame' +
                                                '</button>');
            $('#minigame-cancel-button').button();

            $('#minigame-cancel-button').click(function(minigameUI) {
                return function() {
                    game.GameStateManager.enterOverworldState();
                }
            }(this));
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
         * Call this when you've won the minigame that you're playing.
         */
        wonMinigame: function() {
            moneyGiven = this.selectedMinigame.moneyGiven;

            game.Player.modifyCoins(moneyGiven);

            var coinString = '+' + moneyGiven + ' coin' + (moneyGiven != 1 ? 's' : '');
            var textObj = new game.TextObj(game.canvasWidth / 2, game.canvasHeight / 2 + 40, coinString, true, '#0f0', false);

            game.TextManager.addTextObj(textObj);
        },

        /**
         * This actually starts the minigame by placing the players/enemies.
         * @param  {Number} minigameID - the row of the minigame. This is in the
         * range [0, numDifficulties).
         */
        startMinigame: function(minigameID) {
            var minigameData = this.minigameData[minigameID];
            var enemies = minigameData.enemies;
            this.selectedMinigame = minigameData;

            // For now, the battle takes place in the middle of the map
            var tileX = Math.floor(game.currentMap.numCols / 2);
            var tileY = Math.floor(game.currentMap.numRows / 2);
            var centerX = tileX * game.TILESIZE + game.TILESIZE / 2;
            var centerY = tileY * game.TILESIZE + game.TILESIZE / 2;

            // Move camera to middle of the map
            game.Camera.panInstantlyTo(centerX, centerY, true);

            // Spawn all of your units
            game.UnitManager.placeAllPlayerUnits(tileX, tileY, game.MovementAI.FOLLOW_PATH);

            // Spawn the enemies
            for (var i = 0; i < enemies.length; i++) {
                var enemy = enemies[i];
                var enemyData = game.GetUnitDataFromID(enemy.enemyID);
                var quantity = enemy.quantity;
                var enemyLevel = game.util.randomInteger(enemy.minLevel, enemy.maxLevel);
                for (var j = 0; j < quantity; j++) {
                    var newUnit = new game.Unit(enemyData.id, game.PlayerFlags.ENEMY, enemyLevel);
                    newUnit.placeUnit(tileX, tileY, game.MovementAI.FOLLOW_PATH);
                    game.UnitManager.addUnit(newUnit);
                }
            };

            // Create a battle for those units.
            game.BattleManager.makeBattleForPlacedUnits(centerX, centerY);

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
                'top': '45px'
            });

            $secondSpan.html('<b>x' + quantity + '</b>');
            $secondSpan.addClass('outline-font');
        },

        show: function() {
            $('#minigame-ui').dialog('open');
        },
        showIfHidden: function() {
            if ( !$("#minigame-ui").dialog( 'isOpen' ) ) {
                this.show();
            }
        },
        hide: function() {
            $('#minigame-ui').dialog('close');
        }

    };
}()); 