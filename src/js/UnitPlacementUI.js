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
			var buyingScreenContainer = $('<div id="buyingScreenContainer" style="border:1px solid; cursor:none; width:200px; height:300px;"></div>');
			$('body').append(buyingScreenContainer);
			$('#buyingScreenContainer').append('<div id="headers" style="border:1px solid; cursor:none; width:200px; height:32px;">' +
													'<img id="header1" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite smallDiamond-png' + '" />' +
													'<img id="header2" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite redCube-png' + '" />' +
													'<img id="header3" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite purpleCube-png' + '" />' +
													'<img id="header4" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite greenCube-png' + '" />' +
												'</div>' +
												'<br>' +
												'<div id="unit1" style="cursor:none; width:200px; height:32px;">' +
													'<img id="unitImage1" src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite arch32-png' + '" />' +
													'<span id="unitCost1" style="font-weight: bold; font-size: 20px">50</span>' +
													'<span id="unitLevel1" style="font-weight: bold; font-size: 20px">50</span>' +
													'<span id="unitExperience1" style="font-weight: bold; font-size: 20px">50</span>' +
												'</div>');

			// TODO: Put these in a loop
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

			// Numbers need more spacing than images because they're not as wide
			var unitMargin = '25px';
			$('#unitImage1').css({
				"margin-right" : unitMargin
			});
			$('#unitCost1').css({
				"margin-right" : unitMargin
			});
			$('#unitLevel1').css({
				"margin-right" : unitMargin
			});
			$('#unitExperience1').css({
				"margin-right" : unitMargin
			});

			// $('#buyingScreenContainer').append('<img src="img/img_trans.png" class="' + 'char-sprite arch32-png' + '" />');

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
			for (var i = 0; i < window.playersCharacters.length; i++) {

			}
        }
    };
}()); 