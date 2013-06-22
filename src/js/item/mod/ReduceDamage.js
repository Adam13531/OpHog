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