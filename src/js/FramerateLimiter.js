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
     * We don't have access to hardware specs, so we have to get clever in order
     * to figure out whether the user should be in low-graphics mode or not.
     *
     * This class is in charge of blitting tons of stuff to the screen to
     * figure out a graphicsScore. Higher scores are better and are roughly an
     * indication of how much can be rendered.
     *
     * The amount of graphics it blits is computed via a binary search.
     *
     * The graphicsScore is ONLY computed a single time. After that, it's stored
     * in the save file, and the user can at any time switch graphics modes.
     */
    window.game.FramerateLimiter = {

        /**
         * Whether or not we're going through the test for graphicsScore.
         * @type {Boolean}
         */
        calculatingScore: false,

        /**
         * The number of frames that calculatingScore has been true.
         * @type {Number}
         */
        numFrames: 0,

        /**
         * The number of seconds that calculatingScore has been true.
         * @type {Number}
         */
        frameSeconds: 0,

        /**
         * Your graphicsScore. See the class-level comments.
         * @type {Number}
         */
        graphicsScore: 2000,

        /**
         * The FPS we're getting while calculatingScore is true.
         * @type {Number}
         */
        fps: -1,

        /**
         * Loads the graphics score or computes it here.
         */
        initialize: function() {
            var alreadyComputedGraphicsScore = game.GameDataManager.loadFrameLimiterState();

            // No need to take any other action since the graphicsScore is only
            // a means to find out which graphics mode we should be in, which
            // the GameDataManager will take care of loading for us.
            this.calculatingScore = !alreadyComputedGraphicsScore;
        },

        /**
         * Figures out whether we're done calculating.
         * @param  {Number} delta - number of ms passed since the last time this
         * was called.
         */
        update: function(delta) {
            if ( !this.calculatingScore ) return;

            var TARGET_FPS = 25;
            var FRAMES_BEFORE_HALVING = 10;
            var NUM_SECONDS_TO_SUSTAIN = 2;

            this.numFrames++;
            this.frameSeconds += delta / 1000.0;
            this.fps = this.numFrames / this.frameSeconds;

            // If they can sustain the target framerate for long enough, then
            // they're done.
            if ( this.fps >= TARGET_FPS && this.frameSeconds >= NUM_SECONDS_TO_SUSTAIN ) {
                this.finalizeGraphicsScore();
            } else {
                // Give them at least FRAMES_BEFORE_HALVING frames before toning
                // down the search.
                if ( this.fps < TARGET_FPS && this.numFrames >= FRAMES_BEFORE_HALVING ) {
                    // Start again with fewer graphics
                    this.graphicsScore /= 2;
                    this.numFrames = 0;
                    this.frameSeconds = 0;
                    this.fps = 0;

                    // Call it off, their computer sucks. No need to go all the
                    // way to 1 because if your computer can't handle the extra
                    // 16 graphics, then there's no way you're getting high-
                    // graphics mode.
                    if ( this.graphicsScore <= 16 ) {
                        this.finalizeGraphicsScore();
                        return;
                    }
                }
            }
        },

        /**
         * Leave calculation mode and set the graphics appropriately.
         */
        finalizeGraphicsScore: function() {
            this.calculatingScore = false;
            console.log('Your graphics score was just computed. FPS: ' + this.fps + ' graphics score: ' + this.graphicsScore);
            if ( this.graphicsScore < 250 ) {
                game.graphicsUtil.setGraphicsSettings(game.GraphicsSettings.LOW);
            } else {
                game.graphicsUtil.setGraphicsSettings(game.GraphicsSettings.HIGH);
            }
        },

        draw: function(ctx) {
            if ( !this.calculatingScore ) return;

            // Draw transparent rectangles, not that you should see these anyway
            // since this should draw lower than the map.
            for (var i = 0; i < this.graphicsScore; i++) {
                ctx.fillStyle = 'rgba(0, 0, 0, .0001)';
                ctx.fillRect(0,0,32,32);
            };
        },
    };

    game.FramerateLimiter.initialize();

}()); 