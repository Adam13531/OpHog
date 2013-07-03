( function() {

    window.game.MinigameUI = {

        numDifficulties: 5,

        /**
         * Sets up the entire quest UI.
         */
        setupUI: function() {
            $('#minigame-ui').dialog({
                autoOpen: false, 

                // Set a reasonable width
                width:400,

                height:425,
                resizable:false,

                // Wrap the dialog in a span so that it gets themed correctly.
                appendTo:"#minigameUIThemeSpan",

                // Fade in very quickly
                show: {
                    effect: 'fade',
                    duration: 150
                },

                // Position at the center of the canvas
                position: {
                    my: 'center',
                    at: 'center',
                    of: ('#canvas')
                },
                
            });

            var heightPercent = Math.floor(100 / this.numDifficulties) - 2;

            for (var i = 0; i < this.numDifficulties; i++) {
                // The ID of the div
                var thisMinigameID = 'minigame' + i;

                // The css to set, which we conditionally add to
                var cssToSet = {
                    'border':'1px solid',
                    'border-color':'#004400',
                    'height':heightPercent + '%'
                };

                // Don't add a margin-bottom to the last quest since it's
                // already at the bottom of the UI
                if ( i < this.numDifficulties - 1 ) {
                    cssToSet['margin-bottom'] = '2px';
                }
                $('#minigame-ui').append('<div id="' + thisMinigameID + '"></div>');
                // $('#' + thisMinigameID).append('<img src="'+game.imagePath+'/img_trans.png" style="" class="' + 'char-sprite wiz32-png' + '"/>');
                $('#' + thisMinigameID).append('<img src="' + charSheet.getLargeSpriteData(2, false) + '"/>');
                $('#' + thisMinigameID).css(cssToSet);
                $('#' + thisMinigameID).click(function() {
                    game.GameStateManager.enterMinigameGameplay();
                });
            };
        },

        show: function() {
            $('#minigame-ui').dialog('open');
        },
        hide: function() {
            $('#minigame-ui').dialog('close');
        }

    };
}()); 