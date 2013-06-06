( function() {

    /**
     * The quest UI shows you which quests you've got and their progress.
     */
    window.game.QuestUI = {

        /**
         * Sets up the entire quest UI.
         */
        setupUI: function() {
            $('#quest-ui').dialog({
                autoOpen: false, 

                // Set a reasonable width
                width:400,

                height:250,
                resizable:false,

                // Wrap the dialog in a span so that it gets themed correctly.
                appendTo:"#questUIDialogThemeSpan",

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

            // Set up each quest div
            for (var i = 0; i < game.MAX_QUESTS; i++) {
                // The ID of the div
                var thisQuestID = 'quest' + i;

                // The css to set, which we conditionally add to
                var cssToSet = {
                    'border':'1px solid',
                    'border-color':'#004400',
                    'height':'31%'
                };

                // Don't add a margin-bottom to the last quest since it's
                // already at the bottom of the UI
                if ( i < game.MAX_QUESTS - 1 ) {
                    cssToSet['margin-bottom'] = '2px';
                }

                $('#quest-ui').append('<div id="' + thisQuestID + '"></div>');
                $('#' + thisQuestID).css(cssToSet);
            };

            // Set the appropriate text on our now-null quests
            this.updateQuests();
        },

        /**
         * Calls updateQuest on each quest, that's it.
         * @return {null}
         */
        updateQuests: function() {
            for (var i = 0; i < game.MAX_QUESTS; i++) {
                this.updateQuest(i);
            };
        },

        /**
         * Updates the text for a quest in the UI.
         * @param {Number} questSlotNumber - the quest's questSlotNumber. We
         * don't pass a Quest here because it might be null, and then we won't
         * know which div to update. At one point, I had this function take a
         * Quest (optional) and a Number (optional unless Quest is null). That
         * was messy.
         * @return {null}
         */
        updateQuest: function(questSlotNumber) {
            var quest = game.QuestManager.getQuest(questSlotNumber);

            var text;
            var color;
            var selector = '#quest' + questSlotNumber;
            
            if ( quest == null ) {
                text = 'Quest ' + questSlotNumber + ' - you do not have a quest here';
                color = '#bbb';
            } else {
                text = quest.getDescription();
                color = '#fff';
            }
            $(selector).text(text);
            $(selector).css({
                'color': color
            });
        }

    };
}()); 