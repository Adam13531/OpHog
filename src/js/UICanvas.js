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
         * Any buttons that show up on the portrait UI. These are used for
         * placing units or buying new slots.
         * @type {Array:PortraitUIButton}
         */
        buttons: [],

        /**
         * Buy-unit buttons will show up if you don't already have the maximum
         * number of units in a class. This will tell you which buttons we're
         * displaying and in what order.
         * @type {Array:game.PlaceableUnitType}
         */
        buyButtonUnitTypes: [],

        /**
         * All of the placeable units that you own, whether they've been placed
         * or not. We keep track of this so that we know what we drew and in
         * which order.
         * @type {Array:Unit}
         */
        units: [],

        /**
         * This is used by the drag event handlers to keep track of where the
         * mouse was when you started dragging.
         *
         * This is different from the Camera's because you can drag this canvas
         * separately from the main canvas. This object also only keeps track of
         * scrolling in one direction.
         * @type {Object}
         */
        dragStartPos: {},

        /**
         * The number of pixels that you've scrolled the unit portraits. The
         * bigger the number, the further to the right you've scrolled.
         *
         * Note that the buttons will be drawn at negative values when you
         * scroll, so there's no need to use scrollX in the tap event
         * coordinates.
         * @type {Number}
         */
        scrollX: 0,

        /**
         * The largest scroll value. This is based on how many units you have
         * and the width of the canvas.
         * @type {Number}
         */
        maxScrollX: 0,

        /**
         * Index of the button in the button array that is supposed to be highlighted
         * @type {Number}
         */
        highlightedButtonIndex: 0,

        /**
         * The alpha value to use when showing the selection rectangle.
         * @type {Number}
         */
        highlightAlpha: .4,

        /**
         * The direction in which the alpha is changing. This is only positive
         * or negative 1.
         * @type {Number}
         */
        highlightAlphaChange: 1,

        /**
         * Flag that tells us if a unit was just bought. It is used to let us
         * know that we need to scroll that unit into view. This value is
         * checked in the next game loop after the unit has been bought. It
         * needs to be checked in the next game loop because things need to be
         * updated first before the new unit should be scrolled into view, like
         * the list of available unit types that can still be bought and the new
         * positions where the units will be drawn.
         * @type {Boolean}
         */
        unitWasJustBought: false,

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
                if ( game.HammerHelper.hammerDragging == true ) return;
                var offsetX = event.gesture.center.pageX - event.gesture.target.offsetLeft;
                var offsetY = event.gesture.center.pageY - event.gesture.target.offsetTop;

                // Figure out which portrait you clicked. Start from the end and
                // go backwards so that we check the buy-slot buttons first. We
                // do this since they appear on top of the unit portraits.
                for (var i = game.UICanvas.buttons.length - 1; i >=0; i--) {
                    var button = game.UICanvas.buttons[i];
                    if ( offsetX >= button.x && offsetX <= button.right && offsetY >= button.y && offsetY <= button.bottom ) {
                        game.UICanvas.highlightedButtonIndex = i;
                        button.callback();
                        break;
                    }
                };
            });

            hammertime.on('dragstart', this.getDragStartEventHandler());
            hammertime.on('drag', this.getDragEventHandler());
            hammertime.on('dragend', game.HammerHelper.getResetDraggingHandler());
        },

        /**
         * Returns a function that will set the drag start positions (which will
         * be used by the drag event handler).
         */
        getDragStartEventHandler: function() {
            // Enclose 'this' in the returned function.
            var uiCanvas = this;

            return function(event) {
                game.HammerHelper.hammerDragging = true;
                uiCanvas.dragStartPos = {
                    origScrollX: uiCanvas.scrollX
                };
            };
        },

        /**
         * Returns a function that will scroll the canvas.
         */
        getDragEventHandler: function() {
            // Enclose 'this' in the returned function.
            var uiCanvas = this;

            return function(event) {
                uiCanvas.scrollX = uiCanvas.dragStartPos.origScrollX - event.gesture.deltaX;
                uiCanvas.scrollX = Math.min(uiCanvas.scrollX, uiCanvas.maxScrollX);
                uiCanvas.scrollX = Math.max(uiCanvas.scrollX, 0);
            };
        },

        /**
         * @param  {Unit} unit - the unit whose portrait you clicked
         * @return {Function} - a function to be called when that unit portrait
         * is clicked.
         */
        getUnitPortraitClicked: function(unit) {
            return function() {
                // Center the camera on that unit if it's already been placed.
                if ( unit.hasBeenPlaced ) {
                    // Attempt to use an item on the unit.
                    if ( !game.playerInventoryUI.useItemOnUnit(unit) ) {
                        // If that didn't work, then just center the camera on
                        // the unit.
                        game.Camera.panInstantlyTo(unit.getCenterX(), unit.getCenterY(), true);
                    }
                } else {
                    game.UnitPlacementUI.placeUnit(unit);
                }
            };
        },

        /**
         * @param  {game.PlaceableUnitType} unitType - the unit type of the buy
         * button that was clicked.
         * @return {Function} - a function to be called when that buy button is
         * clicked.
         */
        getBuyButtonClicked: function(unitType) {
            return function() {

                // Don't do anything else if the unit couldn't be purchased
                if ( !game.UnitPlacementUI.buyNewUnit(unitType) ) {
                    return;
                }

                // Find out if one of the buy buttons is highlighted. If it is, 
                // update the index because a unit was just bought, and we want 
                // to make sure that the same button is still highlighted
                
                var onBuyButton = game.UICanvas.onBuyButton();
                var numUnits = game.UnitManager.getNumOfPlayerUnits(unitType);
                // However, DON'T update the index if the player just bought the 
                // last possible unit of a class. This is because that button 
                // to buy more units of that class will disappear, so the buttons 
                // array will stay the same length.
                if ( numUnits != game.MAX_UNITS_PER_CLASS &&
                     onBuyButton ) {
                    game.UICanvas.highlightedButtonIndex++;
                }
            };
        },

        /**
         * Draws all portraits.
         */
        drawAllPortraits: function() {
            // Clip to just the portrait area so that we don't draw underneath
            // the buy-unit buttons.
            this.uictx.save();
            this.uictx.beginPath();
            this.uictx.rect(0, 0, this.getPortraitAreaWidth(), this.height);
            this.uictx.clip();

            // Draw all of the units you've already purchased
            for (var i = 0; i < this.units.length; i++) {
                var unit = this.units[i];
                this.drawY = 0;

                this.buttons.push(new game.PortraitUIButton(this.drawX, this.drawY, game.TILESIZE, this.height, this.getUnitPortraitClicked(unit)));
                this.drawPortrait(unit);
                this.drawX += unit.width + this.xPadding;
            };

            this.uictx.restore();
        },

        /**
         * Draws the entire portrait.
         * @param  {Unit} unit - the unit whose portrait you want to draw
         */
        drawPortrait: function(unit) {
            this.drawUnitImage(unit);

            // 32 used to be the heights of the units before we bought the
            // graphics, so we used to have unit.height here, now 32 is just the
            // size we optimized this for.
            this.drawY += 32;
            this.drawLifeBar(unit);
            this.drawExpBar(unit);
            this.drawLevel(unit);
            this.drawPlacementCost(unit);
            this.drawXIfDead(unit);

            this.drawUseOverlay(unit);
        },

        /**
         * Draws a green box on the unit if it's a valid USE target.
         * @param  {Unit} unit - the unit whose portrait you're drawing
         */
        drawUseOverlay: function(unit) {
            if ( !game.playerInventoryUI.isUnitAUseTarget(unit) ) return;

            this.uictx.save();
            var blink = Math.sin(game.alphaBlink * 4);
            var alpha = blink * .1 + .3;
            this.uictx.fillStyle = 'rgba(0, 255, 0, ' + alpha + ')';
            this.uictx.fillRect(this.drawX, 0, game.TILESIZE, game.TILESIZE);
            this.uictx.restore();
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
         * Draws all buy-unit buttons..
         */
        drawAllBuyButtons: function() {
            // Draw all the way to the right so that they don't move when you
            // purchase a unit.
            this.drawX = this.getPortraitAreaWidth();
            for (var i = 0; i < this.buyButtonUnitTypes.length; i++) {
                var unitType = this.buyButtonUnitTypes[i];
                this.drawY = 0;

                this.buttons.push(new game.PortraitUIButton(this.drawX, this.drawY, game.TILESIZE, this.height, this.getBuyButtonClicked(unitType)));
                this.drawBuyButton(unitType);
            };
        },

        /**
         * Draws a buy-unit button.
         * @param  {game.PlaceableUnitType} unitType - the unit type of the
         * button to draw.
         */
        drawBuyButton: function(unitType) {
            var graphicIndexes = game.UnitManager.getUnitCostume(unitType, -1);
            charSheet.drawSprite(this.uictx, graphicIndexes[0], this.drawX, this.drawY, false);

            var cost = game.UnitPlacementUI.costToPurchaseSlot(unitType);

            var fontColor = '#0bb';
            if ( !game.Player.hasThisManyDiamonds(cost) ) {
                fontColor = '#f00';

                // Gray out the button if you don't have enough money.
                this.uictx.save();
                this.uictx.fillStyle = 'rgba(0, 0, 0, .75)';
                this.uictx.fillRect(this.drawX, this.drawY, game.TILESIZE, game.TILESIZE);
                this.uictx.restore();
            }

            // If the cost isn't 3 digits, then we need to center the text.
            var offsetX = 0;
            var costAsString = '' + cost;
            if ( costAsString.length == 4 ) {
                offsetX = -3;
            } else if ( costAsString.length == 2 ) {
                offsetX = 5;
            }
            game.TextManager.drawTextImmediate(this.uictx, cost, this.drawX + offsetX, this.drawY + 25, {screenCoords:true, fontSize:12, baseline:'top', treatXAsCenter:false, color:fontColor});

            iconSheet.drawSprite(this.uictx, game.Graphic.BLUE_DIAMOND, this.drawX + 4, this.drawY + 38);
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
         * @return {Number} the amount of pixels dedicated to the unit portraits
         * themselves.
         */
        getPortraitAreaWidth: function() {
            return game.canvasWidth - (this.buyButtonUnitTypes.length * (game.TILESIZE + this.xPadding));
        },

        /**
         * @return {Number} the amount of pixels required to draw each unit
         * portrait.
         */
        getWidthNeededToDrawPortraits: function() {
            return this.units.length * (game.TILESIZE + this.xPadding);
        },

        /**
         * Draws a scrollbar on the unit portraits if necessary.
         */
        drawScrollBarIfNecessary: function() {
            if ( this.maxScrollX <= 0 ) return;
            this.uictx.save();

            var h = 3;
            var portraitAreaWidth = this.getPortraitAreaWidth();
            var alpha = Math.sin(game.alphaBlink * 4) * .1 + .3;

            // Figure out where to draw the bar and how big
            var percentWidth = portraitAreaWidth / this.getWidthNeededToDrawPortraits();
            var width = percentWidth * portraitAreaWidth;
            var percentX = this.scrollX / (this.maxScrollX);
            var x = percentX * (portraitAreaWidth - width);

            // Draw a 1-pixel scrollbar "track"
            this.uictx.fillStyle = 'rgba(128,0,0, ' + alpha + ')';
            this.uictx.fillRect(0,this.height - 2,portraitAreaWidth,1);

            // Draw the scrollbar
            this.uictx.fillStyle = 'rgba(255,0,0, ' + alpha + ')';
            this.uictx.fillRect(x,this.height - h,width,h);

            this.uictx.restore();
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

            // All of the unit types. If we already have all of the units of a
            // given type, then we will filter it out below.
            var types = [game.PlaceableUnitType.ARCHER, game.PlaceableUnitType.WARRIOR, game.PlaceableUnitType.WIZARD];

            this.buyButtonUnitTypes = [];
            this.buttons = [];
            this.drawX = -this.scrollX + this.xPadding / 2;

            // This will contain all of the units you've purchased already.
            this.units = [];
            for (var i = 0; i < types.length; i++) {
                var unitsOfType = game.UnitManager.getUnits(types[i]);

                // Filter out the types that we've already maxed
                if ( unitsOfType.length != game.MAX_UNITS_PER_CLASS ) {
                    this.buyButtonUnitTypes.push(types[i]);
                }

                game.util.pushAllToArray(this.units, unitsOfType);
            };

            // The width of all purchased units minus the visible width
            this.maxScrollX = this.getWidthNeededToDrawPortraits() - this.getPortraitAreaWidth();
            this.maxScrollX = Math.max(0, this.maxScrollX);

            this.drawAllPortraits();
            this.drawAllBuyButtons();

            this.drawScrollBarIfNecessary();

            // Make sure that a newly bought unit is in view to the user
            if ( this.unitWasJustBought ) {
                this.scrollToPortrait();
                this.unitWasJustBought = false;
            }

            this.highlightCurrentUnit();
        },

        /**
         * Highlights a unit by drawing a rectangle around it
         */
        highlightCurrentUnit: function() {
            if ( !game.playerUsedKeyboard ) {
                return;
            }

            var button = this.buttons[this.highlightedButtonIndex];
            var padding = game.STATUS_EFFECT_PADDING;
            var squareSize = button.w + padding * 2;

            this.uictx.save();

            // Make sure to not draw on top on the buy buttons if a non buy
            // button is highlighted. This could happen if a non buy button is
            // highlighted and the user scrolls.
            if ( !this.onBuyButton() ) {
                this.uictx.rect(0, 0, this.getPortraitAreaWidth(), this.height);
                this.uictx.clip();
            }

            // The lowest alpha to use
            var lowerBound = .3;

            // The highest alpha to use
            var upperBound = .9;

            // The speed at which to cycle through the alphas
            var speed = .0125;
            this.highlightAlpha += this.highlightAlphaChange * speed;

            // Cap at the bounds
            if ( this.highlightAlpha >= upperBound ) {
                this.highlightAlpha = upperBound - .00001;
                this.highlightAlphaChange *= -1;
            } else if ( this.highlightAlpha <= lowerBound ) {
                this.highlightAlpha = lowerBound + .00001;
                this.highlightAlphaChange *= -1;
            }

            this.uictx.lineWidth = 2;
            this.uictx.strokeStyle = 'rgba(255,255,0,' + this.highlightAlpha + ')';
            this.uictx.strokeRect(button.x - padding, (button.y + padding / 2) - 1, squareSize, squareSize + 2);
            this.uictx.restore();
        },

        /**
         * Updates the position of the highlight rectangle
         * @param  {game.DirectionFlags} directionToMoveRectangle - The direction
         * to move the highlight rectangle
         */
        highlightNewUnit: function(directionToMoveRectangle) {
            if ( directionToMoveRectangle == game.DirectionFlags.UP || directionToMoveRectangle == game.DirectionFlags.DOWN ) {
                var direction = (directionToMoveRectangle == game.DirectionFlags.UP);
                var amountToMove = 3;
                for (var i = 0; i < amountToMove; i++) {
                    this.moveHighlightRectangle( direction );
                };
            } else {
                this.moveHighlightRectangle(directionToMoveRectangle == game.DirectionFlags.RIGHT);
            }
            this.scrollToPortrait();
        },

        /**
         * Moves the highlight rectangle to the right or to the left. If either 
         * end of the array is reached, the index will wrap around.
         * @param  {Boolean} movingRight - True if the highlight rectangle needs 
         * to move to the right.
         */
        moveHighlightRectangle: function(movingRight) {
            this.highlightedButtonIndex += movingRight ? 1 : -1;
            var lastIndex = this.buttons.length;
            if ( this.highlightedButtonIndex == -1 ) this.highlightedButtonIndex = lastIndex - 1;
            if ( this.highlightedButtonIndex == lastIndex ) this.highlightedButtonIndex = 0; 
        },

        /**
         * Buys the unit that is currently selected (indicated by the highlight 
         * rectangle).
         */
        buyCurrentUnit: function() {
            this.buttons[this.highlightedButtonIndex].callback();
            this.unitWasJustBought = true;
        },

        /**
         * Scrolls the currently highlighted portrait into view
         */
        scrollToPortrait: function() {
            
            if ( this.onBuyButton() ) {
                return;
            }
            
            var currentButton = this.buttons[this.highlightedButtonIndex];
            // When the player is moving to the right
            if ( currentButton.x + game.TILESIZE > this.getPortraitAreaWidth() ) {
                
                var difference = this.getPortraitAreaWidth() - currentButton.x - game.TILESIZE - this.xPadding;
                this.scrollX -= difference;

            } else if ( currentButton.x < 0 ) { // When the player is moving to the left

                // Make the current button be the first to appear at the left 
                // side of the canvas. There could still be others off the 
                // screen to the left, but that's fine because they aren't 
                // the current buttons.
                // 
                // Addition works here to scroll to the left because the 
                // current button's x position will always be negative here.
                this.scrollX += currentButton.x;
            }
        },

        /**
         * Tells us if the highlighted button is a buy button or not
         * @return {Boolean} True if the highlighted button is a buy button
         */
        onBuyButton: function() {
            var firstBuyButtonIndex = this.buttons.length - this.buyButtonUnitTypes.length;
            return (this.highlightedButtonIndex >= firstBuyButtonIndex);
        }
    };
}()); 