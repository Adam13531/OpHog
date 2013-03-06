( function() {
    
    // There's only one unit placement UI, so we'll define everything in a single
    // object.
    window.game.UnitPlacementUI = {
		
		/**
         * Sets up the entire unit placement UI.
         */
        setupUI: function() {

        	// HTML div help: http://www.w3schools.com/html/html_layout.asp
			// TODO: 
			// - Make the headers have a little bit of padding
			// - Find out how to make a "template" that I could reuse for the player's characters
			// 		(so I can use a for loop)
			var rightMargin = '18px';
			var buyingScreenContainer = $('<div id="buyingScreenContainer" style="border:1px solid; cursor:none;"></div>');
			$('body').append(buyingScreenContainer);
			$('#buyingScreenContainer').append('<div id="headers" style="cursor:none; width:200px; height:32px;">' +
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

			// TODO: Make the loop go for the max size of characters
			var unitMargin = '30px';
			var unitOpacity = '1.0';
			for (var i = 0; i < 4; i++) {
				$('#buyingScreenContainer').append('<br>' +
												'<div id="unit'+i+'" style="cursor:none;">' +
													'<img id="unitImage'+i+'" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite arch32-png' + '" />' +
													'<span id="unitCost'+i+'" style="font-weight: bold; font-size: 20px">50</span>' +
													'<span id="unitLevel'+i+'" style="font-weight: bold; font-size: 20px">5</span>' +
													'<span id="unitExperience'+i+'" style="font-weight: bold; font-size: 20px">94</span>' +
												'</div>');
				// TODO: Change opacity when the unit is already placed and 
				// change it back when the unit is killed or removed
				if (i == 3)
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

			var $canvas = $('#canvas');
			var width = $canvas.width();
			var canvasPos = $canvas.position();
			// Position the buying screen based on the div
			$('#buyingScreenContainer').css({
				position : 'absolute',
				top : canvasPos.top + 'px',
				left : (canvasPos.left + width + 5) + 'px'
			});

			// var buyingScreen = new Image();
			// buyingScreen.src = game.imagePath + '/buying_screen.PNG';
			// // window.game.util.debugDisplayText(buyingScreen.src);
			// buyingScreen.onload = function() {
				
			// }


			// draw the characters
			// window.playersCharacters.length => gets the length of the array
			// for (var i = 0; i < window.playersCharacters.length; i++) {

			// }
        }
    };
}()); 