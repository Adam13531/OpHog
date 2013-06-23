( function() {
  
    /**
     * ItemMod of type THORNS. This inherits from ItemMod. For detailed
     * function comments, see ItemMod.js.
     * @extends {ItemMod}
     */
    window.game.Thorns = function Thorns(thornsDamage) {
        this.base = game.ItemMod;
        this.base(game.ItemModType.THORNS);
        this.thornsDamage = thornsDamage;
    }

    window.game.Thorns.prototype = new game.ItemMod;

    window.game.Thorns.prototype.onDamageReceived = function(attacker, target, damageDealt) {
        var thornsDamage = this.thornsDamage;

        attacker.modifyLife(-thornsDamage, true, false);
    };

    window.game.Thorns.prototype.copy = function() {
        var copy = new game.Thorns(this.thornsDamage);
        return copy;
    };

    window.game.Thorns.prototype.getDescription = function() {
        return 'Attacker takes damage of ' + this.thornsDamage;
    };

}());