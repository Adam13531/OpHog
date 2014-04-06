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
     * Slots that actually get placed in the inventory UI for the player.
     * This inherits from SlotUI.
     * @param {String} domSelector - the jquery selector for the span representing the slot (e.g. '#some-span')
     * @param {Slot} slot - the Slot backing this SlotUI.
     */
	window.game.ShopSlotUI = function ShopSlotUI(domSelector, slot) {
		this.base = game.SlotUI;
		this.base(true, domSelector, slot);

        // Allow the user to double-click an item to buy it
        game.HammerHelper.registerDoubleClickAndDoubleTap($(this.$spanSelector), game.ShopUI.buyItem());
	};

	window.game.ShopSlotUI.prototype = new game.SlotUI;

	/**
     * Gets an onclick function to select a slot
     * @param  {SlotUI} slotUI - the slot you clicked
     * @return {Object} the onclick function
     */
    window.game.ShopSlotUI.prototype.clickedSlot = function(slotUI) {
        return function() {
            game.ShopUI.clickedSlot(slotUI);
        };
    };

}());