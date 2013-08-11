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

                // Make sure that corresponds to a unit
                if ( portraitNumber < 0 || portraitNumber >= game.UICanvas.units.length ) {
                    return;
                }

                var unit = game.UICanvas.units[portraitNumber];

                // Center the camera on that unit if it's already been placed.
                if ( unit.hasBeenPlaced ) {
                    game.Camera.panInstantlyTo(unit.getCenterX(), unit.getCenterY(), true);
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
        },

        /**
         * Draws just the unit's image.
         * @param  {Unit} unit - the unit whose portrait you're drawing
         */
        drawUnitImage: function(unit) {
            charSheet.drawSprite(this.uictx, unit.graphicIndexes[0], this.drawX, this.drawY, !unit.isPlayer());
            if ( !unit.isLiving() && unit.hasBeenPlaced ) {
                // Draw an 'X' over dead units. We don't draw a tombstone so
                // that you still get the visual indicator of color for each
                // unit.
                game.TextManager.drawTextImmediate(this.uictx, 'X', this.drawX + 3, this.drawY - 10, {screenCoords:true, fontSize:36, color:'#f00', baseline:'top', treatXAsCenter:false});
            } else if ( !unit.hasBeenPlaced ) {
                // Gray out units that haven't been placed
                this.uictx.save();
                this.uictx.fillStyle = 'rgba(0, 0, 0, .75)';
                this.uictx.fillRect(this.drawX, this.drawY, unit.width, unit.height);
                this.uictx.restore();
            }
        },

        /**
         * Draws just the unit's level.
         * @param  {Unit} unit - the unit whose portrait you're drawing
         */
        drawLevel: function(unit) {
            game.TextManager.drawTextImmediate(this.uictx, 'Lv ' + unit.level, this.drawX, this.drawY - 10, {screenCoords:true, fontSize:12, baseline:'top', treatXAsCenter:false});
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
        }
    };
}()); 