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
    window.game.ReduceDamage = function ReduceDamage(reduceDamageAmount) {
        this.base = game.ItemMod;
        this.base(game.ItemModType.REDUCE_DAMAGE);
        this.reduceDamageAmount = reduceDamageAmount;
    }

    window.game.ReduceDamage.prototype = new game.ItemMod;

    window.game.ReduceDamage.prototype.beforeReceiveDamage = function(attacker, target, damageToBeDealt) {
        var reducedDamage = damageToBeDealt - this.reduceDamageAmount;
        reducedDamage = Math.max(0, reducedDamage);
        return reducedDamage;
    };

    window.game.ReduceDamage.prototype.copy = function() {
        var copy = new game.ReduceDamage(this.reduceDamageAmount);
        return copy;
    };

    window.game.ReduceDamage.prototype.getDescription = function() {
        return 'Reduces incoming damage by ' + this.reduceDamageAmount;
    };

}());