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
     * A tileset lets you know how to "skin" maps.
     * @param {Number} id - a unique ID for this tileset
     * @param {Number} spawnTileGraphic       - graphic index for the spawn
     * tiles on this map
     * @param {Number} nonwalkableTileGraphic - graphic index for the
     * nonwalkable tiles on this map
     * @param {Number} walkableTileGraphic    - graphic index for the walkable
     * tiles on this map
     */
    window.game.Tileset = function Tileset(id, spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic) {
        this.doodads = [];

        this.id = id;
        this.spawnTileGraphic = spawnTileGraphic;
        this.nonwalkableTileGraphic = nonwalkableTileGraphic;
        this.walkableTileGraphic = walkableTileGraphic;

        // One doodad will show up approximately every 'doodadDensity' tiles,
        // making this number lower results in more doodads.
        this.doodadDensity = 5;
    };

    /**
     * Adds a doodad to this tileset.
     * @param  {Doodad} doodad - the doodad to add
     */
    window.game.Tileset.prototype.addDoodad = function(doodad) {
        this.doodads.push(doodad);
    };

}());