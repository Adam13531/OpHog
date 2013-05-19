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
     * Quest base-class constructor.
     * @param {game.QuestType} type            - the type of the quest
     * @param {Number} questSlotNumber - which index represents this quest. This
     * is used for the UI and for the QuestManager, so it is stored in this
     * object. It is bounded by game.MAX_QUESTS.
     */
    window.game.Quest = function Quest(type, questSlotNumber) {
        this.type = type;
        this.questSlotNumber = questSlotNumber;
    };

    /**
     * This is called when you kill an enemy party, regardless of whether this
     * particular Quest cares.
     * @return {null}
     */
    window.game.Quest.prototype.killedAnEnemyParty = function() {
        return;
    };

    /**
     * This is called when you collect an item, regardless of whether this
     * particular Quest cares.
     * @return {null}
     */
    window.game.Quest.prototype.collectedAnItem = function() {
        return;
    };

    /**
     * @return {Boolean} true if this quest is finished, i.e. if you've met the
     * objective.
     */
    window.game.Quest.prototype.isComplete = function() {
        console.log('isComplete - unimplemented for: ' + this.type)
        return false;
    };

    /**
     * This gets the description and progress for this quest to display in the
     * UI.
     * @return {String} see above
     */
    window.game.Quest.prototype.getDescription = function() {
        console.log('getDescription - unimplemented for: ' + this.type)
        return 'Unrecognized quest type: ' + this.type;
    };

}());