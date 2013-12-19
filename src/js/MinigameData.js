( function() {
  
    /**
     * This contains all data associated with a minigame.
     * @param {Array:PossibleEnemy} enemies - the enemies in this minigame
     * @param {Number} moneyGiven - the money given when you complete this
     * minigame.
     */
    window.game.MinigameData = function MinigameData(enemies, moneyGiven) {
        this.enemies = enemies;
        this.moneyGiven = moneyGiven;

        // The sum of the quantities of all possible enemies.
        this.numTotalEnemies = 0;

        for (var i = 0; i < this.enemies.length; i++) {
            this.numTotalEnemies += this.enemies[i].quantity;
        };
    };

}());