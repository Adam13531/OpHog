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
                var quest = game.QuestManager.getQuest(i);
                this.updateQuest(quest, i);
            };
        },

        /**
         * Updates the text for a quest in the UI.
         * @param {Quest} quest - the quest to update
         * @param {Number} questSlotNumber - if Quest is null, then you have to
         * pass this in so that we update the correct div, otherwise this is
         * ignored and can be undefined.
         * @return {null}
         */
        updateQuest: function(quest, questSlotNumber) {
            if ( quest != null ) questSlotNumber = quest.questSlotNumber

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