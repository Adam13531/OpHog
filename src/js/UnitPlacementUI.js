( function() {
    
	/**
     * Defines the types of units that can be placed. These are used to
     * distinguish between the other unit types because these are the only types
     * that can actually be placed by a player
     * @type {game.UnitType}
	 */
	window.game.PlaceableUnitType = {
		ARCHER: game.UnitType.ARCHER,
		WARRIOR: game.UnitType.WARRIOR,
		WIZARD: game.UnitType.WIZARD
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
	 * Computes the cost to buy a slot for a specific unit type
	 * @return {Number}           Amount that the new slot will cost
	 */
	function costToPurchaseSlot() {
		return game.UNIT_PLACEMENT_SLOT_COST * (game.UnitManager.getNumOfPlayerUnits(this.unitType) + 1);
	};

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
         * Sets up the entire unit placement UI.
         */
        setupUI: function() {

			var rightMargin = '18px';
			var buyingScreenContainer = ('<div id="buyingScreenContainer" title="Place Units"></div>');
			$('body').append(buyingScreenContainer);

			// TODO: Load real headers
			$('#buyingScreenContainer').append('<div id="headers" style="width:200px; height:32px;">' +
										'<img id="header1" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite smallDiamond-png' + '" />' +
										'<img id="header2" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite redCube-png' + '" />' +
										'<img id="header3" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite purpleCube-png' + '" />' +
										'<img id="header4" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite greenCube-png' + '" />' +
								   '</div>');
			$('#header1').css({
				'margin-right' : rightMargin
			});
			$('#header2').css({
				'margin-right' : rightMargin
			});
			$('#header3').css({
				'margin-right' : rightMargin
			});
			$('#header4').css({
				'margin-right' : rightMargin
			});

			// Sets the default page
			this.setPage(game.PlaceableUnitType.ARCHER);

			$('#buyingScreenContainer').dialog({
                autoOpen: false,
                resizable:false,
                autoResize: true,
                width: 240,

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
         * Returns the index of the unit that will show when you click the left
         * arrow.
         * Pages are ordered: [0,1,..., Object.keys(game.PlaceableUnitType).length]
         * @return {Number}             Index of the page to the left
         */
        getLeftPage: function() {
            return (this.unitType == 0) ? game.NUM_PLACEABLE_UNIT_CLASSES - 1 : this.unitType - 1;
        },

        /**
         * Returns the index of the unit that will show when you click the right
         * arrow.
         * Pages are ordered: [0,1,..., Object.keys(game.PlaceableUnitType).length]
         * @return {Number}             Index of the page to the right
         */
        getRightPage: function() {
            return (this.unitType == game.NUM_PLACEABLE_UNIT_CLASSES - 1) ? 0 : this.unitType + 1;
        },

        /**
         * Allows the user to place units and buy slots for all the units of the
         * specified unit type.
         * @param {PlaceableUnitType} unitType Type of unit
         */
        setPage: function(unitType) {
			
			this.unitType = unitType;
			var unitArray = game.UnitManager.getUnits(this.unitType);
			
			$('#buyingScreenContainer').append('<div id="unitContainer">');
			for (var i = 0; i < unitArray.length; i++) {
				this.addSlotToPage(unitArray[i]);
			}
			$('#buyingScreenContainer').append('</div>');

			// Add a button to allow the player to buy a new slot
			$('#buyingScreenContainer').append('<button id="buySlotButton">'+ 
												costToPurchaseSlot(this.unitType) +
												'</button>' +
												'<span id=buySlotButtonDescription>- Buy slot</span>');
			$('#buySlotButton').click(function() {
				game.UnitPlacementUI.addUnit(this.unitType);
			});

			$('#buySlotButtonDescription').click(function() {
				game.UnitPlacementUI.addUnit(this.unitType);
			});

			// Setting up the arrows and images that will allow the user to
			// switch units.
			var nextUnitLeftImage = this.getLeftPage();
			var nextUnitRightImage = this.getRightPage();

			$('#buyingScreenContainer').append('<div id="changingPagesDiv">' +
											   '<img id="leftArrowImg" src="'+game.imagePath+'/left_arrow.png" width="32" height="32"/>' +
											   '<img id="leftUnit" src="'+game.imagePath+'/img_trans.png" class="' + this.getCSSUnitClass(nextUnitLeftImage) + '" />' +
											   '<span id="leftUnitAmount" style="font-weight: bold; font-size: 20px">' + game.UnitManager.getNumOfPlayerUnits(nextUnitLeftImage)+'</span>' +
											   '<span id="pageSpace" style="margin-right:2.00em; display:inline-block;">&nbsp;</span>' + // There is probably a better way to add a space between spans
											   '<span id="rightUnitAmount" style="font-weight: bold; font-size: 20px">' + game.UnitManager.getNumOfPlayerUnits(nextUnitRightImage)+'</span>' +
											   '<img id="rightUnit" src="'+game.imagePath+'/img_trans.png" class="' + this.getCSSUnitClass(nextUnitRightImage) + '" />' +
											   '<img id="rightArrowImg" src="'+game.imagePath+'/right_arrow.png" width="32" height="32"/>' +
											   '</div>');
			$('#leftArrowImg').click(function() {
				game.UnitPlacementUI.clearPage();
				game.UnitPlacementUI.setPage(nextUnitLeftImage);
			});
			$('#rightArrowImg').click(function() {
				game.UnitPlacementUI.clearPage();
				game.UnitPlacementUI.setPage(nextUnitRightImage);
			});

        },

        /**
         * Adds a slot to the page
         * @param {Unit} unit  Unit that will be in the slot
         */
        addSlotToPage: function(unit) {
            var id = unit.id;
			$('#unitContainer').append('<div id="unit'+id+'">' +
										'<img id="unitImage'+id+'" src="'+game.imagePath+'/img_trans.png" class="' + this.getCSSUnitClass(unit.unitType) + '" />' +
										'<span id="unitCost'+id+'" style="font-weight: bold; font-size: 20px">'+costToPlaceUnit(unit)+'</span>' +
										'<span id="unitLevel'+id+'" style="font-weight: bold; font-size: 20px">'+unit.level+'</span>' +
										'<span id="unitExperience'+id+'" style="font-weight: bold; font-size: 20px">'+unit.experience+'</span>' +
								   '</div>');

			// If the user clicks a unit, place the unit if it hasn't been placed
			$('#unit'+id).click({unitClicked: unit}, unitClicked);
			function unitClicked(event) {
                var unit = event.data.unitClicked;
				if (unit.hasBeenPlaced) {
					return;
				}
				unit.placeUnit(game.UnitPlacementUI.spawnPointX, game.UnitPlacementUI.spawnPointY);
				game.UnitPlacementUI.setUnitCSSProperties(unit.id, game.UNIT_OPACITY_PLACED);
			}

			if (unit.hasBeenPlaced) {
				this.setUnitCSSProperties(id, game.UNIT_OPACITY_PLACED);
			} else {
				this.setUnitCSSProperties(id, game.UNIT_OPACITY_NOT_PLACED);
			}

			// Update the text of the button to show the new cost of buying
			// this unit
			$('#buySlotButton').text(costToPurchaseSlot(unit.unitType));
        },

        /**
         * Sets some CSS properties of a specific unit.
         * @param {Number} id   id of the unit in the window
         * @param {Number} opacity The opacity to set the unit and its stats to
         */
        setUnitCSSProperties: function(id, opacity) {
        	var unitMargin = '30px';

            // Set the margin on all of the following at once
			$('#unitImage' + id + ',#unitCost' + id + ',#unitLevel' + id + 
		     ',#unitExperience' + id).css({'margin-right':unitMargin, 'opacity': opacity});
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
			newUnit = new game.Unit(this.unitType, true);
			game.UnitManager.addUnit(newUnit);
			game.UnitPlacementUI.addSlotToPage(newUnit, game.UnitManager.getNumOfPlayerUnits(this.unitType));
        },
    };
}()); 