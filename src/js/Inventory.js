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
     * Status to let us know how much of an item was added to an inventory.
     */
    window.game.AddedItemToInventoryState = {
        NOT_ADDED: 'not added',
        PARTIALLY_ADDED: 'partially added',
        FULLY_ADDED: 'fully added'
    };

    /**
     * Inventory base-class constructor
     *
     * The useThisConstructor parameter needs to be checked so that the slots
     * don't get created twice. When nothing is passed in (i.e., when a base
     * class first inherits from this class using "new"), then this constructor
     * won't be run. Therefore, when a base class inherits from this, then in
     * that class' constructor, you need to have code like this if you want to
     * use this constructor:
     *
     * this.base = game.Inventory;
     * this.base(true); // Pass in true (or anything really) to make sure the 
     *                  // base constructor will be called
     * 
     * Those two lines need to be in there no matter what, but if you actually
     * want to use this constructor, then pass in true (or anything really. it
     * just needs to be something so that the parameter isn't undefined).
     * There is probably a better way to do this.
     * @param {Boolean} useThisConstructor Tells us whether or not to run the 
     * code in this constructor
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

    /**
     * Function that can be implemented to generate items.
     */
    window.game.Inventory.prototype.generateItems = function() {
        console.log('generateItems - unimplemented in game.Inventory base class');
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