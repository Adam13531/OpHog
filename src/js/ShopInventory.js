( function() {

	/**
	 * Inventory for the shop. This inherits from game.Inventory
	 */
	window.game.ShopInventory = function ShopInventory() {
		this.base = game.Inventory;
		this.base(true);
	};

	window.game.ShopInventory.prototype = new game.Inventory;

    window.game.ShopInventory.prototype.init = function() {
        // Add equippable slots
        for (var i = 0; i < 10; i++) {
            var newSlot = new game.ShopSlot(game.SlotTypes.EQUIP);
            this.addSlot(newSlot);
        };

        // Add usable slots
        for (var i = 0; i < 10; i++) {
            var newSlot = new game.ShopSlot(game.SlotTypes.USABLE);
            this.addSlot(newSlot);
        };

        // TODO: Debugging code
        this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.CREATE_SPAWNER.id));
        this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.MEGA_CREATE_SPAWNER.id));
        this.getFirstEmptySlot(game.SlotTypes.EQUIP).setItem(new game.Item(game.ItemType.SHIELD.id));
        this.getFirstEmptySlot(game.SlotTypes.EQUIP).setItem(new game.Item(game.ItemType.SHIELD.id));
    };

	window.game.ShopInventory.prototype.addSlot = function(slot) {
		game.Inventory.prototype.addSlot.call(this, slot);

        // Tell the UI that we've added a slot so it will add the graphic
        // to the UI.
        game.ShopUI.addedSlot(slot);
	};

}()); 