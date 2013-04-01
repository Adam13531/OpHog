( function() {

    /**
     * Enum for valid slot types.
     */
    window.game.SlotTypes = {
        EQUIP: 'equip',
        USABLE: 'usable',
        WAR: 'war',
        WIZ: 'wiz',
        ARCH: 'arch'
    };

    /**
     * The ID that will be assigned to the next Slot created.
     * @type {Number}
     */
    window.game.slotID = 0;

    /**
     * Slot class. This class is completely unaware of SlotUI; any UI updates
     * that must be done must go through InventoryUI. For this reason, the
     * slotIndex must always match the corresponding SlotUI's index.
     * 
     * @param {SlotTypes} slotType - the type of the slot
     */
    window.game.Slot = function Slot(slotType) {
        // String representing the type of the slot - pull this from
        // window.game.SlotTypes
        this.slotType = slotType;

        // Number representing the index of the slot itself. This must match
        // the index of the corresponding SlotUI.
        this.slotIndex = game.slotID++;

        // New slots start with no item in them
        this.setItem(null);
    };

    /**
     * Sets the item in this slot.
     */
    window.game.Slot.prototype.setItem = function(item) {
        this.item = item;

        // Tell the UI that we updated this slot.
        game.InventoryUI.updatedSlot(this.slotIndex);
    };

    window.game.Slot.prototype.swapItems = function(otherSlot, simulateOnly) {
        var sourceItem = this.item;
        var targetItem = otherSlot.item;

        if ( !this.canHoldItem(targetItem) || !otherSlot.canHoldItem(sourceItem) ) {
            return false;
        }

        // If we just want to know if it's possible, then we return here now
        // that we know it is.
        if ( simulateOnly ) {
            return true;
        }

        this.setItem(targetItem);
        otherSlot.setItem(sourceItem);

        return true;
    };

    window.game.Slot.prototype.isEmpty = function() {
        return this.item == null;
    };

    window.game.Slot.prototype.canHoldItem = function(item) {
        if ( item == null ) return true;

        // Usable items can only fit into USABLE slots.
        if ( item.usable ) {
            return this.slotType == game.SlotTypes.USABLE;
        }

        // We know the item is equippable now.
        // Any equippable item can be placed in an EQUIP slot.        
        if (this.slotType == game.SlotTypes.EQUIP ) {
            return true;
        }

        // Need to match types now.
        if (this.slotType == game.SlotTypes.WAR && item.isEquippableBy(game.EquippableBy.WAR)) {
            return true;
        }
        if (this.slotType == game.SlotTypes.WIZ && item.isEquippableBy(game.EquippableBy.WIZ)) {
            return true;
        }
        if (this.slotType == game.SlotTypes.ARCH && item.isEquippableBy(game.EquippableBy.ARCH)) {
            return true;
        }

        return false;
    };

    /**
     * Returns true if this slot can hold an equippable item.
     */
    window.game.Slot.prototype.isEquipSlot = function() {
        return this.slotType == window.game.SlotTypes.EQUIP || this.slotType == window.game.SlotTypes.WAR || this.slotType == window.game.SlotTypes.WIZ || this.slotType == window.game.SlotTypes.ARCH;
    }; 

    /**
     * Returns true if this slot can hold a usable item.
     */
    window.game.Slot.prototype.isUsableSlot = function() {
        return this.slotType == window.game.SlotTypes.USABLE;
    };

}());
