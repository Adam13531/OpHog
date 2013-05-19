( function() {
  
    /**
     * Types of Quests. The caveats for each quest are listed here.
     */
    window.game.QuestType = {
        /**
         * You must kill an enemy PARTY, not an individual enemy unit.
         * @type {String}
         */
        KILL_ENEMIES: 'kill X enemy parties',

        
        /**
         * You must collect items. Even if you don't have space, you'll still
         * get credit.
         * @type {String}
         */
        COLLECT_ITEMS: 'collect X items'
    };

    /**
     * Quest constructor.
     * @param {game.QuestType} type            - the type of the quest
     * @param {Number} questSlotNumber - which index represents this quest. This
     * is used for the UI and for the QuestManager, so it is stored in this
     * object. It is bounded by game.MAX_QUESTS.
     */
    window.game.Quest = function Quest(type, questSlotNumber) {
        this.type = type;
        this.questSlotNumber = questSlotNumber;

        // TODO: these should eventually go in their own class so that they
        // don't pollute other quest types, e.g. an item-collection quest
        // doesn't need to know how many enemies you've killed
        this.enemiesKilled = 0;
        this.enemiesNeeded = 5;

        this.itemsCollected = 0;
        this.itemsNeeded = 5;
    };

    /**
     * This is called when you kill an enemy party, regardless of whether this
     * particular Quest cares.
     * @return {null}
     */
    window.game.Quest.prototype.killedAnEnemyParty = function() {
        if ( this.type != game.QuestType.KILL_ENEMIES ) return;

        this.enemiesKilled++;
        game.QuestManager.questGainedProgress(this);
    };

    /**
     * This is called when you collect an item, regardless of whether this
     * particular Quest cares.
     * @return {null}
     */
    window.game.Quest.prototype.collectedAnItem = function() {
        if ( this.type != game.QuestType.COLLECT_ITEMS ) return;

        this.itemsCollected++;
        game.QuestManager.questGainedProgress(this);
    };

    /**
     * @return {Boolean} true if this quest is finished, i.e. if you've met the
     * objective.
     */
    window.game.Quest.prototype.isComplete = function() {
        switch( this.type ) {
            case game.QuestType.KILL_ENEMIES:
                return this.enemiesKilled >= this.enemiesNeeded;
            case game.QuestType.COLLECT_ITEMS:
                return this.itemsCollected >= this.itemsNeeded;
            default:
                desc = 'Unrecognized quest type: ' + this.type;
                break;
        }
        return false;
    };

    /**
     * This gets the description and progress for this quest to display in the
     * UI.
     * @return {String} see above
     */
    window.game.Quest.prototype.getDescription = function() {
        var desc;
        switch( this.type ) {
            case game.QuestType.KILL_ENEMIES:
                desc = 'Kill ' + this.enemiesNeeded + ' enemy parties. Progress: ' + 
                    this.enemiesKilled + '/' + this.enemiesNeeded;
                break;
            case game.QuestType.COLLECT_ITEMS:
                desc = 'Collect ' + this.itemsNeeded + ' items. Progress: ' + 
                    this.itemsCollected + '/' + this.itemsNeeded;
                break;
            default:
                desc = 'Unrecognized quest type: ' + this.type;
                break;
        }

        return desc;
    };

}());