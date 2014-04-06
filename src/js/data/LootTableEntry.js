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
     * A simple class representing a single item in an enemy's loot table.
     */
    window.game.LootTableEntry = function LootTableEntry(itemID, relativeWeight) {
        /**
         * The ID of the item that can be dropped;
         * @type {Number}
         */
        this.itemID = itemID;

        /**
         * Relative chance to drop the item. See util.randomFromWeights.
         *
         * The name of this variable must not change. Again, see
         * randomFromWeights for an explanation.
         * @type {Number}
         */
        this.relativeWeight = relativeWeight;
    };
}());
