( function() {
    
	/**
     * Defines the types of units that can be placed. These are used to
     * distinguish between the other unit types because these are the only types
     * that can actually be placed by a player.
     * @type {Number}
	 */
	window.game.PlaceableUnitType = {
		ARCHER: game.UnitType.PLAYER_ARCHER.id,
		WARRIOR: game.UnitType.PLAYER_WARRIOR.id,
		WIZARD: game.UnitType.PLAYER_WIZARD.id
	};

    /**
     * The return value of placeUnit.
     * @type {Object}
     */
    window.game.PlaceUnitStatus = {
        CANNOT_SPAWN_UNITS: 'cannot spawn units',
        UNIT_ALREADY_PLACED: 'unit already placed',
        NOT_ENOUGH_MONEY: 'not enough money',
        SUCCESSFULLY_PLACED: 'successfully placed'
    };

	/**
	 * The amount a slot costs per level
	 * @type {Number}
	 */
	window.game.UNIT_PLACEMENT_SLOT_COST = 100;
	/**
	 * Opacity of the units in the UI that aren't placed
	 * @type {String}
	 */
	window.game.UNIT_OPACITY_NOT_PLACED = '1.0';
	/**
	 * Opacity of the units in the UI that are placed
	 * @type {String}
	 */
	window.game.UNIT_OPACITY_PLACED = '0.4';

	/**
	 * The number of possible placeable classes
	 * @type {Number}
	 */
	window.game.NUM_PLACEABLE_UNIT_CLASSES = Object.keys(game.PlaceableUnitType).length;

    // There's only one unit placement UI, so we'll define everything in a single
    // object.
    window.game.UnitPlacementUI = {

    	/**
    	 * X position in tiles of the spawn point where units will be placed
    	 * @type {Number}
    	 */
    	spawnPointX: 0,

    	/**
    	 * Y position in tiles of the spawn point where units will be placed
    	 * @type {Number}
    	 */
    	spawnPointY: 0,

    	/**
    	 * Type of unit that the player can currently place
    	 * @type {PlaceableUnitType}
    	 */
    	unitType: null,

        /**
         * This is the Y coordinate (in pixels, relative to the unit placement
         * UI) of the left arrow (which should also be the Y coordinate of the
         * right arrow because they're on the same level). We keep track of it
         * so that when we switch pages, we can maintain the position of the
         * arrows.
         * @type {Number}
         */
        lastYPosition: null,

        /**
         * The alpha value to use when highlighting a spawner.
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
         * Computes the cost to buy a slot for the specified unit type. This is
         * passed in so that other callers can use the function too.
         * @param {game.PlaceableUnitType} unitType - the unit type you want to
         * know the cost of.
         * @return {Number}           Amount that the new slot will cost
         */
        costToPurchaseSlot: function(unitType) {
            return game.UNIT_PLACEMENT_SLOT_COST * 
                (game.UnitManager.getNumOfPlayerUnits(unitType) + 1);
        },

        /**
         * @return {Boolean} - true if you're allowed to even open the unit
         * placement UI (it's based on the game state that you're in).
         */
        canSpawnUnits: function() {
            return game.GameStateManager.isNormalGameplay();
        },

        /**
         * This is a debug function that will add 3 units of each type as though
         * you'd purchased them (but it doesn't cost money).
         */
        debugAddUnits: function() {
            var currentType = this.unitType;
            var currentCoins = game.Player.coins;
            game.Player.coins = 999999;
            this.navigateToPage(game.PlaceableUnitType.ARCHER);
            this.addUnit();
            this.addUnit();
            this.addUnit();
            this.navigateToPage(game.PlaceableUnitType.WIZARD);
            this.addUnit();
            this.addUnit();
            this.addUnit();
            this.navigateToPage(game.PlaceableUnitType.WARRIOR);
            this.addUnit();
            this.addUnit();
            this.addUnit();

            // Set coins before navigating back to the page so that the button's
            // enabled/disabled state is set correctly.
            game.Player.coins = currentCoins;
            this.navigateToPage(currentType);
        },

        /**
         * Sets the spawn location to the first visible spawner in the map. That
         * way, you don't have to click a spawner when the map begins if you
         * want to start spawning units right away.
         */
        initializeSpawnPoint: function() {
            var visibleSpawners = game.currentMap.getAllTiles(game.TileFlags.SPAWNER | game.TileFlags.UNFOGGY);

            // This should never happen.
            if ( visibleSpawners.length == 0 ) {
                game.util.debugDisplayText('No visible spawners found.', 'no vis spawners');
                return;
            }
            
            var firstSpawner = visibleSpawners[0];
            this.spawnPointX = firstSpawner.x;
            this.spawnPointY = firstSpawner.y;
        },

        /**
         * Selects the "next" spawner from your current one, which should be the
         * logical next spawner in terms of left-to-right, top-to-bottom order.
         * @param  {Boolean} selectNext - if true, this will go to the
         * "next" one, not the previous one.
         */
        selectSpawner: function(selectNext) {
            // Get all visible spawners. The way this function works internally
            // is to iterate through all of the map tiles from
            // [0...mapTiles.length], so this will be in the order we want
            // already. We can't just cache this list of tiles because the
            // UNFOGGY property could change, although for spawners it probably
            // never will.
            var visibleSpawners = game.currentMap.getAllTiles(game.TileFlags.SPAWNER | game.TileFlags.UNFOGGY);

            // This should never happen.
            if ( visibleSpawners.length == 0 ) {
                game.util.debugDisplayText('No visible spawners found.', 'no vis spawners');
                return;
            }

            // This is the index of the spawner that we will select.
            var index = null;

            // Figure out which one we currently have selected.
            for (var i = 0; i < visibleSpawners.length; i++) {
                if ( visibleSpawners[i].x == this.spawnPointX && visibleSpawners[i].y == this.spawnPointY ) {
                    if ( selectNext ) {
                        index = i + 1;
                    } else {
                        index = i - 1;
                    }

                    break;
                }
            };

            // This should also never happen. This means we iterated through all
            // of the spawners without finding the one that was currently
            // selected.
            //
            // Note: this actually can currently happen on the overworld because
            // you don't have a selected spawner there, so we'll just return
            // here.
            if ( index == null ) {
                return;
            }

            // Wrap around the boundaries of the array
            if ( index < 0 ) index = visibleSpawners.length - 1;
            else if ( index > visibleSpawners.length - 1 ) index = 0;

            // Select and pan to the next spawner
            var nextSpawner = visibleSpawners[index];
            this.spawnPointX = nextSpawner.x;
            this.spawnPointY = nextSpawner.y;

            game.Camera.panInstantlyTo(this.spawnPointX * game.TILESIZE, this.spawnPointY * game.TILESIZE, true);
        },

        /**
         * Calculates the cost to place the specified unit
         * @param  {Unit} unit - Unit that can be placed
         * @return {Number}    Cost to place the unit 
         */
        costToPlaceUnit: function(unit) {
            return (unit.level * 50);
        },

        /**
         * Places a unit, if possible. This costs money.
         * @param  {Unit} unit - the unit to place
         * @return {game.PlaceUnitStatus} - the error or success code.
         */
        placeUnit: function(unit) {
            var cost = this.costToPlaceUnit(unit);
            if (!this.canSpawnUnits()) {
                return game.PlaceUnitStatus.CANNOT_SPAWN_UNITS;
            }

            if ( unit.hasBeenPlaced ) {
                return game.PlaceUnitStatus.UNIT_ALREADY_PLACED;
            }

            if ( !game.Player.hasThisMuchMoney(cost) ) {
                return game.PlaceUnitStatus.NOT_ENOUGH_MONEY;
            }

            unit.placeUnit(this.spawnPointX, this.spawnPointY, game.MovementAI.FOLLOW_PATH);
            game.Player.modifyCoins(-cost);
            game.UnitPlacementUI.updateUnit(unit);

            return game.PlaceUnitStatus.SUCCESSFULLY_PLACED;
        },

        /**
         * Buys a new unit slot. unitType is passed in so that this code can be
         * used elsewhere to buy a unit regardless of what the unit placement UI
         * is currently showing.
         * @param  {game.PlaceableUnitType} unitType - the unit type to buy
         * @return {Boolean} - True if the unit was bought
         */
        buyNewUnit: function(unitType) {
            // Make sure the player can afford it
            var cost = this.costToPurchaseSlot(unitType);
            if (!game.Player.hasThisManyDiamonds(cost)) {
                return false;
            }

            // Make sure the player doesn't already have the max number of units
            var numUnits = game.UnitManager.getNumOfPlayerUnits(unitType);
            if ( numUnits == game.MAX_UNITS_PER_CLASS ) {
                // The only way the code should be able to get here is via a
                // debug function like debugAddUnits, but it doesn't hurt to
                // have this check.
                return false;
            }

            // If the unit placement UI triggered this call, then this will be
            // true. Otherwise, it can be false.
            var buyingDisplayedUnitType = (unitType == this.unitType);

            game.Player.modifyDiamonds(-cost);

            // Keep track of where the 'buy' button is so that we can restore
            // that position at the end of this function.
            if ( buyingDisplayedUnitType ) {
                var oldBuyYPosition = $('#buySlotButton').position().top;
                var containerY = $('#buyingScreenContainer').parent().position().top;
            }

            // Create the new unit
            var newUnit = new game.Unit(unitType, game.PlayerFlags.PLAYER, 1);

            // Give it an alternate costume if it isn't the first unit
            if ( numUnits >= 1 && numUnits <= game.MAX_UNITS_PER_CLASS - 1 ) {
                newUnit.graphicIndexes = game.UnitManager.getUnitCostume(unitType, -1);
            }

            game.UnitManager.addUnit(newUnit);

            if ( buyingDisplayedUnitType ) {
                game.UnitPlacementUI.addSlotToPage(newUnit, numUnits);

                // Adjust the window position unless we're removing the buy
                // buttons.
                if ( numUnits < game.MAX_UNITS_PER_CLASS - 1 ) {
                    var newBuyYPosition = $('#buySlotButton').position().top;
                    $('#buyingScreenContainer').parent().css( {
                        top: Math.max(0, containerY + oldBuyYPosition - newBuyYPosition)
                    });
                }
            } else {
                // We bought a unit from another page, so update the counts.
                this.updateAvailableUnitCounts();
            }

            this.setBuyIconClass();

            // If you're looking at the overworld, add that unit to the
            // overworld now.
            if ( game.GameStateManager.inOverworldMap() ) {
                var tileOfLastMap = game.currentMap.getTileOfLastMap();
                game.UnitManager.placeAllPlayerUnits(tileOfLastMap.x, tileOfLastMap.y, game.MovementAI.WANDER_UNFOGGY_WALKABLE);
            }

            return true;
        },

		/**
         * Sets up the entire unit placement UI.
         */
        setupUI: function() {

			var rightMargin = '18px';
			var buyingScreenContainer = ('<div id="buyingScreenContainer" title="Place Units"></div>');
			$('body').append(buyingScreenContainer);

			$('#buyingScreenContainer').append('<div id="headers" style="width:200px; height:32px;">' +
										'<img id="header1" src="'+game.imagePath+'/img_trans.png" class="item-sprite treasure-png" style="margin-left:58px;"/>' +
                                        '<span id="header2">Lvl</span>' +
                                        '<span id="header3">Exp</span>' +
								   '</div>');
			$('#header1, #header2, #header3').css({
				'margin-right' : rightMargin
			});

            $unitPlacementDialog = $('#buyingScreenContainer');
			$unitPlacementDialog.dialog({
                autoOpen: false,
                resizable:false,
                autoResize: true,
                width: 260,

                // Wrap the dialog in a span so that it gets themed correctly.
                appendTo:"#unitPlacementDialogThemeSpan",
                hide: {
                    effect: 'fade',
                    duration: game.DIALOG_HIDE_MS
                },
    
                // Position the unit placement screen in the center of the canvas
                position: {
                    my: 'center',
                    at: 'center',
                    of: game.$canvas
                },
            });

            game.DialogManager.addDialog($unitPlacementDialog);

            // Sets the default page
            this.setPage(game.PlaceableUnitType.ARCHER);
        },

		/**
         * Figures out the CSS unit class for a specific unit type and returns
         * it. This unit class is used to specify which image in the CSS file to
         * use.
         * @param  {PlaceableUnitType} unitType - Type of unit
         * @param  {Number} index - the row index of the unit (color is based on
         * this). Specify 0 to get the "default" color.
         * @return {String}          Classes for the particular unit
		*/
		getCSSUnitClass: function(unitType, index) {
            // All classes start with this. We append to this string below.
			var unitClass = 'char-sprite ';
            if ( index >= game.MAX_UNITS_PER_CLASS ) index = 0;

			switch (unitType) {
			    case game.PlaceableUnitType.ARCHER:
                    unitClass += 'arch-alt-' + index + '-png';
			        break;
			    case game.PlaceableUnitType.WARRIOR:
                    unitClass += 'war-alt-' + index + '-png';
			        break;
			    case game.PlaceableUnitType.WIZARD:
                    unitClass += 'wiz-alt-' + index + '-png';
			        break;
			    default:
			        console.log("ERROR: Unit type doesn't exist.")
			        break;
			}
			return unitClass;
		},

        /**
         * Removes page-specific items from the page
         * @return {null}
         */
        clearPage: function() {
        	$('#unitContainer').remove();
        	$('#buySlotButtonDescription').remove();
        	$('#buySlotButton').remove();
        	$('#changingPagesDiv').remove();
        },

        /**
         * Returns the ID of the unit that will show on the left arrow.
         *
         * The IDs representing the placeable unit types aren't guaranteed to be
         * in any sort of order, although the members of PlaceableUnitTypes
         * itself WILL have a guarantee. However, we don't use that because this
         * logic is cleaner/easier to understand.
         * @return {Number}             Index of the page to the left
         */
        getLeftPage: function() {
            if ( this.unitType == game.PlaceableUnitType.ARCHER ) return game.PlaceableUnitType.WIZARD;
            if ( this.unitType == game.PlaceableUnitType.WIZARD ) return game.PlaceableUnitType.WARRIOR;
            return game.PlaceableUnitType.ARCHER;
        },

        /**
         * See getLeftPage.
         * @return {Number} - the ID of the unit that will show on the right
         * arrow
         */
        getRightPage: function() {
            if ( this.unitType == game.PlaceableUnitType.ARCHER ) return game.PlaceableUnitType.WARRIOR;
            if ( this.unitType == game.PlaceableUnitType.WIZARD ) return game.PlaceableUnitType.ARCHER;
            return game.PlaceableUnitType.WIZARD;
        },

        /**
         * This is the function that is called when you click the left or right
         * arrows (or their corresponding unit pictures).
         *
         * It's very straightforward.
         * @param  {Number} pageIndex - the index of the page to switch to
         * @return {null}
         */
        navigateToPage: function(pageIndex) {
            // See the comment for lastYPosition for why we do this.
            this.lastYPosition = $('#leftArrowImg').position().top;
            this.setPage(pageIndex);
        },

        /**
         * Sets the buy icon to the correct unit color.
         *
         * This will outright remove the buying elements if you already have the
         * max number of units.
         */
        setBuyIconClass: function() {
            var numUnits = game.UnitManager.getNumOfPlayerUnits(this.unitType);

            // Remove the buy buttons if you have all of the units of this type.
            if ( numUnits == game.MAX_UNITS_PER_CLASS ) {
                $('#buySlotButtonDescription').remove();
                $('#buySlotButton').remove();
                return;
            }
            var $unitPlacementBuyIcon = $('#unitPlacementBuyIcon');
            $unitPlacementBuyIcon.removeAttr('class');
            $unitPlacementBuyIcon.addClass(this.getCSSUnitClass(this.unitType, numUnits));
        },

        /**
         * Allows the user to place units and buy slots for all the units of the
         * specified unit type.
         * @param {PlaceableUnitType} unitType Type of unit
         */
        setPage: function(unitType) {
            this.clearPage();
			
			this.unitType = unitType;
			var unitArray = game.UnitManager.getUnits(this.unitType);
			
			$('#buyingScreenContainer').append('<div id="unitContainer">');
			for (var i = 0; i < unitArray.length; i++) {
				this.addSlotToPage(unitArray[i], i);
			}
			$('#buyingScreenContainer').append('</div>');

            var imageHTML = '<img id="unitPlacementBuyIcon" src="'+game.imagePath+'/img_trans.png"/>';

            // Add a button to allow the player to buy a new slot
            $('#buyingScreenContainer').append('<button id="buySlotButton"></button>' +
                                                '<span id=buySlotButtonDescription>- Buy ' + imageHTML + ' slot</span>');

            this.setBuyIconClass();
            $('#buySlotButton').button();
            $('#buySlotButton').text(this.costToPurchaseSlot(this.unitType));
            $('#buySlotButton').css({
                'padding': '2px 2px 2px 2px'
            });
			$('#buySlotButton').click(function() {
				game.UnitPlacementUI.addUnit();
			});

			$('#buySlotButtonDescription').click(function() {
				game.UnitPlacementUI.addUnit();
			});

			// Setting up the arrows and images that will allow the user to
			// switch units.
			var nextUnitLeftImage = this.getLeftPage();
			var nextUnitRightImage = this.getRightPage();

			$('#buyingScreenContainer').append('<div id="changingPagesDiv">' +
											   '<img id="leftArrowImg" src="'+game.imagePath+'/left_arrow.png" width="32" height="32"/>' +
											   '<img id="leftUnit" src="'+game.imagePath+'/img_trans.png" class="' + this.getCSSUnitClass(nextUnitLeftImage, 0) + '" />' +
											   '<span id="leftUnitAmount" style="font-weight: bold; font-size: 20px; margin-right:2.00em">0</span>' +
											   '<span id="rightUnitAmount" style="font-weight: bold; font-size: 20px">0</span>' +
											   '<img id="rightUnit" src="'+game.imagePath+'/img_trans.png" class="' + this.getCSSUnitClass(nextUnitRightImage, 0) + '" />' +
											   '<img id="rightArrowImg" src="'+game.imagePath+'/right_arrow.png" width="32" height="32"/>' +
											   '</div>');
			$('#leftArrowImg,#leftUnit,#leftUnitAmount').click(function() {
                game.UnitPlacementUI.navigateToPage(nextUnitLeftImage);
			});
			$('#rightArrowImg,#rightUnit,#rightUnitAmount').click(function() {
                game.UnitPlacementUI.navigateToPage(nextUnitRightImage);
			});

            // If you're switching pages, make sure the arrows stay at the same
            // height so that you can quickly navigate.
            // 
            // Note: the very first time this code is run, there won't be a
            // lastYPosition.
            if ( this.lastYPosition ) {
                // Get the current position, which is relative to its container
                var curYPosition = $('#leftArrowImg').position().top;

                // Get the container's position so that we can place this
                // relative to the canvas. Jqueryui puts our 'dialog' into
                // another div, which is why we want the parent.
                var containerY = $('#buyingScreenContainer').parent().position().top;

                $('#buyingScreenContainer').parent().css( {
                    top: containerY + this.lastYPosition - curYPosition
                });
            }

            // Call this after we set the page so that the buy button will be
            // enabled/disabled appropriately.
            this.playerCoinsChanged();

            this.updateAvailableUnitCounts();
        },

        /**
         * Updates this unit's statistics and the opacity of the entire row.
         *
         * This also updates the available unit counts.
         * @param  {Unit} unit - the unit to update
         * @return {null}
         */
        updateUnit: function(unit) {
            this.updateAvailableUnitCounts();

            var id = unit.id;

        	var $costTag = $('#unitCost' + id);
        	var $levelTag = $('#unitLevel' + id);
        	var $expTag = $('#unitExperience' + id);

            // Make sure that each tag exists. Examples of why they may not
            // exist: either you used one of the debug methods of spawning a
            // unit (e.g. pressing a key on the keyboard) or perhaps you
            // summoned a unit in battle. Either way, it wouldn't show in this
            // UI, so there's nothing to update here.
        	if ( $costTag.length == 0 || $levelTag.length == 0 || $expTag.length == 0 ) return;

            var cost = this.costToPlaceUnit(unit);
        	$costTag.text(cost);
        	$levelTag.text(unit.level);
        	$expTag.text(unit.experience);

            if ( !unit.hasBeenPlaced && !game.Player.hasThisMuchMoney(cost) ) {
                $costTag.css({'color':'#b00'});
            } else {
                $costTag.css({'color':'#fff'});
            }

            var opacity = unit.hasBeenPlaced ? game.UNIT_OPACITY_PLACED : game.UNIT_OPACITY_NOT_PLACED;

            // Modify the opacity of the entire div
            $('#unit' + id).css({'opacity': opacity});
        },

        /**
         * Updates the numbers that appear next to each unit at the bottom of
         * the page.
         */
        updateAvailableUnitCounts: function() {
            var leftUnitType = this.getLeftPage();
            var rightUnitType = this.getRightPage();
            var availableLeftUnits = game.UnitManager.getUnplacedUnits(leftUnitType);
            var availableRightUnits = game.UnitManager.getUnplacedUnits(rightUnitType);
            $('#leftUnitAmount').text(availableLeftUnits.length);
            $('#rightUnitAmount').text(availableRightUnits.length);
        },

        /**
         * Call this function any time the player's coin total changes. This
         * will properly enable/disable/color/etc. any part of the UI that
         * depends on how many coins you have.
         * @return {undefined}
         */
        playerCoinsChanged: function() {
            this.updateAllUnits();

            // Update the "buy" button
            var cost = this.costToPurchaseSlot(this.unitType);
            if ( !game.Player.hasThisMuchMoney(cost) ) {
                $('#buySlotButton').button('disable');
            } else {
                $('#buySlotButton').button('enable');
            }
        },

        /**
         * This simply calls updateUnit on each unit that this page holds.
         * @return {undefined}
         */
        updateAllUnits: function() {
            var units = game.UnitManager.getUnits(this.unitType);
            for (var i = 0; i < units.length; i++) {
                this.updateUnit(units[i]);
            };
        },

        /**
         * Adds a slot to the page
         * @param {Unit} unit  Unit that will be in the slot
         * @param {Number} index - the row index of the unit
         */
        addSlotToPage: function(unit, index) {
            var id = unit.id;

			$('#unitContainer').append('<div id="unit'+id+'">' +
										'<img id="unitImage'+id+'" src="'+game.imagePath+'/img_trans.png" class="'+this.getCSSUnitClass(unit.unitType, index)+'" />' +
										'<span id="unitCost'+id+'" style="font-weight: bold; font-size: 20px"/>' +
										'<span id="unitLevel'+id+'" style="font-weight: bold; font-size: 20px"/>' +
										'<span id="unitExperience'+id+'" style="font-weight: bold; font-size: 20px"/>' +
								   '</div>');

            // Set the margin on everything at once. The margins never change.
            $('#unitImage'+id+',#unitCost'+id+',#unitLevel'+id).css({
                'margin-right':'30px'
            });

			// If the user clicks a unit, place the unit if it hasn't been placed
			$('#unit'+id).click({unitClicked: unit}, unitClicked);
			function unitClicked(event) {
                var unit = event.data.unitClicked;
                var placementStatus = game.UnitPlacementUI.placeUnit(unit);

                // If the unit has been placed, center the camera on that unit
                if ( placementStatus == game.PlaceUnitStatus.UNIT_ALREADY_PLACED ) {
                    game.Camera.panInstantlyTo(unit.getCenterX(), unit.getCenterY(), true);
                    return;
                }
			}

			// Update the text of the button to show the new cost of buying
			// this unit
			$('#buySlotButton').text(this.costToPurchaseSlot(unit.unitType));

            this.updateUnit(unit);
        },

        /**
         * Sets the spawn point tiles
         * @param {Number} tileX Tile X
         * @param {Number} tileY Tile Y
         */
        setSpawnPoint: function(tileX, tileY) {
        	this.spawnPointX = tileX;
        	this.spawnPointY = tileY;
        },

        /**
         * Draws a highlight around the currently selected spawn point so that
         * you know where your units will come out.
         * @param  {Object} ctx - the canvas context
         */
        highlightCurrentSpawnPoint: function(ctx) {
            if ( !game.GameStateManager.isNormalGameplay() ) {
                return;
            }

            ctx.save();

            var worldX = this.spawnPointX * game.TILESIZE;
            var worldY = this.spawnPointY * game.TILESIZE;

            var padding = game.STATUS_EFFECT_PADDING;

            // The lowest alpha to use
            var lowerBound = 0;

            // The highest alpha to use
            var upperBound = .7;

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

            var blink = game.alphaBlink * 53;
            var blink2 = game.alphaBlink * 29;
            var r = Math.floor(blink % 255);
            var g = Math.floor(blink2 % 255);

            // After 128, cycle back down so that it doesn't go from 0 to 255
            // back to 0 (it would be an abrupt change to black sometimes). This
            // makes it smoother. We can later multiply these values by 2 if we
            // want since they won't be higher than 128, but the darker colors
            // seem to work better.
            if ( r > 128 ) r = 255 - r;
            if ( g > 128 ) g = 255 - g;
            ctx.lineWidth = padding * 2;
            ctx.strokeStyle = 'rgba(' + r + ', ' + g + ',0, ' + this.highlightAlpha + ')';
            ctx.strokeRect(worldX - padding, worldY - padding, game.TILESIZE + padding * 2, game.TILESIZE + padding * 2);
            ctx.restore();
        },

        /**
         * Show the UI.
         */
        show: function() {
            $('#buyingScreenContainer').dialog('open');

            // Reset some of the highlight values so that you know right away
            // whether you tapped the spawner.
            this.highlightAlpha = 1;
            this.highlightAlphaChange = -1;
        },

        /**
         * Adds a unit to the UI
         */
        addUnit: function() {
            var cost = this.costToPurchaseSlot(this.unitType);
            if (!game.Player.hasThisMuchMoney(cost)) {
                return;
            }

            var numUnits = game.UnitManager.getNumOfPlayerUnits(this.unitType);
            if ( numUnits == game.MAX_UNITS_PER_CLASS ) {
                // The only way the code should be able to get here is via a
                // debug function like debugAddUnits, but it doesn't hurt to
                // have this check.
                return;
            }

            game.Player.modifyCoins(-cost);

            // Keep track of where the 'buy' button is so that we can restore
            // that position at the end of this function.
            var oldBuyYPosition = $('#buySlotButton').position().top;
            var containerY = $('#buyingScreenContainer').parent().position().top;

			var newUnit = new game.Unit(this.unitType, game.PlayerFlags.PLAYER, 1);

            if ( numUnits >= 1 && numUnits <= game.MAX_UNITS_PER_CLASS - 1 ) {
                // Modify the appearance of the new unit
                newUnit.graphicIndexes = game.UnitManager.getUnitCostume(this.unitType, -1);
            }

			game.UnitManager.addUnit(newUnit);
			game.UnitPlacementUI.addSlotToPage(newUnit, numUnits);

            // Don't adjust the window position if we're removing the buy
            // buttons.
            if ( numUnits < game.MAX_UNITS_PER_CLASS - 1 ) {
                var newBuyYPosition = $('#buySlotButton').position().top;
                $('#buyingScreenContainer').parent().css( {
                    top: Math.max(0, containerY + oldBuyYPosition - newBuyYPosition)
                });
            }

            this.setBuyIconClass();
        },

        /**
         * Returns the name of a placeable unit. This function is very simple.
         * @param  {game.PlaceableUnitType} unitType - the type whose name you
         * want
         * @return {String}          - the name of that unit type
         */
        getNameOfPlaceableUnit: function(unitType) {
            switch( unitType ) {
                case game.PlaceableUnitType.ARCHER:
                    return 'archer';
                case game.PlaceableUnitType.WARRIOR:
                    return 'warrior';
                case game.PlaceableUnitType.WIZARD:
                    return 'wizard';
                default:
                    return 'Unrecognized unit type: ' + unitType;
            }
        }
    };
}()); 