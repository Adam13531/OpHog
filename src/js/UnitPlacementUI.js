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

	// "Private" functions (These should only be accessible in this file)
    
    /**
	 * Multiplies a minimum amount of money by the amount of a certain type
	 * of units to by in order to calculate how much a new slot will cost
	 * for that unit type
	 * @param  {UnitType} unitType Type of unit
	 * @return {Number}           Amount that the new slot should cost
	 */
	function costToPurchaseSlot(unitType) {
		return (500 * game.UnitManager.getNumOfPlayerUnits(unitType));
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

			// TODO: This is test code
			// archers
			game.UnitManager.addUnit(new game.Unit(1,9,game.UnitType.ARCHER,true));
			game.UnitManager.addUnit(new game.Unit(1,9,game.UnitType.ARCHER,true));
			game.UnitManager.addUnit(new game.Unit(1,9,game.UnitType.ARCHER,true));
			game.UnitManager.addUnit(new game.Unit(1,9,game.UnitType.ARCHER,true));
			// warriors
			game.UnitManager.addUnit(new game.Unit(1,9,game.UnitType.WARRIOR,true));
			game.UnitManager.addUnit(new game.Unit(1,9,game.UnitType.WARRIOR,true));

			var unitMargin = '30px';
			var unitOpacity = '1.0';
			
			var unitArray = game.UnitManager.getUnits(window.game.UnitType.ARCHER);
			
			for (var i = 0; i < unitArray.length; i++) {
				$('#buyingScreenContainer').append('<div id="unit'+i+'">' +
														'<img id="unitImage'+i+'" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite arch32-png' + '" />' +
														'<span id="unitCost'+i+'" style="font-weight: bold; font-size: 20px">'+costToPlaceUnit(unitArray[i])+'</span>' +
														'<span id="unitLevel'+i+'" style="font-weight: bold; font-size: 20px">'+unitArray[i].level+'</span>' +
														'<span id="unitExperience'+i+'" style="font-weight: bold; font-size: 20px">'+unitArray[i].experience+'</span>' +
												   '</div>');
				// TODO: Change opacity when the unit is already placed and 
				// change it back when the unit is killed or removed
				if (!unitArray[i].isLiving)
				{
					unitOpacity = '0.4';
				}
				$('#unitImage'+i).css({
					"margin-right" : unitMargin,
					"opacity"	   : unitOpacity
				});
				$('#unitCost'+i).css({
					"margin-right" : unitMargin,
					"opacity"	   : unitOpacity
				});
				$('#unitLevel'+i).css({
					"margin-right" : unitMargin,
					"opacity"	   : unitOpacity
				});
				$('#unitExperience'+i).css({
					"margin-right" : unitMargin,
					"opacity"	   : unitOpacity
				});
			}

			// Add a button to allow the player to buy a new slot
			$('#buyingScreenContainer'). append('<button id="buySlotButton">'+ 
												costToPurchaseSlot(window.game.UnitType.ARCHER) +
												'</button> - Buy archer slot');
			$('#buySlotButton').click(function() {
				// var id = game.UnitManager.getNumOfPlayerUnits(window.game.UnitType.ARCHER);
				// $('#buyingScreenContainer').append('<div id="unit'+id+
				// 									);
			});

			var $canvas = $('#canvas');
			var width = $canvas.width();
			var canvasPos = $canvas.position();

			// Position the buying screen based on the div
			$('#buyingScreenContainer').css({
				position : 'absolute',
				top : canvasPos.top + 'px',
				left : (canvasPos.left + width + 5) + 'px'
			});
        }
    };
}()); 