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
         * This is the Y coordinate (in pixels, relative to the unit placement
         * UI) of the left arrow (which should also be the Y coordinate of the
         * right arrow because they're on the same level). We keep track of it
         * so that when we switch pages, we can maintain the position of the
         * arrows.
         * @type {Number}
         */
        lastYPosition: null,
		
		/**
         * Sets up the entire unit placement UI.
         */
        setupUI: function() {

			var rightMargin = '18px';
			var buyingScreenContainer = ('<div id="buyingScreenContainer" title="Place Units"></div>');
			$('body').append(buyingScreenContainer);

			// TODO: Load real headers
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
											   '<span id="leftUnitAmount" style="font-weight: bold; font-size: 20px; margin-right:2.00em">' + game.UnitManager.getNumOfPlayerUnits(nextUnitLeftImage)+'</span>' +
											   '<span id="rightUnitAmount" style="font-weight: bold; font-size: 20px">' + game.UnitManager.getNumOfPlayerUnits(nextUnitRightImage)+'</span>' +
											   '<img id="rightUnit" src="'+game.imagePath+'/img_trans.png" class="' + this.getCSSUnitClass(nextUnitRightImage) + '" />' +
											   '<img id="rightArrowImg" src="'+game.imagePath+'/right_arrow.png" width="32" height="32"/>' +
											   '</div>');
			$('#leftArrowImg').click(function() {
                game.UnitPlacementUI.lastYPosition = $('#leftArrowImg').position().top;
				game.UnitPlacementUI.clearPage();
				game.UnitPlacementUI.setPage(nextUnitLeftImage);
			});
			$('#rightArrowImg').click(function() {
                game.UnitPlacementUI.lastYPosition = $('#leftArrowImg').position().top;
				game.UnitPlacementUI.clearPage();
				game.UnitPlacementUI.setPage(nextUnitRightImage);
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

        },

        /**
         * Updates this unit's statistics.
         * @param  {Unit} unit - the unit to update
         * @return {null}
         */
        updateUnit: function(unit) {
        	var $costTag = $('#unitCost' + unit.id);
        	var $levelTag = $('#unitLevel' + unit.id);
        	var $expTag = $('#unitExperience' + unit.id);

        	// Make sure that each tag exists. As of the time that I'm writing
        	// this, there are lots of debug ways to spawn units, but if we
        	// allow summoned units to level up, this code will have a real
        	// scenario that necessitates its existence
        	if ( $costTag.length == 0 || $levelTag.length == 0 || $expTag.length == 0 ) return;

        	$costTag.text(costToPlaceUnit(unit));
        	$levelTag.text(unit.level);
        	$expTag.text(unit.experience);
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