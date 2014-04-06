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
     * This is simply a set of data that is relevant to producing an enemy.
     * @param {Number} enemyID        - the ID of the enemy
     * @param {Number} relativeWeight - an integer representing the relative
     * weight that this enemy will be produced. For more information on how this
     * works, see game.util.randomFromWeights.
     * @param {Number} minLevel       - the minimum level at which this enemy
     * will be produced
     * @param {Number} maxLevel       - the maximum level. This is an inclusive
     * value, so if you say maxLevel==10, then you can actually get lv. 10
     * enemies.
     * @param {Number} quantity - a quantity for this enemy. This is used by the
     * minigame UI at the very least.
     */
    window.game.PossibleEnemy = function PossibleEnemy(enemyID, relativeWeight, minLevel, maxLevel, quantity) {
        this.enemyID = enemyID;
        this.relativeWeight = relativeWeight;
        this.minLevel = minLevel;
        this.maxLevel = maxLevel;
        this.quantity = quantity;
    };

}());