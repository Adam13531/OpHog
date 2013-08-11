( function() {
  
    /**
     * This contains all data associated with a minigame.
     * @param {Array} enemies - each entry is an array whose elements are
     * [game.UnitType, Number] (the enemy to be spawned and the number to
     * spawn).
     * @param {Number} moneyGiven - the money given when you complete this
     * minigame.
     */
    window.game.MinigameData = function MinigameData(enemies, moneyGiven) {
        this.enemies = enemies;
        this.moneyGiven = moneyGiven;
    };

}());