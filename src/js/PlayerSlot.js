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
	};

}());