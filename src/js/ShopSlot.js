( function() {

	window.game.ShopSlot = function ShopSlot(slotType) {
		this.base = game.Slot;
		this.base(true, slotType, game.ShopInventory.slotID++);

		// Number representing the index of the slot itself. This must match
        // the index of the corresponding SlotUI.
        // this.slotIndex = game.ShopInventory.slotID++;
	};

	window.game.ShopSlot.prototype = new game.Slot;

	window.game.ShopSlot.prototype.setItem = function(item) {
		game.Slot.prototype.setItem.call(this, item);
		
		// Tell the UI that we updated this slot.
        game.ShopUI.updatedSlot(this.slotIndex);
	};

}());