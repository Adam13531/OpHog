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
     * Making a JQuery UI object out of books allows us to worry about content
     * and not presentation (HTML/CSS cover the presentation for us). Before
     * this, I was using a custom-built textbox class, but then I needed to
     * reflow text, handle backgrounds/colors, etc.
     * @type {Object}
     */
    window.game.BookDialog = {

        /**
         * The JQuery selector for the dialog.
         * @type {Object}
         */
        $bookDialog : null,

        /**
         * Sets up the entire book UI.
         */
        setupUI: function() {
            this.$bookDialog = $('#book-ui');
            this.$bookDialog.dialog({
                autoOpen: false,

                // Set a reasonable width
                width: 400,

                // Auto-size the height
                height:'auto',
                resizable:false,

                // Wrap the dialog in a span so that it gets themed correctly.
                appendTo:"#bookUIDialogThemeSpan",

                // Fade in very quickly
                show: {
                    effect: 'fade',
                    duration: game.DIALOG_SHOW_MS
                },

                // Position at the center of the canvas
                position: {
                    my: 'center',
                    at: 'center',
                    of: game.$canvas
                },

                close: function( event, ui ) {
                    game.BookManager.stopReadingBook();
                },
    
            });
            
            game.DialogManager.addDialog(this.$bookDialog);
        },

        setTitle: function(title) {
            this.$bookDialog.dialog('option', 'title', title);
        },
        setHtml: function(html) {
            this.$bookDialog.html(html);
        },
        show: function() {
            this.$bookDialog.dialog('open');
        },
        hide: function() {
            this.$bookDialog.dialog('close');
        }

    };
}()); 