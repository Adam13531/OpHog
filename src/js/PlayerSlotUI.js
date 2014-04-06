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
	window.game.PlayerSlotUI = function PlayerSlotUI(domSelector, slot) {
		this.base = game.SlotUI;
		this.base(true, domSelector, slot);

		// http://stackoverflow.com/questions/2098387/jquery-ui-draggable-elements-not-draggable-outside-of-scrolling-div
        var dropped = false;

        // Capture this slot in the closures below
        var thisSlotUI = this;

        this.$itemImage.draggable({
            // prevents ui-draggable from being added
            addClasses:false,

            // Prevents you from dragging outside of this element
            containment: '#top_part_with_characters_and_items',

            // The z-index of the draggable helper. IE requires this to be
            // explicitly set to something higher than the dialog's z-index.
            zIndex: 100,

            // Reverts back to original position if target is invalid
            revert: 'invalid',

            // Element is cloned and the clone is dragged
            helper: 'clone',

            // Used to scope this draggable so that dragging the dialog won't
            // trigger these events
            scope: 'inventory-draggable',

            // Where the draggable helper is appended while dragging
            appendTo: 'body',

            start: function(event, ui) {
                dropped = false;
                game.playerInventoryUI.draggingSlotUI = thisSlotUI;
                $(this).addClass('hideit');
            },
            stop: function(event, ui) {
                // $(this) refers to the original DOM element that you dragged.
                // We use the clone helper, so if we dropped the clone, then
                // we can remove the original (which was hidden anyway). If
                // the clone wasn't accepted, then it will revert back to its
                // original position, then it will be removed, so we need to
                // show our original again.
                if (dropped==true) {
                    $(this).remove();
                } else {
                    $(this).removeClass('hideit');
                }

                // Revert all highlighting
                game.playerInventoryUI.revertHighlightOnAllSlots();

                game.playerInventoryUI.draggingSlotUI = null;
            },

            // If true, container auto-scrolls while dragging
            scroll: false
        });

 		// Although yes, this is droppable for the slot, it may make more sense to put this in InventoryUI.
        $(this.$spanSelector).droppable({
            scope: 'inventory-draggable',

            // This is triggered when something is dragged. We do this instead
            // of just setting an activeClass so that we do more than just apply
            // css.
            //
            // If this isn't called, then slots won't be highlighted when you
            // start dragging.
            // 
            // We don't implement deactivate because we need to revert all of
            // the slots' visual state after the drop ends, so that goes in the
            // draggable's 'stop' function.
            activate: function(event, ui) {
                var targetID = $(this).attr('id');
                var targetSlotIndex = parseInt(targetID.replace('slot', ''));

                if (thisSlotUI.swapItems(game.playerInventoryUI.draggingSlotUI, true)) {
                    thisSlotUI.highlight(true, false);
                }

            },

            // This returns true if this will accept the dragged item. There
            // many droppables though, so suppose you drop an item in slot #3
            // (which means drop() was called), that doesn't stop accept() from
            // being called on all slots afterward, except drop() was already
            // called, so now the slot whose item you WERE dragging is
            // potentially empty, and that'll change the value of "accept" this
            // time around. That's not the only problem though: imagine you're
            // dragging an equippable item - it would graphically fade all of
            // the usable slots since you can't drag an equippable item to a
            // usable slot. That would never get reverted since 'accept' is
            // always going to return false for the usable slots.  The solution
            // is this: when you're done dragging the item entirely, revert all
            // graphical state back to what it was before you dragged.
            accept: function(elm) {
                if (game.playerInventoryUI.draggingSlotUI == null ) return null;

                var canBeDraggedTo = thisSlotUI.swapItems(game.playerInventoryUI.draggingSlotUI, true);
                if ( !canBeDraggedTo ) {
                    // Highlight it red. If we wanted to add a class here, we'd
                    // need to make sure to remove them in the 'stop' of the
                    // draggable with something like
                    // $('.testactive').removeClass('testactive');
                    thisSlotUI.highlight(false, true);
                }
                return canBeDraggedTo;
            },

            // Whatever you're hovering over will get this class
            hoverClass: 'testhover',

            // This only applies to things that accept() the draggable
            // activeClass: 'testactive',
            drop: function(event, ui) {
                if (thisSlotUI.slotIndex == game.playerInventoryUI.draggingSlotUI.slotIndex) {
                    return;
                }

                var success = thisSlotUI.swapItems(game.playerInventoryUI.draggingSlotUI, false);
                if ( success ) {
                    dropped = true;

                    // Select the slot we moved to
                    game.playerInventoryUI.clickedSlot(thisSlotUI);
                    $.ui.ddmanager.current.cancelHelperRemoval = true;
                    ui.helper.remove();
                    return true;
                }

                return false;
            }
        });

        // For usable slots, double-clicking will enter USE mode.
        if ( this.slot.isUsableSlot() ) {
            game.HammerHelper.registerDoubleClickAndDoubleTap($(this.$spanSelector), this.useItem(this));
        }

        // For equippable slots, double-clicking will sell the item.
        // if ( this.slot.isEquipSlot() ) {
        //     game.HammerHelper.registerDoubleClickAndDoubleTap($(this.$spanSelector), this.sellItem(this));
        // }
	}; 

	window.game.PlayerSlotUI.prototype = new game.SlotUI;

    window.game.PlayerSlotUI.prototype.swapItems = function(otherSlotUI, simulateOnly) {
	    // If no SlotUI was passed in, then we can't swap.
	    if ( otherSlotUI == null ) {
	        return false;
	    }

        return this.slot.swapItems(otherSlotUI.slot, simulateOnly);
    };

    /**
     * Gets a dblclick function to enter USE mode.
     * @param  {SlotUI} slot - the slot you double-clicked
     * @return {Object} the dblclick function
     */
    window.game.PlayerSlotUI.prototype.useItem = function(slotUI) {
        return function() {
            if (!slotUI.isEmpty()) {
                game.playerInventoryUI.enterUseMode();
            }
        };
    };

    /**
     * Gets a dblclick function to sell an item.
     * @param  {SlotUI} slotUI - the slot you double-clicked
     * @return {Object}        - the dblclick function
     */
    window.game.PlayerSlotUI.prototype.sellItem = function(slotUI) {
        return function() {
            if (!slotUI.isEmpty()) {
                game.playerInventoryUI.sellItemInSlot(slotUI);
            }
        };
    };

    /**
     * Gets an onclick function to select a slot
     * @param  {SlotUI} slotUI - the slot you clicked
     * @return {Object} the onclick function
     */
    window.game.PlayerSlotUI.prototype.clickedSlot = function(slotUI) {
        return function() {
            game.playerInventoryUI.clickedSlot(slotUI);
        };
    };

}());