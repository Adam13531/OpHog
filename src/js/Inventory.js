( function() {

    // There's only one inventory, so we'll define everything in a single
    // object.
    window.game.Inventory = {
        
        /**
         * Array of Slot objects.
         * @type {Array:Slot}
         */
        slots: new Array(),
        
        /**
         * Adds a slot to your inventory
         * @param {Slot} slot - the slot to add
         */
        addSlot: function(slot) {
            this.slots.push(slot);

            // Tell the UI that we've added a slot.
            game.InventoryUI.addedSlot(slot);
        },

        /**
         * Gets the first empty slot of the specified slot type.
         * @param  {game.SlotTypes} slotType - the type you're interested in
         * retrieving
         * @return {Slot}          the first empty slot of that type, or null if
         * all of those slots were filled.
         */
        getFirstEmptySlot: function(slotType) {
            for (var i = 0; i < this.slots.length; i++) {
                if ( this.slots[i].isEmpty() && this.slots[i].slotType == slotType ) {
                    return this.slots[i];
                }
            };

            return null;
        },

        /**
         * Gets all slots of the specified slot type.
         * @param  {game.SlotTypes} slotType - the type you're interested in
         * retrieving
         * @return {Array:Slot} slots of that type
         */
        getAllSlotsOfType: function(slotType) {
            var matchingSlots = [];
            for (var i = 0; i < this.slots.length; i++) {
                if ( this.slots[i].slotType == slotType ) {
                    matchingSlots.push(this.slots[i]);
                }
            };

            return matchingSlots;
        },

        /**
         * Gets the items that are equipped to the specified class.
         * @param {game.PlaceableUnitType} unitType - the class you want the
         * items for.
         * @return {Array:Item} - the items that are equipped to this class.
         */
        getClassEquippedItems: function(unitType) {
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
        },

        /**
         * This attempts to add the item to the inventory. If the item is
         * stackable, then existing stacks will be topped off before searching
         * for empty slot(s).
         * @param {Item} item - the item to add
         * @return {Boolean} true if the item was completely added, false if
         * partially added (in the case of stackable items) or not at all added
         */
        addItem: function(item) {
            if ( item == null ) return true;

            var addedItem = false;
            var emptySlot = null;

            // When we add a stackable item, we distribute the original item
            // into our inventory, thus decreasing the quantity. We keep this
            // around so that the loot summary can display the correct quantity.
            var originalQuantity = item.quantity;

            // If the item is equippable or can't be stacked, then the only way
            // it will fit is by finding an empty slot.
            // 
            //
            // TODO: technically it could also fit if it's equippable by a class
            // and that's our only empty slot...
            if ( !item.usable || !item.stackable) {
                emptySlot = this.getFirstEmptySlot(item.usable ? game.SlotTypes.USABLE : game.SlotTypes.EQUIP);
                if ( emptySlot != null ) {
                    emptySlot.setItem(item);
                    addedItem = true;
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
                        addedItem = true;
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

                if ( quantityLeft == 0 ) {
                    addedItem = true;
                }
            }

            // Notify appropriate listeners
            game.LootUI.addItemNotification(item, addedItem, originalQuantity);
            game.QuestManager.collectedAnItem();

            return addedItem;
        },

        /**
         * This function tells you how many of a given item you have in the
         * entire inventory.
         * @param  {Item} item - the item to check for
         * @return {Number}      the amount of that item you have
         */
        getQuantityAcrossAllSlots: function(item) {
            if ( item == null ) return 0;

            var quantity = 0;

            for (var i = 0; i < this.slots.length; i++) {
                var itemInSlot = this.slots[i].item;
                if ( itemInSlot == null ) continue;
                if( item.itemID == itemInSlot.itemID ) {
                    quantity += itemInSlot.quantity;
                }
            };

            return quantity;
        },

        /**
         * This will return a slot that contains an item equivalent to the one
         * you pass in.
         * @param  {Item} item - an item to check for. This is not an '==='
         * check, just an item-type check.
         * @return {Slot}      the first slot that contains that item
         */
        getSlotWithItem: function(item) {
            if ( item == null ) return null;

            for (var i = 0; i < this.slots.length; i++) {
                var itemInSlot = this.slots[i].item;
                if ( itemInSlot == null ) continue;
                if( item.itemID == itemInSlot.itemID ) {
                    return this.slots[i];
                }
            };

            return null;
        },

        /**
         * We know right from the beginning how many slots there are of each
         * type, so we can add them here.
         * @return {null}
         */
        initialize: function() {
            // Add equippable slots
            for (var i = 0; i < 32; i++) {
                var newSlot = new game.Slot(game.SlotTypes.EQUIP);
                this.addSlot(newSlot);
            };

            // Add usable slots
            for (var i = 0; i < 32; i++) {
                var newSlot = new game.Slot(game.SlotTypes.USABLE);
                this.addSlot(newSlot);
            };

            // Add slots for each character class
            for (var i = 0; i < 2; i++) {
                var newSlot = new game.Slot(game.SlotTypes.WAR);
                this.addSlot(newSlot);
            };
            for (var i = 0; i < 2; i++) {
                var newSlot = new game.Slot(game.SlotTypes.WIZ);
                this.addSlot(newSlot);
            };
            for (var i = 0; i < 2; i++) {
                var newSlot = new game.Slot(game.SlotTypes.ARCH);
                this.addSlot(newSlot);
            };

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
        }
        
    };
}()); 