( function() {
  
    /**
     * ItemMod of type MULTIPLE_PROJECTILES. This inherits from ItemMod. For detailed
     * function comments, see ItemMod.js.
     * @extends {ItemMod}
     */
    window.game.MultipleProjectiles = function MultipleProjectiles(numberOfProjectiles) {
        this.base = game.ItemMod;
        this.base(game.ItemModType.MULTIPLE_PROJECTILES);
        this.numberOfProjectiles = numberOfProjectiles;
    }

    window.game.MultipleProjectiles.prototype = new game.ItemMod;

    window.game.MultipleProjectiles.prototype.onBattleTurn = function(attacker) {
        // You can only modify ATTACK-type abilities to shoot multiple
        // projectiles.
        if ( attacker.currentAbility.type != game.AbilityType.ATTACK ) {
            return false;
        }

        var battle = attacker.battleData.battle;

        var flags = game.RandomUnitFlags.ALIVE;
        if ( attacker.isPlayer() ) {
            flags |= game.RandomUnitFlags.FOE;
        } else {
            flags |= game.RandomUnitFlags.ALLY;
        }

        var possibleTargets = battle.getUnitsMatchingFlags(attacker.isPlayer(), flags);
        var actualTargets = [];

        for (var i = 0; i < this.numberOfProjectiles; i++) {
            if ( possibleTargets.length == 0 ) {
                break;
            }

            var randomIndex = Math.floor(Math.random() * possibleTargets.length);
            actualTargets.push(possibleTargets[randomIndex]);
            possibleTargets.splice(randomIndex, 1);
        };

        if ( actualTargets.length == 0 ) {
            return false;
        }

        for (var i = 0; i < actualTargets.length; i++) {
            var targetUnit = actualTargets[i];

            var x = attacker.getCenterX();
            var y = attacker.getCenterY();
            var newProjectile = new game.Projectile(x, y, attacker.currentAbility.actionOnHit, attacker, targetUnit);
            battle.addProjectile(newProjectile);
        };

        return true;
    };

    window.game.MultipleProjectiles.prototype.copy = function() {
        var copy = new game.MultipleProjectiles(this.numberOfProjectiles);
        return copy;
    };

    window.game.MultipleProjectiles.prototype.getDescription = function() {
        var pluralize = this.numberOfProjectiles == 1 ? 'enemy' : 'enemies';
        return 'When attacking, this targets ' + this.numberOfProjectiles + ' ' + pluralize;
    };

}());