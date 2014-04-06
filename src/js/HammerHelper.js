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
     * This entire class exists because there's no way to tell if a 'release'
     * event from Hammer happened at the end of a 'drag' or 'transform' event,
     * so there were lots of bugs where you would try panning the map and you'd
     * accidentally use an item or close the unit placement UI.
     *
     * This helper is shared by every implementer of drag or transform because
     * it's safe to do so - a dragstart on one canvas will not trigger 'release'
     * on another canvas.
     * @type {Object}
     */
    window.game.HammerHelper = {
        /**
         * This represents whether you're currently dragging.
         * @type {Boolean}
         */
        hammerDragging: false,

        /**
         * If this is true, then hammerDragging will be reset on the next update
         * loop. We can't reset it immediately because 'release' always seems to
         * be called after 'dragend'.
         * @type {Boolean}
         */
        hammerResetDragging: false,

        /**
         * This represents whether you're currently transforming.
         * @type {Boolean}
         */
        hammerTransforming: false,
        
        /**
         * See hammerResetDragging.
         * @type {Boolean}
         */
        hammerResetTransforming: false,

        /**
         * @return {Function} - a simple function that sets hammerResetDragging
         * to true.
         */
        getResetDraggingHandler: function() {
            // Enclose 'this' in the returned function.
            var hammerHelper = this;

            return function(event) {
                hammerHelper.hammerResetDragging = true;
            };
        },

        /**
         * Registers both dblclick AND Hammer's doubletap so that this works
         * with mouse AND touch.
         * @param  {Object} $selector      - the JQuery selector corresponding
         * to the DOM element where you want to register this handle
         * @param  {Function} functionToCall - the function to call when you
         * double click/tap
         */
        registerDoubleClickAndDoubleTap: function($selector, functionToCall) {
            $selector.dblclick(functionToCall);

            // Prevent the default of most browsers where it would zoom in.
            var hammertime = $selector.hammer({prevent_default:true});
            hammertime.on('doubletap', functionToCall );
        },

        /**
         * See registerDoubleClickAndDoubleTap.
         */
        registerClickAndTap: function($selector, functionToCall) {
            $selector.click(functionToCall);

            // This will prevent you from being able to scroll the page by
            // dragging.
            var hammertime = $selector.hammer({prevent_default:true});
            hammertime.on('tap', functionToCall );
        },

        /**
         * See hammerResetDragging.
         */
        update: function() {
            if ( this.hammerResetDragging ) {
                this.hammerResetDragging = false;
                this.hammerDragging = false;
            }

            if ( this.hammerResetTransforming ) {
                this.hammerResetTransforming = false;
                this.hammerTransforming = false;
            }
        }

    };

}()); 