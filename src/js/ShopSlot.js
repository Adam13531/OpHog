( function() {

    /**
     * Slots that belong in the shops's inventory. This class inherits from
     * game.Slot.
     * @param {game.SlotTypes} slotType Type of slot this is
     * @param {Number} slotID ID for this slot
     */
	window.game.ShopSlot = function ShopSlot(slotType, slotID) {
		this.base = game.Slot;
		this.base(true, slotType, slotID);
	};

	window.game.ShopSlot.prototype = new game.Slot;

	window.game.ShopSlot.prototype.setItem = function(item) {
		game.Slot.prototype.setItem.call(this, item);
		
		// Tell the UI that we updated this slot.
        game.ShopUI.updatedSlot(this.slotIndex);
	};

}());