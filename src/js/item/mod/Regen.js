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
     * ItemMod of type REDUCE_DAMAGE. This inherits from ItemMod. For detailed
     * function comments, see ItemMod.js.
     * @extends {ItemMod}
     */
    window.game.Regen = function Regen(chanceToRegen) {
        this.base = game.ItemMod;
        this.base(game.ItemModType.REGEN);
        this.chanceToRegen = chanceToRegen;
    }

    window.game.Regen.prototype = new game.ItemMod;

    window.game.Regen.prototype.beforeReceiveDamage = function(attacker, target, damageToBeDealt) {
        if ( game.util.percentChance(this.chanceToRegen) ) {
            target.addStatusEffect(game.EffectType.REGEN);
        }
        
        return damageToBeDealt;
    };

    window.game.Regen.prototype.copy = function() {
        var copy = new game.Regen(this.chanceToRegen);
        return copy;
    };

    window.game.Regen.prototype.getDescription = function() {
        var chanceStr;
        if ( this.chanceToRegen < 1 ) {
            chanceStr = game.util.formatPercentString(this.chanceToRegen, 1) + '% chance to cast';
        } else {
            chanceStr = 'Casts';
        }

        return chanceStr + ' Regenerate when damage is received.';
    };

}());