( function() {

    /**
     * Quest of type PLACE_WIZARDS, PLACE_ARCHERS, or PLACE_WARRIORS. This
     * inherits from Quest. For detailed function comments, see Quest.js.
     *
     * Because this represents three different quest types, I thought about
     * separating them into their own classes, but the only difference between
     * the three at the time of writing is the quest type.
     * @extends {Quest}
     * @param {game.PlaceableUnitType} unitType - the Unit Type that you need to
     * place
     */
    window.game.PlaceUnitQuest = function PlaceUnitQuest(questSlotNumber, unitType) {
        this.base = game.Quest;
        var questType = null;
        switch(unitType) {
            case game.PlaceableUnitType.WIZARD:
                questType = game.QuestType.PLACE_WIZARDS;
                break;
            case game.PlaceableUnitType.WARRIOR:
                questType = game.QuestType.PLACE_WARRIORS;
                break;
            case game.PlaceableUnitType.ARCHER:
                questType = game.QuestType.PLACE_ARCHERS;
                break;
            default:
                console.log('game.PlaceableUnitType was not specified: ' + unitType);    
        }
        this.base(questType, questSlotNumber);
        
        this.unitType = unitType;
        this.unitsPlaced = 0;
        this.unitsNeeded = Math.floor(Math.random() * 2) + 1;
    }

    window.game.PlaceUnitQuest.prototype = new game.Quest;

    window.game.PlaceUnitQuest.prototype.getDescription = function() {
        var unitName = game.UnitPlacementUI.getNameOfPlaceableUnit(this.unitType);
        if ( this.unitsNeeded != 1 ) unitName += 's';

        return 'Place ' + this.unitsNeeded + ' ' + unitName + '. Progress: ' + 
                    this.unitsPlaced + '/' + this.unitsNeeded;;
    };

    window.game.PlaceUnitQuest.prototype.placedAUnit = function(unitType) {
        // You can't get progress toward this quest unless you're in normal
        // gameplay. The overworld and the minigame both place units, and we
        // don't want that to give you progress.
        if ( !game.GameStateManager.isNormalGameplay() ) return;

        if ( unitType == this.unitType ) {
            this.unitsPlaced++;
            game.QuestManager.questGainedProgress(this);
        }
    };

    window.game.PlaceUnitQuest.prototype.isComplete = function() {
        return this.unitsPlaced >= this.unitsNeeded;
    };

}());