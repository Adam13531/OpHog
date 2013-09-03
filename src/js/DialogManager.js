( function() {

    /**
     * The dialog manager keeps track of each JQueryUI dialog.
     */
    window.game.DialogManager = {

        /**
         * All of the dialogs (JQuery UI objects).
         * @type {Array:Object}
         */
        $dialogs: new Array(),

        /**
         * Adds a dialog to be kept track of.
         * @param {Object} $dialog - a JQuery UI dialog object.
         */
        addDialog: function($dialog) {
            this.$dialogs.push($dialog);
        },

        /**
         * If the dialog is offscreen, this will center it.
         * @param {Object} $dialog - a JQuery UI dialog object.
         */
        rescueDialogIfOffscreen: function($dialog) {
            var browserWidth = $(window).width();
            var browserHeight = $(window).height();

            var dialogWidth = $dialog.dialog( 'option', 'width' );
            var dialogHeight = $dialog.dialog( 'option', 'height' );

            var position = $dialog.offset();
            var dialogX = position.left;
            var dialogY = position.top;
            var dialogRight = dialogX + dialogWidth;
            var dialogBottom = dialogY + dialogHeight;

            // We check if Y is less than 0 and not bottom because you drag
            // dialogs from the top, not the bottom.
            if ( dialogY < 0 || dialogRight < 0 || dialogX > browserWidth || dialogBottom > browserHeight ) {
                $dialog.dialog( 'option', 'position', {
                    my: 'center',
                    at: 'center',
                    of: $('#canvas')
                });
            }
        },

        /**
         * Set the 'closeOnEscape' property of all dialogs. We do this so that
         * 'escape' can be used for other functions without closing dialogs,
         * e.g. exiting USE mode.
         * @param {Boolean} enabled - 'closeOnEscape' is set to whatever this
         * is.
         */
        setCloseOnEscape: function(enabled) {
            for (var i = 0; i < this.$dialogs.length; i++) {
                this.$dialogs[i].dialog('option', 'closeOnEscape', enabled);
            };

            // The minigame UI shouldn't ever be closeable.
            $('#minigame-ui').dialog('option', 'closeOnEscape', false);
        },

        /**
         * When the browser size changes, call this function. It will make sure
         * that all dialogs are still on-screen.
         */
        browserSizeChanged: function() {
            for (var i = 0; i < this.$dialogs.length; i++) {
                this.rescueDialogIfOffscreen(this.$dialogs[i]);
            };
        }

    };
}()); 