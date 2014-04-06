/*
 * OpHog - https://github.com/Adam13531/OpHog
 * Copyright (C) 2014  Adam Damiano
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
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
                    of: game.$canvas
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
         * This will set all dialogs' fade-in and fade-out times. If the dialog
         * didn't already have one of those times, it will remain instantaneous.
         * @param {Boolean} isInstantaneous - if true, this will set both the
         * fade-in and fade-out to 0. Otherwise, it will set it to the global
         * constants.
         */
        setAllDialogFadeInOutTime: function(isInstantaneous) {
            for (var i = 0; i < this.$dialogs.length; i++) {
                var thisDialog = this.$dialogs[i];

                var show = thisDialog.dialog('option', 'show');
                if ( show != null ) {
                    show.duration = isInstantaneous ? 0 : game.DIALOG_SHOW_MS;
                }
                
                var hide = thisDialog.dialog('option', 'hide');
                if ( hide != null ) {
                    hide.duration = isInstantaneous ? 0 : game.DIALOG_HIDE_MS;
                }
            };
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