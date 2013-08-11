( function() {

	/**
	 * Inventory for players. This inherits from game.Inventory.
	 */
	window.game.PlayerInventory = function PlayerInventory() {
		this.base = game.Inventory;
		this.base(true); // Pass in true (or anything really) to make sure the 
						 // base constructor will be called
	};

	window.game.PlayerInventory.prototype = new game.Inventory;

	window.game.PlayerInventory.prototype.init = function() {

		// Add equippable slots
        for (var i = 0; i < 2; i++) {
            var newSlot = new game.PlayerSlot(game.SlotTypes.EQUIP);
            this.addSlot(newSlot);
        };

        // Add usable slots
        for (var i = 0; i < 2; i++) {
            var newSlot = new game.PlayerSlot(game.SlotTypes.USABLE);
            this.addSlot(newSlot);
        };

		// Add slots for each character class
		for (var i = 0; i < 2; i++) {
			var newSlot = new game.PlayerSlot(game.SlotTypes.WAR);
			this.addSlot(newSlot);
		};
		for (var i = 0; i < 2; i++) {
			var newSlot = new game.PlayerSlot(game.SlotTypes.WIZ);
			this.addSlot(newSlot);
		};
		for (var i = 0; i < 2; i++) {
			var newSlot = new game.PlayerSlot(game.SlotTypes.ARCH);
			this.addSlot(newSlot);
		};
		this.generateItems();
	};

	window.game.PlayerInventory.prototype.generateItems = function() {
		// Fill some of the slots (this is debug code)
        // this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.CREATE_SPAWNER.id));
        // this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.MEGA_CREATE_SPAWNER.id));
        // this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.STAT_GEM.id));
        // this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.POTION.id));
        // this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.LEAF.id));
        // this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.HEAL_GEM.id));
        // this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.POISON_GEM.id));
        // this.getFirstEmptySlot(game.SlotTypes.EQUIP).setItem(new game.Item(game.ItemType.SHIELD.id));
        // this.getFirstEmptySlot(game.SlotTypes.EQUIP).setItem(new game.Item(game.ItemType.SHIELD.id));
        // this.getFirstEmptySlot(game.SlotTypes.WAR).setItem(new game.Item(game.ItemType.SHIELD.id));
        // this.getFirstEmptySlot(game.SlotTypes.WAR).setItem(new game.Item(game.ItemType.SWORD.id));
        // this.getFirstEmptySlot(game.SlotTypes.ARCH).setItem(new game.Item(game.ItemType.SWORD.id));
	};

	window.game.PlayerInventory.prototype.addSlot = function(slot) {
		game.Inventory.prototype.addSlot.call(this, slot);

        // Tell the UI that we've added a slot.
        game.playerInventoryUI.addedSlot(slot);
	};

	window.game.PlayerInventory.prototype.addItem = function(item) {
		var originalQuantity = item.quantity;
		var addedItemState = game.Inventory.prototype.addItem.call(this, item);

		if (addedItemState != game.AddedItemToInventoryState.NOT_ADDED) {
	        // Notify appropriate listeners
	        game.LootUI.addItemNotification(item, addedItemState, originalQuantity);
	        game.QuestManager.collectedAnItem();
		}

		return addedItemState
	};

}());