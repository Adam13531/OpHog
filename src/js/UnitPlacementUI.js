( function() {
    
	/**
	 * Defines the types of units. This will msot likely be refactored out,
	 * but that will be done in another branch.
	 * @type {UnitType}
	 */
	window.game.UnitType = {
		ARCHER: 0,
		WARRIOR: 1,
		WIZARD: 2
	};

	window.game.UNIT_MARGIN = '30px';
	window.game.SLOT_COST = 500;
	window.game.unitOpacity = '1.0';

	// "Private" functions (These should only be accessible in this file)
    
    /**
	 * Multiplies a minimum amount of money by the amount of a certain type
	 * of units to by in order to calculate how much a new slot will cost
	 * for that unit type
	 * @param  {UnitType} unitType Type of unit
	 * @return {Number}           Amount that the new slot will cost
	 */
	function costToPurchaseSlot(unitType) {
		if (game.UnitManager.getNumOfPlayerUnits(unitType) == 0) {
			return game.SLOT_COST; 
		}
		else {
			return (game.SLOT_COST * game.UnitManager.getNumOfPlayerUnits(unitType) + game.SLOT_COST);
		}
	};

	/**
	 * Calculates the cost to place the unit
	 * @param  {Unit} unit Unit that can be placed
	 * @return {Number}    Cost to place the unit 
	 */
	function costToPlaceUnit(unit) {
		return (unit.level * 50);
	}

    // There's only one unit placement UI, so we'll define everything in a single
    // object.
    window.game.UnitPlacementUI = {
		
		/**
         * Sets up the entire unit placement UI.
         */
        setupUI: function() {

			var rightMargin = '18px';
			var buyingScreenContainer = $('<div id="buyingScreenContainer" style="border:1px solid;"></div>');
			$('body').append(buyingScreenContainer);

			// TODO: Load real headers
			$('#buyingScreenContainer').append('<div id="headers" style="width:200px; height:32px;">' +
										'<img id="header1" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite smallDiamond-png' + '" />' +
										'<img id="header2" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite redCube-png' + '" />' +
										'<img id="header3" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite purpleCube-png' + '" />' +
										'<img id="header4" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite greenCube-png' + '" />' +
								   '</div>');
			$('#header1').css({
				"margin-right" : rightMargin
			});
			$('#header2').css({
				"margin-right" : rightMargin
			});
			$('#header3').css({
				"margin-right" : rightMargin
			});
			$('#header4').css({
				"margin-right" : rightMargin
			});

			// Sets the default page
			this.setPage(window.game.UnitType.ARCHER);

			var $canvas = $('#canvas');
			var width = $canvas.width();
			var canvasPos = $canvas.position();

			// Position the buying screen based on the div
			$('#buyingScreenContainer').css({
				position : 'absolute',
				top : canvasPos.top + 'px',
				left : (canvasPos.left + width + 5) + 'px'
			});
        },

        /**
         * Allows the user to place units and buy slots for all the units of the
         * specified unit type.
         * @param {UnitType} unitType Type of unit
         */
        setPage: function(unitType) {
			
			var unitArray = game.UnitManager.getUnits(unitType);
			
			$('#buyingScreenContainer').append('<div id="pageContainer">');
			for (var i = 0; i < unitArray.length; i++) {
				this.addSlotToPage(unitArray[i], i);
			}
			$('#buyingScreenContainer').append('</div>');

			// Add a button to allow the player to buy a new slot
			$('#buyingScreenContainer').append('<button id="buySlotButton">'+ 
												costToPurchaseSlot(unitType) +
												'</button> - Buy archer slot');
			$('#buySlotButton').click(function() {
				newUnit = new game.Unit(1,9,unitType,true);
				game.UnitManager.addUnit(newUnit);
				game.UnitPlacementUI.addSlotToPage(newUnit, game.UnitManager.getNumOfPlayerUnits(unitType));
			});
        },

        /**
         * Adds a slot to the page
         * @param {Unit} unit  Unit that will be in the slot
         * @param {Number} index Used for indexing the units
         */
        addSlotToPage: function(unit, index) {
			$('#pageContainer').append('<div id="unit'+index+'">' +
										'<img id="unitImage'+index+'" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite arch32-png' + '" />' +
										'<span id="unitCost'+index+'" style="font-weight: bold; font-size: 20px">'+costToPlaceUnit(unit)+'</span>' +
										'<span id="unitLevel'+index+'" style="font-weight: bold; font-size: 20px">'+unit.level+'</span>' +
										'<span id="unitExperience'+index+'" style="font-weight: bold; font-size: 20px">'+unit.experience+'</span>' +
								   '</div>');

			$('#unit'+index).click(function() {
				//TODO: Make this do something
			});

			// TODO: Make sure opacity changes when the unit gets revived
			// or dies
			if (!unit.isLiving)
			{
				game.unitOpacity = '0.4';
			}
			$('#unitImage'+index).css({
				"margin-right" : game.UNIT_MARGIN,
				"opacity"	   : game.unitOpacity
			});
			$('#unitCost'+index).css({
				"margin-right" : game.UNIT_MARGIN,
				"opacity"	   : game.unitOpacity
			});
			$('#unitLevel'+index).css({
				"margin-right" : game.UNIT_MARGIN,
				"opacity"	   : game.unitOpacity
			});
			$('#unitExperience'+index).css({
				"margin-right" : game.UNIT_MARGIN,
				"opacity"	   : game.unitOpacity
			});

			// Update the text of the button to show the new cost of buying
			// this unit
			$('#buySlotButton').text(costToPurchaseSlot(unit.unitType));
        },
    };
}()); 