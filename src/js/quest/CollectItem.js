( function() {
  
    /**
     * Quest of type COLLECT_ITEMS. This inherits from Quest. For detailed
     * function comments, see Quest.js.
     * @extends {Quest}
     */
    window.game.CollectItemQuest = function CollectItemQuest(questSlotNumber) {
        this.base = game.Quest;
        this.base(game.QuestType.COLLECT_ITEMS, questSlotNumber);

        this.itemsCollected = 0;
        this.itemsNeeded = 5;
    }

    window.game.CollectItemQuest.prototype = new game.Quest;

    window.game.CollectItemQuest.prototype.getDescription = function() {
        return 'Collect ' + this.itemsNeeded + ' items. Progress: ' + 
                    this.itemsCollected + '/' + this.itemsNeeded;;
    };

    window.game.CollectItemQuest.prototype.collectedAnItem = function() {
        this.itemsCollected++;
        game.QuestManager.questGainedProgress(this);
    };

    window.game.CollectItemQuest.prototype.isComplete = function() {
        return this.itemsCollected >= this.itemsNeeded;
    };

}());