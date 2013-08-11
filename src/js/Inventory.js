( function() {

    /**
     * Flags to let us know how much of an item was added to an inventory
     */
    window.game.AddedItemToInventoryState = {
        NOT_ADDED: 1,
        PARTIALLY_ADDED: 2,
        FULLY_ADDED: 4
    };

    /**
     * Inventory base-class constructor
     * 
     * The useThisConstructor parameter needs to be checked so that
     * the slots don't get created twice. When nothing is passed
     * in (i.e., when a base class first inherits from this class
     * using "new"), then this constructor won't be run. Therefore,
     * when a base class inherits from this, then in that class'
     * constructor, you need to have code like this if you want to use
     * this constructor:
     *
     * this.base = game.Inventory;
     * this.base(true); // Pass in true (or anything really) to make sure the 
     *                  // base constructor will be called
     * 
     * Those two lines need to be in there no matter what, but if you actually
     * want to use this constructor, then pass in true (or anything really. it
     * just needs to be something so that the parameter isn't undefined).
     * There is probably a better way to do this.
     * @param {null} useThisConstructor Tells us whether or not to run the code
     * in this constructor
     */
    window.game.Inventory = function Inventory(useThisConstructor) {
        if ( useThisConstructor === undefined ) return;
        
        /**
         * Array of Slot objects.
         * @type {Array:Slot}
         */
        this.slots = [];

        /**
         * The ID that will be assigned to the next Slot created.
         * @type {Number}
         */
        this.slotID = 0;
    };

    window.game.Inventory.prototype.init = function() {
        console.log('init - unimplemented in game.Inventory base class');
        return null;
    };

    window.game.Inventory.prototype.generateItems = function() {
        console.log('generateItems - unimplemented in game.Inventory base class');
        return null;
    };

    /**
     * Adds a slot to your inventory
     * @param {Slot} slot - the slot to add
     */
    window.game.Inventory.prototype.addSlot = function(slot) {
        this.slots.push(slot);
    };
        
    /**
     * Gets the first empty slot of the specified slot type.
     * @param  {game.SlotTypes} slotType - the type you're interested in
     * retrieving
     * @return {Slot}          the first empty slot of that type, or null if
     * all of those slots were filled.
     */
    window.game.Inventory.prototype.getFirstEmptySlot = function(slotType) {
        for (var i = 0; i < this.slots.length; i++) {
            if ( this.slots[i].isEmpty() && this.slots[i].slotType == slotType ) {
                return this.slots[i];
            }
        };

        return null;
    };

    /**
     * Gets all slots of the specified slot type.
     * @param  {game.SlotTypes} slotType - the type you're interested in
     * retrieving
     * @return {Array:Slot} slots of that type
     */
    window.game.Inventory.prototype.getAllSlotsOfType = function(slotType) {
        var matchingSlots = [];
        for (var i = 0; i < this.slots.length; i++) {
            if ( this.slots[i].slotType == slotType ) {
                matchingSlots.push(this.slots[i]);
            }
        };

        return matchingSlots;
    };

    window.game.Inventory.prototype.addItem = function(item) {

        // if ( item == null ) return true;
        if ( item == null ) return game.AddedItemToInventoryState.FULLY_ADDED;

        // var addedItem = false;
        var addedItemState = game.AddedItemToInventoryState.NOT_ADDED;
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
                // addedItem = true;
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
                    // addedItem = true;
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
            // addedItem = true;
            addedItemState = game.AddedItemToInventoryState.FULLY_ADDED;
        } else if ( quantityLeft != originalQuantity ) {
            addedItemState = game.AddedItemToInventoryState.PARTIALLY_ADDED;
        }

        // return addedItem;
        return addedItemState;
    };

    /**
     * This function tells you how many of a given item you have in the
     * entire inventory.
     * @param  {Item} item - the item to check for
     * @return {Number}      the amount of that item you have
     */
    window.game.Inventory.prototype.getQuantityAcrossAllSlots = function(item) {

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
    };

    /**
     * This will return a slot that contains an item equivalent to the one
     * you pass in.
     * @param  {Item} item - an item to check for. This is not an '==='
     * check, just an item-type check.
     * @return {Slot}      the first slot that contains that item
     */
    window.game.Inventory.prototype.getSlotWithItem = function(item) {

        if ( item == null ) return null;

        for (var i = 0; i < this.slots.length; i++) {
            var itemInSlot = this.slots[i].item;
            if ( itemInSlot == null ) continue;
            if( item.itemID == itemInSlot.itemID ) {
                return this.slots[i];
            }
        };

        return null;
    };

}()); 