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

        // Number representing the type of item inside this slot, or null if
        // it's empty. This will eventually be an Item, not a Number.
        this.itemIndex = null;

        this.setItem(this.itemIndex);
    };

    /**
     * Sets the item in this slot.
     * @param {Number} itemIndex The index of the item to set.
     */
    window.game.Slot.prototype.setItem = function(itemIndex) {
        this.itemIndex = itemIndex;

        // Tell the UI that we updated this slot.
        game.InventoryUI.updatedSlot(this.slotIndex);
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
