( function() {

    // There's only one inventory, so we'll define everything in a single
    // object.
    window.game.Inventory = {
        
        /**
         * Array of Slot objects.
         * @type {Array<Slot>}
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
            this.getFirstEmptySlot(game.SlotTypes.EQUIP).setItem(new game.Item(1));
            this.getFirstEmptySlot(game.SlotTypes.EQUIP).setItem(new game.Item(1));
            this.getFirstEmptySlot(game.SlotTypes.WAR).setItem(new game.Item(1));
            this.getFirstEmptySlot(game.SlotTypes.WAR).setItem(new game.Item(2));
        }
        
    };
}()); 