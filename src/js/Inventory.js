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

        getFirstEmptySlot: function(slotType) {
            for (var i = 0; i < this.slots.length; i++) {
                if ( this.slots[i].isEmpty() && this.slots[i].slotType == slotType ) {
                    return this.slots[i];
                }
            };

            return null;
        },

        /**
         * This attempts to add the item to the inventory. If the item is
         * stackable, then existing stacks will be topped off before searching
         * for an empty slot.
         * @param {Item} item - the item to add
         * @return {Boolean} true if the item was completely added, false if
         * partially added (in the case of stackable items) or not at all added
         */
        addItem: function(item) {
            if ( item == null ) return true;

            // If the item is equippable or can't be stacked, then the only way
            // it will fit is by finding an empty slot.
            // 
            //
            // TODO: technically it could also fit if it's equippable by a class
            // and that's our only empty slot...
            if ( !item.usable || !item.stackable) {
                var emptySlot = null;
                emptySlot = this.getFirstEmptySlot(item.usable ? game.SlotTypes.USABLE : game.SlotTypes.EQUIP);
                if ( emptySlot == null ) {
                    return false;
                }
                emptySlot.setItem(item);
                return true;
            }

            // We got here, so the item has to be usable and stackable.
            //
            // First, go through each slot. If there's an item of the same type,
            // then deposit as much as possible into that slot.
            var quantityLeft = item.quantity;
            for (var i = 0; i < this.slots.length; i++) {
                var slotItem = this.slots[i].item;
                if ( slotItem == null || slotItem.itemID != item.itemID ) continue;

                // Add as much as we can
                quantityLeft = this.slots[i].addQuantity(quantityLeft);
                if ( quantityLeft == 0 ) break;
            };

            // If there's still something left after that, see if there's an
            // empty slot. If so, cram the rest in there (guaranteed to fit
            // unless we found more than an entire stack of an item).
            var emptySlot = this.getFirstEmptySlot(game.SlotTypes.USABLE);
            if ( emptySlot == null ) return false;
            item.quantity = quantityLeft;
            emptySlot.setItem(item);

            return true;
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
            this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(0));
            this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(4));
            this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(5));
            this.getFirstEmptySlot(game.SlotTypes.USABLE).setItem(new game.Item(5));
            this.getFirstEmptySlot(game.SlotTypes.EQUIP).setItem(new game.Item(1));
            this.getFirstEmptySlot(game.SlotTypes.EQUIP).setItem(new game.Item(1));
            this.getFirstEmptySlot(game.SlotTypes.WAR).setItem(new game.Item(1));
            this.getFirstEmptySlot(game.SlotTypes.WAR).setItem(new game.Item(2));
        }
        
    };
}()); 