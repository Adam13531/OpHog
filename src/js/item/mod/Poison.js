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
        if ( !target.isLiving() || !game.util.percentChance(this.chanceToPoison) ) return;

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