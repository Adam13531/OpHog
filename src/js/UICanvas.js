( function() {

    /**
     * This represents a separate canvas entirely that will draw the unit
     * portraits.
     * @type {Object}
     */
    window.game.UICanvas = {

        /**
         * The canvas context.
         * @type {Object}
         */
        uictx: null,

        /**
         * The width of the canvas.
         * @type {Number}
         */
        width: null,

        /**
         * The height of the canvas.
         * @type {Number}
         */
        height: null,

        /**
         * The current draw coordinates, in canvas coordinates.
         * @type {Number}
         */
        drawX: 0,
        drawY: 0,

        /**
         * The amount of padding between each portrait..
         * @type {Number}
         */
        xPadding: 15,

        /**
         * The units to draw. We keep track of which order we drew them in so
         * that when we click one, we don't have to recompute the order.
         * @type {Array}
         */
        units: [],

        /**
         * "Buy new unit" buttons will show up if you don't already have the
         * maximum number of units in a class. This will tell you which buttons
         * we're displaying and in what order.
         * @type {Array:game.PlaceableUnitType}
         */
        buyButtonUnitTypes: [],

        /**
         * Initialize the UI.
         */
        initialize: function() {
            this.uictx = $('#ui-canvas')[0].getContext('2d');

            this.width = parseInt($('#ui-canvas').attr('width'));
            this.height = parseInt($('#ui-canvas').attr('height'));

            this.setupInputHandlers();
        },

        /**
         * Adds any input handlers to the canvas.
         */
        setupInputHandlers: function() {

            var hammertime = $('#ui-canvas').hammer({prevent_default:true});
            hammertime.on('release', function(event) {
                var offsetX = event.gesture.center.pageX - event.gesture.target.offsetLeft;
                var offsetY = event.gesture.center.pageY - event.gesture.target.offsetTop;

                // Figure out which portrait you clicked
                var portraitNumber = Math.floor(offsetX / (game.TILESIZE + game.UICanvas.xPadding));

                var numUnitPortraits = game.UICanvas.units.length;
                var numbuyButtonUnitTypes = game.UICanvas.buyButtonUnitTypes.length;

                // Make sure that corresponds to a unit
                if ( portraitNumber < 0 || portraitNumber >= numUnitPortraits + numbuyButtonUnitTypes ) {
                    return;
                }

                if ( portraitNumber < numUnitPortraits ) {
                    var unit = game.UICanvas.units[portraitNumber];

                    // Center the camera on that unit if it's already been placed.
                    if ( unit.hasBeenPlaced ) {
                        game.Camera.panInstantlyTo(unit.getCenterX(), unit.getCenterY(), true);
                    } else {
                        game.UnitPlacementUI.placeUnit(unit);
                    }
                } else {
                    var unitType = game.UICanvas.buyButtonUnitTypes[portraitNumber - numUnitPortraits];
                    game.UnitPlacementUI.buyNewUnit(unitType);
                }
            });
        },

        /**
         * Draws the entire portrait.
         * @param  {Unit} unit - the unit whose portrait you want to draw
         */
        drawPortrait: function(unit) {
            this.drawUnitImage(unit);

            this.drawY += unit.height;
            this.drawLifeBar(unit);
            this.drawExpBar(unit);
            this.drawLevel(unit);
            this.drawPlacementCost(unit);
            this.drawXIfDead(unit);
        },

        /**
         * This draws an 'X' over dead units. We don't draw a tombstone so that
         * you still get the visual indicator of color for each unit.
         *
         * This doesn't cover the level of the unit in case you want to use a
         * revive item; you'd probably care about level.
         * @param  {Unit} unit - the unit whose portrait you want to draw
         */
        drawXIfDead: function(unit) {
            if ( !unit.isLiving() && unit.hasBeenPlaced ) {
                game.TextManager.drawTextImmediate(this.uictx, 'X', this.drawX, -5, {screenCoords:true, fontSize:50, color:'#f00', baseline:'top', treatXAsCenter:false});
            }
        },

        /**
         * Draws just the unit's image.
         * @param  {Unit} unit - the unit whose portrait you're drawing
         */
        drawUnitImage: function(unit) {
            charSheet.drawSprite(this.uictx, unit.graphicIndexes[0], this.drawX, this.drawY, !unit.isPlayer());
            if ( !unit.hasBeenPlaced ) {
                // Gray out units that haven't been placed
                this.uictx.save();
                this.uictx.fillStyle = 'rgba(0, 0, 0, .75)';
                this.uictx.fillRect(this.drawX, this.drawY, unit.width, unit.height);
                this.uictx.restore();
            }
        },

        /**
         * Draws a "buy new unit" button.
         * @param  {game.PlaceableUnitType} unitType - the unit type of the
         * button to draw.
         */
        drawBuyButton: function(unitType) {
            var numUnits = game.UnitManager.getNumOfPlayerUnits(unitType);

            if ( numUnits == game.MAX_UNITS_PER_CLASS ) {
                return;
            }

            this.buyButtonUnitTypes.push(unitType);

            var graphicIndexes = game.UnitManager.getUnitCostume(unitType, -1);
            charSheet.drawSprite(this.uictx, graphicIndexes[0], this.drawX, this.drawY, false);

            var cost = game.UnitPlacementUI.costToPurchaseSlot(unitType);

            var fontColor = '#fff';
            if ( !game.Player.hasThisMuchMoney(cost) ) {
                fontColor = '#f00';

                // Gray out the button if you don't have enough money.
                this.uictx.save();
                this.uictx.fillStyle = 'rgba(0, 0, 0, .75)';
                this.uictx.fillRect(this.drawX, this.drawY, game.TILESIZE, game.TILESIZE);
                this.uictx.restore();
            }
            game.TextManager.drawTextImmediate(this.uictx, '$' + cost, this.drawX, this.drawY + 25, {screenCoords:true, fontSize:12, baseline:'top', treatXAsCenter:false, color:fontColor});
            this.drawX += game.TILESIZE + this.xPadding;
        },

        /**
         * Draws just the unit's level.
         * @param  {Unit} unit - the unit whose portrait you're drawing
         */
        drawLevel: function(unit) {
            game.TextManager.drawTextImmediate(this.uictx, 'Lv ' + unit.level, this.drawX, this.drawY - 10, {screenCoords:true, fontSize:12, baseline:'top', treatXAsCenter:false});
        },

        /**
         * Draws the placement cost underneath a placeable unit.
         * @param  {Unit} unit - the unit whose portrait you're drawing
         */
        drawPlacementCost: function(unit) {
            if ( unit.hasBeenPlaced ) {
                return;
            }

            var cost = game.UnitPlacementUI.costToPlaceUnit(unit);

            var fontColor = '#fff';
            if ( !game.Player.hasThisMuchMoney(cost) ) {
                fontColor = '#f00';
            }
            game.TextManager.drawTextImmediate(this.uictx, '$' + cost, this.drawX, this.drawY, {screenCoords:true, fontSize:12, baseline:'top', treatXAsCenter:false, color:fontColor});
        },

        /**
         * Draws just the unit's life bar.
         * @param  {Unit} unit - the unit whose portrait you're drawing
         */
        drawLifeBar: function(unit) {
            if ( !unit.hasBeenPlaced ) {
                return;
            }

            var w = unit.width;
            var h = 10;
            var x = this.drawX;
            var y = this.drawY - h;
            this.drawY += h + 1;
            var percentLife = Math.min(1, Math.max(0, unit.life / unit.getMaxLife()));

            game.graphicsUtil.drawBar(this.uictx, x,y,w,h, percentLife, {barR:200, borderR:255});
        },

        /**
         * Draws just the unit's experience bar.
         * @param  {Unit} unit - the unit whose portrait you're drawing
         */
        drawExpBar: function(unit) {
            var w = unit.width;
            var h = 10;
            var x = this.drawX;
            var y = this.drawY - h;
            this.drawY += h + 1;
            var exp = unit.experience;

            game.graphicsUtil.drawBar(this.uictx, x,y,w,h, exp / 100, {barG:200, borderG:255, text:exp});
        },

        /**
         * Draws all unit portraits.
         */
        draw: function() {
            // Draw background
            this.uictx.save();
            this.uictx.fillStyle = '#373737';
            this.uictx.fillRect(0, 0, this.width, this.height);
            this.uictx.restore();

            // Draw each unit portrait
            this.drawX = 0;
            this.units = [];
            var types = [game.PlaceableUnitType.ARCHER, game.PlaceableUnitType.WARRIOR, game.PlaceableUnitType.WIZARD];
            for (var i = 0; i < types.length; i++) {
                game.util.pushAllToArray(this.units, game.UnitManager.getUnits(types[i]));
            };

            for (var i = 0; i < this.units.length; i++) {
                var unit = this.units[i];
                this.drawY = 0;
                this.drawPortrait(unit);
                this.drawX += unit.width + this.xPadding;
            };

            this.buyButtonUnitTypes = [];
            for (var i = 0; i < types.length; i++) {
                this.drawY = 0;
                this.drawBuyButton(types[i]);
            }

        }
    };
}()); 