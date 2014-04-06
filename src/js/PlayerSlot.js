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
     * Slots that belong in the player's inventory. This class inherits from
     * game.Slot.
     * @param {game.SlotTypes} slotType Type of slot this is
     * @param {Number} slotID ID for this slot
     */
	window.game.PlayerSlot = function PlayerSlot(slotType, slotID) {
		this.base = game.Slot;
		this.base(true, slotType, slotID);
	};

	window.game.PlayerSlot.prototype = new game.Slot;

	window.game.PlayerSlot.prototype.setItem = function(item) {
		game.Slot.prototype.setItem.call(this, item);
		
		// Tell the UI that we updated this slot.
        game.playerInventoryUI.updatedSlot(this.slotIndex);
	};

}());