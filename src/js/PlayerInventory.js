/*
 * OpHog - https://github.com/Adam13531/OpHog
 * Copyright (C) 2014  Adam Damiano
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
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

		// this.generateItems();

        // Have the first item selected by default
        game.playerInventoryUI.clickedSlot(game.playerInventoryUI.slots[0]);
	};

	window.game.PlayerInventory.prototype = new game.Inventory;

    /**
     * This is a debug function for now that will set a few different slots.
     */
	window.game.PlayerInventory.prototype.generateItems = function() {
        this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.CREATE_SPAWNER.id));
        this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.MEGA_CREATE_SPAWNER.id));
        this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.REVIVE_POTION.id));
        this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.STAT_GEM.id));
        this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.POTION.id));
        this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(game.ItemType.REVEALER.id));
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
        if ( item == null ) return game.AddedItemToInventoryState.FULLY_ADDED;

        var addedItemState = game.AddedItemToInventoryState.NOT_ADDED;
        var emptySlot = null;

        // When we add a stackable item, we distribute the original item
        // into our inventory, thus decreasing the quantity. We keep this
        // around so that the loot summary can display the correct quantity.
        var originalQuantity = item.quantity;

        // If the item is equippable or can't be stacked, then the only way
        // it will fit is by finding an empty slot.
        if ( !item.usable || !item.stackable) {
            emptySlot = this.getFirstEmptySlot(item.usable ? game.SlotTypes.USABLE : game.SlotTypes.EQUIP);
            if ( emptySlot != null ) {
                emptySlot.setItem(item);
                addedItemState = game.AddedItemToInventoryState.FULLY_ADDED;
            }
        } else {
            // We got here, so the item has to be usable and stackable.
            //
            // First, go through each slot. If there's an item of the same
            // type, then deposit as much as possible into that slot.
            var quantityLeft = item.quantity;
            for (var i = 0; i < this.slots.length; i++) {
                var slotItem = this.slots[i].item;
                if ( slotItem == null || slotItem.itemID != item.itemID ) continue;

                // Add as much as we can
                quantityLeft = this.slots[i].addQuantity(quantityLeft);
                if ( quantityLeft == 0 ) {
                    break;
                }
            };

            // If there's still something left after that, then we need to
            // keep finding empty slots to fill.
            while ( quantityLeft > 0 ) {
                emptySlot = this.getFirstEmptySlot(game.SlotTypes.USABLE);
                if ( emptySlot == null ) {
                    break;
                }

                // Make a new item so that multiple slots don't reference
                // the same item.
                var newItem = new game.Item(item.itemID);
                newItem.quantity = Math.min(quantityLeft, game.maxSlotQuantity);
                emptySlot.setItem(newItem);
                quantityLeft -= newItem.quantity;
            }

        }

        if ( quantityLeft == 0 ) {
            addedItemState = game.AddedItemToInventoryState.FULLY_ADDED;
        } else if ( quantityLeft != originalQuantity ) {
            addedItemState = game.AddedItemToInventoryState.PARTIALLY_ADDED;
        }

        var didItemFullyFit = (addedItemState == game.AddedItemToInventoryState.FULLY_ADDED);
        game.LootUI.addItemNotification(item, didItemFullyFit, originalQuantity);

        return addedItemState;
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