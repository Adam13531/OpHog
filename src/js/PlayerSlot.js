( function() {

    /**
     * Slots that belong in the player's inventory. This class inherits from
     * game.Slot.
     * @param {game.SlotTypes} slotType Type of slot this is
     * @param {Number} slotID ID for this slot
     */
	window.game.PlayerSlot = function PlayerSlot(slotType, slotID) {
		this.base = game.Slot;
		this.base(true, slotType, slotID);
	};

	window.game.PlayerSlot.prototype = new game.Slot;

	window.game.PlayerSlot.prototype.setItem = function(item) {
		game.Slot.prototype.setItem.call(this, item);
		
		// Tell the UI that we updated this slot.
        game.playerInventoryUI.updatedSlot(this.slotIndex);

        // If this is an equip slot, update the units
        if ( this.isClassSlot() ) {
            var unitTypeToUpdate = null;
            if (this.slotType == game.SlotTypes.WAR) unitTypeToUpdate = game.PlaceableUnitType.WARRIOR;
            if (this.slotType == game.SlotTypes.WIZ) unitTypeToUpdate = game.PlaceableUnitType.WIZARD;
            if (this.slotType == game.SlotTypes.ARCH) unitTypeToUpdate = game.PlaceableUnitType.ARCHER;

            var unitsOfThisType = game.UnitManager.getUnits(unitTypeToUpdate);
            for (var i = 0; i < unitsOfThisType.length; i++) {
                unitsOfThisType[i].equipmentChanged();
            };
        }
	};

}());