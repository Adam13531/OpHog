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
     * A very simple class to hold a rectangle and a function so that the
     * portrait UI can put buttons wherever it wants and not have to rely on
     * weird tricks to figure out which one was clicked.
     *
     * Ideally, this would have draw and update code and everything instead of
     * just a function.
     */
    window.game.PortraitUIButton = function PortraitUIButton(x, y, w, h, callback) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.callback = callback;

        // Compute right and bottom for convenience.
        this.right = this.x + this.w;
        this.bottom = this.y + this.h;

        this.centerX = this.x + this.w / 2;
        this.centerY = this.y + this.h / 2;
    };
}());
