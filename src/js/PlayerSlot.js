( function() {

	window.game.PlayerSlot = function PlayerSlot(slotType) {
		this.base = game.Slot;
		this.base(true, slotType);
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