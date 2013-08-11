( function() {

	/**
	 * Inventory for players. This inherits from game.Inventory.
	 */
	window.game.PlayerInventory = function PlayerInventory() {
		this.base = game.Inventory;
		this.base(true); // Pass in true (or anything really) to make sure the 
						 // base constructor will be called
		
		// Add equippable slots
        for (var i = 0; i < 32; i++) {
            var newSlot = new game.PlayerSlot(game.SlotTypes.EQUIP, this.slotID++);
            this.addSlot(newSlot);
        };

        // Add usable slots
        for (var i = 0; i < 32; i++) {
            var newSlot = new game.PlayerSlot(game.SlotTypes.USABLE, this.slotID++);
            this.addSlot(newSlot);
        };

		// Add slots for each character class
		for (var i = 0; i < 2; i++) {
			var newSlot = new game.PlayerSlot(game.SlotTypes.WAR, this.slotID++);
			this.addSlot(newSlot);
		};
		for (var i = 0; i < 2; i++) {
			var newSlot = new game.PlayerSlot(game.SlotTypes.WIZ, this.slotID++);
			this.addSlot(newSlot);
		};
		for (var i = 0; i < 2; i++) {
			var newSlot = new game.PlayerSlot(game.SlotTypes.ARCH, this.slotID++);
			this.addSlot(newSlot);
		};
		this.generateItems();
	};

	window.game.PlayerInventory.prototype = new game.Inventory;

	window.game.PlayerInventory.prototype.generateItems = function() {
		// Fill some of the slots (this is debug code)
        this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.CREATE_SPAWNER.id));
        this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.MEGA_CREATE_SPAWNER.id));
        this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.STAT_GEM.id));
        this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.POTION.id));
        this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.LEAF.id));
        this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.HEAL_GEM.id));
        this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.POISON_GEM.id));
        this.getFirstEmptySlot(game.SlotTypes.EQUIP).setItem(new game.Item(game.ItemType.SHIELD.id));
        this.getFirstEmptySlot(game.SlotTypes.EQUIP).setItem(new game.Item(game.ItemType.SHIELD.id));
        this.getFirstEmptySlot(game.SlotTypes.WAR).setItem(new game.Item(game.ItemType.SHIELD.id));
        this.getFirstEmptySlot(game.SlotTypes.WAR).setItem(new game.Item(game.ItemType.SWORD.id));
        this.getFirstEmptySlot(game.SlotTypes.ARCH).setItem(new game.Item(game.ItemType.SWORD.id));
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

	/**
     * Gets all slots of the specified slot type.
     * @param  {game.SlotTypes} slotType - the type you're interested in
     * retrieving
     * @return {Array:Slot} slots of that type
     */
    window.game.PlayerInventory.prototype.getAllSlotsOfType = function(slotType) {
        var matchingSlots = [];
        for (var i = 0; i < this.slots.length; i++) {
            if ( this.slots[i].slotType == slotType ) {
                matchingSlots.push(this.slots[i]);
            }
        };

        return matchingSlots;
    };

    /**
     * Gets the items that are equipped to the specified class.
     * @param {game.PlaceableUnitType} unitType - the class you want the
     * items for.
     * @return {Array:Item} - the items that are equipped to this class.
     */
    window.game.PlayerInventory.prototype.getClassEquippedItems = function(unitType) {
        var slotType = null;
        var classSlots;
        var equippedItems = [];

        switch ( unitType ) {
            case game.PlaceableUnitType.ARCHER:
                slotType = game.SlotTypes.ARCH;
                break;
            case game.PlaceableUnitType.WARRIOR:
                slotType = game.SlotTypes.WAR;
                break;
            case game.PlaceableUnitType.WIZARD:
                slotType = game.SlotTypes.WIZ;
                break;
            default:
                slotType = null;
                break;
        }

        if ( slotType != null ) {
            classSlots = this.getAllSlotsOfType(slotType);

            for (var i = 0; i < classSlots.length; i++) {
                if ( !classSlots[i].isEmpty() ) {
                    equippedItems.push(classSlots[i].item);
                }
            };
        }

        return equippedItems;
    };

}());