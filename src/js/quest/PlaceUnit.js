( function() {

    /**
     * Quest of type PLACE_WIZARDS, PLACE_ARCHERS, or PLACE_WARRIORS. This
     * inherits from Quest. For detailed function comments, see Quest.js.
     * @extends {Quest}
     * @param {game.PlaceableUnitType} unitType - the Unit Type that you need to place
     */
    window.game.PlaceUnitQuest = function PlaceUnitQuest(questSlotNumber, unitType) {
        this.base = game.Quest;
        this.base(game.QuestType.KILL_ENEMIES, questSlotNumber);
        
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
        if ( unitType == this.unitType ) {
            this.unitsPlaced++;
            game.QuestManager.questGainedProgress(this);
        }
    };

    window.game.PlaceUnitQuest.prototype.isComplete = function() {
        return this.unitsPlaced >= this.unitsNeeded;
    };

}());