( function() {
  
    /**
     * Quest of type KILL_ENEMIES. This inherits from Quest. For detailed
     * function comments, see Quest.js.
     * @extends {Quest}
     */
    window.game.KillEnemyPartyQuest = function KillEnemyPartyQuest(questSlotNumber) {
        this.base = game.Quest;
        this.base(game.QuestType.KILL_ENEMIES, questSlotNumber);
        
        this.enemiesKilled = 0;
        this.enemiesNeeded = Math.floor(Math.random() * 4) + 2;
    }

    window.game.KillEnemyPartyQuest.prototype = new game.Quest;

    window.game.KillEnemyPartyQuest.prototype.getDescription = function() {
        var pluralizeCorrectly = 'enemy part';
        if ( this.enemiesNeeded == 1 ) {
            pluralizeCorrectly += 'y';
        } else {
            pluralizeCorrectly += 'ies';
        }

        return 'Kill ' + this.enemiesNeeded + ' ' + pluralizeCorrectly + '. Progress: ' + 
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