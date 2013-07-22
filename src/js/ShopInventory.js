( function() {

	/**
	 * Inventory for the shop. This inherits from game.Inventory
	 */
	window.game.ShopInventory = function ShopInventory() {
		this.base = game.Inventory;
		this.base(true);

	};

	window.game.ShopInventory.prototype = new game.Inventory;

	window.game.ShopInventory.prototype.addSlot = function(slot) {
		game.Inventory.prototype.addSlot.call(this, slot);

        // Tell the UI that we've added a slot so it will add the graphic
        // to the UI.
        game.ShopUI.addedSlot(slot);
	};

}()); 