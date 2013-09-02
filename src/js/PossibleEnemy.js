( function() {
  
    /**
     * This is simply a set of data that is relevant to producing an enemy.
     * @param {Number} enemyID        - the ID of the enemy
     * @param {Number} relativeWeight - an integer representing the relative
     * weight that this enemy will be produced. For more information on how this
     * works, see game.util.randomFromWeights.
     * @param {Number} minLevel       - the minimum level at which this enemy
     * will be produced
     * @param {Number} maxLevel       - the maximum level. This is an inclusive
     * value, so if you say maxLevel==10, then you can actually get lv. 10
     * enemies.
     * @param {Number} quantity - a quantity for this enemy. This is used by the
     * minigame UI at the very least.
     */
    window.game.PossibleEnemy = function PossibleEnemy(enemyID, relativeWeight, minLevel, maxLevel, quantity) {
        this.enemyID = enemyID;
        this.relativeWeight = relativeWeight;
        this.minLevel = minLevel;
        this.maxLevel = maxLevel;
        this.quantity = quantity;
    };

}());