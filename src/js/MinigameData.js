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
     * This contains all data associated with a minigame.
     * @param {Array:PossibleEnemy} enemies - the enemies in this minigame
     * @param {Number} moneyGiven - the money given when you complete this
     * minigame.
     */
    window.game.MinigameData = function MinigameData(enemies, moneyGiven) {
        this.enemies = enemies;
        this.moneyGiven = moneyGiven;

        // The sum of the quantities of all possible enemies.
        this.numTotalEnemies = 0;

        for (var i = 0; i < this.enemies.length; i++) {
            this.numTotalEnemies += this.enemies[i].quantity;
        };
    };

}());