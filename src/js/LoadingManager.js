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
     * This is purely a global (i.e. not in game.LoadingManager) so that this
     * file can be loaded ASAP. We could put this in window.game if we defined
     * window.game here, but I think having this be global is fine.
     * @type {Object}
     */
    window.LoadingManager = {

        /**
         * Turn the progress bar into an actual progress bar.
         */
        initialize: function() {
            var browserWidth = $(window).width();
            var $progressBar = $('#loadProgress');
            var $progressLabel = $('#progressLabel');

            // On small browsers, we need to shrink the progress bar.
            if ( browserWidth < 750 ) {
                $progressLabel.css({
                    'font-size': '1em'
                });
                $progressBar.css({
                    'height': '50px'
                });
            }

            $progressBar.progressbar({
                value: false,
                change: function() {
                    var val = $progressBar.progressbar( 'value' );
                    val = Math.min(100, Math.round(val));

                    $progressLabel.text( 'Loading: ' + val + '%' );
                },
                complete: function() {
                    $('#loadingDiv').remove();
                }
            });

            // Show it now that it's been themed.
            $progressBar.show();
        },

        /**
         * Add progress to the bar. The amount we add is hard-coded since it's
         * based on the number of times we call addProgress.
         */
        addProgress: function() {
            // See function-level comments.
            var NUM_TIMES_THIS_IS_CALLED = 12;

            var $progressBar = $('#loadProgress');
            var val = $progressBar.progressbar( 'value' ) || 0;

            var increment = 100 / NUM_TIMES_THIS_IS_CALLED;
            $progressBar.progressbar( 'value', val + increment );
        }

    };

    LoadingManager.initialize();

}()); 