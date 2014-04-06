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
     * ItemMod of type LIFE_LEECH. This inherits from ItemMod. For detailed
     * function comments, see ItemMod.js.
     * @extends {ItemMod}
     * @param {Number} chanceToLeech - the chance to leech life on damage dealt.
     * Range: [0,1].
     * @param {Number} leechPercentage - the percent of damage dealt to leech. 1
     * represents 100%, 2 represents 200%, etc.
     */
    window.game.LifeLeech = function LifeLeech(chanceToLeech, leechPercentage) {
        this.base = game.ItemMod;
        this.base(game.ItemModType.LIFE_LEECH);
        this.chanceToLeech = chanceToLeech;
        this.leechPercentage = leechPercentage;
    }

    window.game.LifeLeech.prototype = new game.ItemMod;

    window.game.LifeLeech.prototype.onDamageDealt = function(attacker, target, damageDealt) {
        var lifeLeeched = damageDealt * this.leechPercentage;
        if ( lifeLeeched <= 0 || !game.util.percentChance(this.chanceToLeech)) return;

        // Life leeched can't overheal you.
        attacker.modifyLife(lifeLeeched, true, false);
    };

    window.game.LifeLeech.prototype.copy = function() {
        var copy = new game.LifeLeech(this.chanceToLeech, this.leechPercentage);
        return copy;
    };

    window.game.LifeLeech.prototype.getDescription = function() {
        var chanceStr;
        if ( this.chanceToLeech < 1 ) {
            chanceStr = game.util.formatPercentString(this.chanceToLeech, 1) + '% chance to leech';
        } else {
            chanceStr = 'Leeches';
        }
        var leechPercentStr = game.util.formatPercentString(this.leechPercentage, 0);

        return chanceStr + ' ' + leechPercentStr + '% damage dealt on attack';
    };

}());