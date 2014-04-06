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
     * ItemMod of type POISON. This inherits from ItemMod. For detailed
     * function comments, see ItemMod.js.
     * @extends {ItemMod}
     * @param {Number} chanceToPoison - the chance to poison on damage dealt.
     * Range: [0,1].
     */
    window.game.Poison = function Poison(chanceToPoison) {
        this.base = game.ItemMod;
        this.base(game.ItemModType.POISON);
        this.chanceToPoison = chanceToPoison;
    }

    window.game.Poison.prototype = new game.ItemMod;

    window.game.Poison.prototype.onDamageDealt = function(attacker, target, damageDealt) {
        // Targets must be living in order to afflict them with poison,
        // otherwise the effect will still show on their tombstone.
        if ( !target.isLiving() ) return;

        var effectivePoisonChance = this.chanceToPoison;

        // Lower the chance against bosses.
        if ( target.isBoss() ) effectivePoisonChance /= 10.0;

        if ( !game.util.percentChance(this.chanceToPoison) ) return;

        target.addStatusEffect(game.EffectType.POISON);
    };

    window.game.Poison.prototype.copy = function() {
        var copy = new game.Poison(this.chanceToPoison);
        return copy;
    };

    window.game.Poison.prototype.getDescription = function() {
        var chanceStr;
        if ( this.chanceToPoison < 1 ) {
            chanceStr = game.util.formatPercentString(this.chanceToPoison, 1) + '% chance to poison';
        } else {
            chanceStr = 'Poisons';
        }
        return chanceStr + ' enemy on attack';
    };

}());