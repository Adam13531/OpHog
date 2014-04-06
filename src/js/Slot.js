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
     * Slot base-class constructor. useThisConstructor is here to ensure that
     * this constructor is only being used when a base class really wants to
     * call it. That's because it gets called when a base class first inherits
     * from it.
     *
     * This class is completely unaware of SlotUI; any UI updates that must be
     * done must go through InventoryUI. For this reason, the slotIndex must
     * always match the corresponding SlotUI's index.
     * @param {Boolean} useThisConstructor - True when this constructor code
     * should run
     * @param {SlotTypes} slotType - the type of the slot
     * @param {Number} slotID - ID for this slot
     */
    window.game.Slot = function Slot(useThisConstructor, slotType, slotID) {
        if ( useThisConstructor === undefined ) return;

        // String representing the type of the slot - pull this from
        // window.game.SlotTypes
        this.slotType = slotType;

        // Number representing the index of the slot itself. This must match
        // the index of the corresponding SlotUI.
        this.slotIndex = slotID;

        // New slots start with no item in them
        this.setItem(null);
    };

    /**
     * Sets the item in this slot.
     * @param {Item} item - the item to set
     */
    window.game.Slot.prototype.setItem = function(item) {
        // You can't set an item that's depleted (i.e. a stackable item with 0
        // quantity).
        if ( item != null && item.isDepleted() ) {
            item = null;
        }

        this.item = item;
    };

    /**
     * Swaps two items. If simulateOnly is set, then this will tell you if the
     * swap is possible without actually doing it.
     * @param  {SlotUI} sourceSlot   the source slot. 'this' is treated as the
     * destination, so call this function like this.swapItems(source)
     * @param  {SlotUI} simulateOnly if true, this won't actually perform the
     * swap
     * @return {Boolean}              if simulateOnly is true, then this will
     * return true if the swap is possible. Otherwise, it returns true if the
     * swap actually took place.
     */
    window.game.Slot.prototype.swapItems = function(sourceSlot, simulateOnly) {
        var sourceItem = sourceSlot.item;
        var targetItem = this.item;

        if ( !this.canHoldItem(sourceItem) || !sourceSlot.canHoldItem(targetItem) ) {
            return false;
        }

        // If we just want to know if it's possible, then we return here now
        // that we know it is.
        if ( simulateOnly ) {
            return true;
        }

        // There's a special case if the source and target slot contain the same
        // type of stackable items. In that case, put as much of the source item
        // into the destination slot.
        if ( targetItem != null && sourceItem != null && targetItem.stackable && targetItem.itemID == sourceItem.itemID ) {
            // Perform this check so that we swap the items when we're moving an
            // incomplete stack to a complete one
            if ( targetItem.quantity != game.maxSlotQuantity ) {
                var amountToMove = Math.min(sourceItem.quantity, game.maxSlotQuantity - targetItem.quantity);

                sourceSlot.addQuantity(-amountToMove);
                this.addQuantity(amountToMove);

                return true;
            }
        }

        this.setItem(sourceItem);
        sourceSlot.setItem(targetItem);

        return true;
    };

    /**
     * Adds or subtracts from the item's quantity. This is here and not in Item
     * because the slot needs to update the UI, and the item has no reference to
     * the slot that holds it.
     * @param {Number} amount - a positive number if adding quantity, negative
     * if removing
     * @return {Number} the amount remaining to add/subtract
     */
    window.game.Slot.prototype.addQuantity = function(amount) {
        var item = this.item;
        if ( item == null || !item.stackable ) return amount;

        var amountThatFits;

        if ( amount < 0 ) {
            // You can't remove more than what exists...
            amountThatFits = Math.max(-item.quantity, amount);
        } else {
            // You can't make the slot overflow either
            amountThatFits = Math.min(game.maxSlotQuantity - item.quantity, amount);
        }

        item.quantity += amountThatFits;

        // Call setItem on the current contents now that we've updated the
        // quantities. This not only refreshes the UI, but it will nullify the
        // item if we just depleted it.
        this.setItem(item);

        // Return the remaining amount
        return amount - amountThatFits;
    };
    

    /**
     * @return {Boolean} true if this slot is empty
     */
    window.game.Slot.prototype.isEmpty = function() {
        return this.item == null;
    };

    /**
     * Returns true if this slot can hold the item passed in. This is only based
     * on slot types (i.e. it doesn't take quantity into account).
     * @param  {Item} item - the item to see if this can hold
     * @return {Boolean}      true if this slot can hold the item
     */
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
        return this.slotType == window.game.SlotTypes.EQUIP || this.isClassSlot();
    }; 

    /**
     * Returns true if this slot can hold items for a class of units.
     */
    window.game.Slot.prototype.isClassSlot = function() {
        return this.slotType == window.game.SlotTypes.WAR || 
            this.slotType == window.game.SlotTypes.WIZ || 
            this.slotType == window.game.SlotTypes.ARCH;
    };

    /**
     * Returns true if this slot can hold a usable item.
     */
    window.game.Slot.prototype.isUsableSlot = function() {
        return this.slotType == window.game.SlotTypes.USABLE;
    };

}());
