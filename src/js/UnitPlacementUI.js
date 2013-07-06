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
	 * The amount a slot costs per level
	 * @type {Number}
	 */
	window.game.UNIT_PLACEMENT_SLOT_COST = 500;
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

	/**
	 * Calculates the cost to place the unit
	 * @param  {Unit} unit Unit that can be placed
	 * @return {Number}    Cost to place the unit 
	 */
	function costToPlaceUnit(unit) {
		return (unit.level * 50);
	};

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
         * Computes the cost to buy a slot for the current unit type
         * @return {Number}           Amount that the new slot will cost
         */
        costToPurchaseSlot: function() {
            return game.UNIT_PLACEMENT_SLOT_COST * 
                (game.UnitManager.getNumOfPlayerUnits(this.unitType) + 1);
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
            this.navigateToPage(currentType);
            game.Player.coins = currentCoins;
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

			$('#buyingScreenContainer').dialog({
                autoOpen: false,
                resizable:false,
                autoResize: true,
                width: 260,

                // Wrap the dialog in a span so that it gets themed correctly.
                appendTo:"#unitPlacementDialogThemeSpan",
                hide: {
                    effect: 'fade',
                    duration: 400
                },
    
                // Position the unit placement screen in the center of the canvas
                position: {
                    my: 'center',
                    at: 'center',
                    of: ('#canvas')
                },
            });

            // Sets the default page
            this.setPage(game.PlaceableUnitType.ARCHER);
        },

		/**
		* Figures out the CSS unit class for a specific unit type and returns it. This
		* unit class is used to specify which image in the CSS file to use.
		* @param  {PlaceableUnitType} unitType Type of unit
		* @return {String}          Classes for the particular unit
		*/
		getCSSUnitClass: function(unitType) {
			var unitClass;
			switch (unitType) {
			    case game.PlaceableUnitType.ARCHER:
			        unitClass = 'char-sprite arch32-png';
			        break;
			    case game.PlaceableUnitType.WARRIOR:
			        unitClass = 'char-sprite war32-png';
			        break;
			    case game.PlaceableUnitType.WIZARD:
			        unitClass = 'char-sprite wiz32-png';
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
				this.addSlotToPage(unitArray[i]);
			}
			$('#buyingScreenContainer').append('</div>');

			// Add a button to allow the player to buy a new slot
			$('#buyingScreenContainer').append('<button id="buySlotButton">'+ 
												this.costToPurchaseSlot(this.unitType) +
												'</button>' +
												'<span id=buySlotButtonDescription>- Buy slot</span>');
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
											   '<img id="leftUnit" src="'+game.imagePath+'/img_trans.png" class="' + this.getCSSUnitClass(nextUnitLeftImage) + '" />' +
											   '<span id="leftUnitAmount" style="font-weight: bold; font-size: 20px; margin-right:2.00em">0</span>' +
											   '<span id="rightUnitAmount" style="font-weight: bold; font-size: 20px">0</span>' +
											   '<img id="rightUnit" src="'+game.imagePath+'/img_trans.png" class="' + this.getCSSUnitClass(nextUnitRightImage) + '" />' +
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

            var cost = costToPlaceUnit(unit);
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
            var cost = this.costToPurchaseSlot();
            if ( !game.Player.hasThisMuchMoney(cost) ) {
                $('#buySlotButton').attr('disabled', 'disabled');
            } else {
                $('#buySlotButton').removeAttr('disabled');
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
         */
        addSlotToPage: function(unit) {
            var id = unit.id;

			$('#unitContainer').append('<div id="unit'+id+'">' +
										'<img id="unitImage'+id+'" src="'+game.imagePath+'/img_trans.png" class="'+this.getCSSUnitClass(unit.unitType)+'" />' +
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
                var cost = costToPlaceUnit(unit);
                if (!game.GameStateManager.isNormalGameplay() || unit.hasBeenPlaced || !game.Player.hasThisMuchMoney(cost)) {
                    return;
                }

				unit.placeUnit(game.UnitPlacementUI.spawnPointX, game.UnitPlacementUI.spawnPointY, game.MovementAI.FOLLOW_PATH);
                game.Player.modifyCoins(-cost);
				game.UnitPlacementUI.updateUnit(unit);
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
         * Adds a unit to the UI
         */
        addUnit: function() {
            var cost = this.costToPurchaseSlot();
            if (!game.Player.hasThisMuchMoney(cost)) {
                return;
            }
            game.Player.modifyCoins(-cost);

            // Keep track of where the 'buy' button is so that we can restore
            // that position at the end of this function.
            var oldBuyYPosition = $('#buySlotButton').position().top;
            var containerY = $('#buyingScreenContainer').parent().position().top;

			newUnit = new game.Unit(this.unitType, game.PlayerFlags.PLAYER, 1);
			game.UnitManager.addUnit(newUnit);
			game.UnitPlacementUI.addSlotToPage(newUnit);

            var newBuyYPosition = $('#buySlotButton').position().top;
            $('#buyingScreenContainer').parent().css( {
                top: Math.max(0, containerY + oldBuyYPosition - newBuyYPosition)
            });
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