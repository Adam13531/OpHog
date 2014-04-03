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