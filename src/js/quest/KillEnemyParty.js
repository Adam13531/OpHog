( function() {
  
    /**
     * Quest of type KILL_ENEMIES. This inherits from Quest. For detailed
     * function comments, see Quest.js.
     * @extends {Quest}
     */
    window.game.KillEnemyPartyQuest = function KillEnemyPartyQuest(questSlotNumber) {
        this.base = game.Quest;
        this.base(game.QuestType.KILL_ENEMIES, questSlotNumber);
        
        console.log('Made KillEnemyPartyQuest');

        this.enemiesKilled = 0;
        this.enemiesNeeded = 5;
    }

    window.game.KillEnemyPartyQuest.prototype = new game.Quest;

    window.game.KillEnemyPartyQuest.prototype.getDescription = function() {
        return 'Kill ' + this.enemiesNeeded + ' enemy parties. Progress: ' + 
                    this.enemiesKilled + '/' + this.enemiesNeeded;;
    };

    window.game.KillEnemyPartyQuest.prototype.killedAnEnemyParty = function() {
        this.enemiesKilled++;
        game.QuestManager.questGainedProgress(this);
    };

    window.game.KillEnemyPartyQuest.prototype.isComplete = function() {
        return this.enemiesKilled >= this.enemiesNeeded;
    };

}());