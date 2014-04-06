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
     * A doodad is a feature on a map that is drawn above the map background.
     * @param {Array:Number} graphicIndices - the graphic indices that form this
     * doodad
     * @param {Number} width          - the width of the doodad
     * @param {Number} rarity         - the higher this number is, the lower the
     * chance of finding this doodad on the map.
     */
    window.game.Doodad = function Doodad(graphicIndices, width, rarity) {
        this.graphicIndices = graphicIndices;
        this.width = width;
        this.height = this.graphicIndices.length / width;
        this.rarity = rarity;
    };

}());