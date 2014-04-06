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
	 * UI for the player's inventory. This inherits from game.InventoryUI.
	 */
	window.game.PlayerInventoryUI = function PlayerInventoryUI() {
		this.base = game.InventoryUI;
		this.base();

        this.$itemDescriptionID = $('#item-description');
        this.$inventoryDialog = $('#inventory-screen');
        this.$sellItemButton = $('#sellItemButton');
        this.$useItemButton = $('#useItemButton');
        this.$useItemInstructions = $('#useItemInstructions');

		/**
         * This is the slot that you dragged from and must be global
         * 
         * This is also to fix a bug that happens when you just mouseUp on something
         * without actually dragging.
         * 
         * This needs to be global because it's shared amongst the different slots.
         */
        this.draggingSlotUI = null;

        /**
         * This is the item that you're using. If this is null, then you're not
         * in USE mode. It is set when you click "Use" so that you can still
         * click other slots and see what they do.
         * @type {Item}
         */
        this.usingItem = null;

        $('#war-section').append(game.util.makeTransparentImgTag('char-sprite war-alt-0-png', 'warSectionImage'));
        $('#wiz-section').append(game.util.makeTransparentImgTag('char-sprite wiz-alt-0-png', 'wizSectionImage'));
        $('#arch-section').append(game.util.makeTransparentImgTag('char-sprite arch-alt-0-png', 'archSectionImage'));

        // Clicking the character images will act as an equip/unequip button in
        // case drag doesn't work on their device for some reason (I'M LOOKING
        // AT YOU, WINDOWS PHONE).
        $('#warSectionImage').click(function() {
            game.playerInventoryUI.equipOrUnequipSelectedItem(game.SlotTypes.WAR);
        });
        $('#wizSectionImage').click(function() {
            game.playerInventoryUI.equipOrUnequipSelectedItem(game.SlotTypes.WIZ);
        });
        $('#archSectionImage').click(function() {
            game.playerInventoryUI.equipOrUnequipSelectedItem(game.SlotTypes.ARCH);
        });

        // Put some starter text for the description
        this.$itemDescriptionID.html('<h2>Click a slot to select it.</h2>');

        this.$useItemButton.button();

        // Lower the font size so that the button isn't huge
        $(this.$useItemButton.selector + '> span').css({
            'font-size': '.75em'
        });

        this.$sellItemButton.button();

        // Position the instructions based on the canvas so that it looks
        // like a banner at the top.
        var canvasPos = game.$canvas.position();
        var width = game.$canvas.width() - 100;
        var left = (game.$canvas.width() - width) / 2;
        this.$useItemInstructions.css({
            position : 'absolute',
            top : (canvasPos.top + 5) + 'px',
            left : (left) + 'px',
            width: (width) + 'px',
            opacity:.85
        });

        this.$useItemButton.button('disable');
        this.$sellItemButton.button('disable');
        this.$useItemInstructions.hide();

        this.$sellItemButton.click(function(inventoryUI) {
            return function() {
                inventoryUI.sellSelectedItem();
            }
        }(this));

        this.$useItemButton.click(function(inventoryUI) {
            return function() {
                inventoryUI.enterUseMode();
            }
        }(this));

        this.$useItemInstructions.click(function(inventoryUI) {
            return function() {
                inventoryUI.exitUseMode();
            }
        }(this));

        // For more thorough comments, look at the settings dialog.
        this.$inventoryDialog.dialog({
            // This is just for debugging (FYI: 'true' is for debugging, but
            // I sometimes check in this code with this set to 'false' but
            // with this comment still)
            autoOpen: false, 
            width:385,
            height:342,
            resizable:false,

            // Wrap the dialog in a span so that it gets themed correctly.
            appendTo:"#inventoryThemeSpan",
            hide: {
                effect: 'fade',
                duration: game.DIALOG_HIDE_MS
            },

            // Fade in very quickly
            show: {
                effect: 'fade',
                duration: game.DIALOG_SHOW_MS
            },

            // Position the inventory screen in the center of the canvas
            position: {
                my: 'center',
                at: 'center',
                of: game.$canvas
            },

        });

        game.DialogManager.addDialog(this.$inventoryDialog);
	};

	window.game.PlayerInventoryUI.prototype = new game.InventoryUI;
    
    /**
     * Equips or unequips the selected item. If you're the selected slot is an
     * equip slot, then this will equip to the class corresponding to
     * clickedSlotType.
     * @param  {game.SlotTypes} clickedSlotType - the slot to equip to (if
     * you're equipping), otherwise it isn't used).
     */
    window.game.PlayerInventoryUI.prototype.equipOrUnequipSelectedItem = function(clickedSlotType) {
        // There must be a selected slot with an item.
        if ( this.selectedSlotUI == null || this.selectedSlotUI.isEmpty() ) {
            return;
        }

        var selectedSlot = this.selectedSlotUI.slot;
        var slotToSwap = null;

        // The slot must be some kind of equippable slot.
        if ( selectedSlot.isUsableSlot() ) {
            return;
        }

        if ( selectedSlot.isClassSlot() ) {
            // It's a class slot, so we want to unequip the item.
            slotToSwap = game.Player.inventory.getFirstEmptySlot(game.SlotTypes.EQUIP);
        } else {
            // It's an equip slot, so we want to try equipping an item.
            slotToSwap = game.Player.inventory.getFirstEmptySlot(clickedSlotType);
        }

        // There must be an available slot to swap with.
        if ( slotToSwap == null ) {
            return;
        }

        // Get the corresponding SlotUI.
        var slotUIToSwap = this.slots[slotToSwap.slotIndex];

        // Do the swap.
        var success = this.selectedSlotUI.swapItems(slotUIToSwap, false);

        if ( success ) {
            // Select the slot we moved to
            game.playerInventoryUI.clickedSlot(slotUIToSwap);
        }
    };

    /**
     * Exit USE mode. This will hide the instructions that show up.
     */
    window.game.PlayerInventoryUI.prototype.exitUseMode = function(doNotCallShowUI) {
        $('#useItemInstructions').hide();
        if (doNotCallShowUI === undefined || !doNotCallShowUI ) {
            this.show();
        }
        this.usingItem = null;
        
        // See the other call to this where 'false' is specified.
        game.DialogManager.setCloseOnEscape(true);

        // Enable the sell button
        this.updateSellButton();
    };

    /**
     * @return {Boolean} true if the inventory is in USE mode.
     */
    window.game.PlayerInventoryUI.prototype.isInUseMode = function() {
        return this.usingItem != null;
    };

    /**
     * Sells the selected item.
     */
    window.game.PlayerInventoryUI.prototype.sellSelectedItem = function() {
        this.sellItemInSlot(this.selectedSlotUI);
    };

    window.game.PlayerInventoryUI.prototype.sellItemInSlot = function(slotUI) {
        // The dialog needs to be visible for this to work.
        if ( slotUI == null || slotUI.isEmpty() || !this.$inventoryDialog.is(":visible") || this.isInUseMode() ) {
            return;
        }

        var sellPrice = this.getSellPrice(slotUI.getItem());
        game.Player.modifyDiamonds(sellPrice);

        slotUI.slot.setItem(null);
    };

    /**
     * Returns true if the tile at the coordinates passed in is a valid
     * target for the item you're using.
     * @param  {Number} tileX - coordinate in tiles
     * @param  {Number} tileY - coordinate in tiles
     * @return {Boolean} - true if the tile is a valid target.
     */
    window.game.PlayerInventoryUI.prototype.isTileAUseTarget = function(tileX, tileY) {
        if (!this.isInUseMode()) return false;

        var useTarget = this.usingItem.useTarget;

        if ( useTarget == game.UseTarget.MAP ) {
            return true;
        } else if ( useTarget == game.UseTarget.MAP_WALKABLE_ONLY ) {
            if ( this.usingItem.itemID == game.ItemType.CREATE_SPAWNER.id ) {
                return game.currentMap.isValidTileToCreateSpawner(tileX,tileY,6);
            }
            if ( this.usingItem.itemID == game.ItemType.MEGA_CREATE_SPAWNER.id ) {
                return game.currentMap.isValidTileToCreateSpawner(tileX,tileY,20);
            }
            console.log('Error in isTileAUseTarget: ' + this.usingItem.name);
            return true;
        } else {
            // It's not an item that you can even use on the map.
            return false;
        }
    };

    /**
     * Returns true if the unit passed in is a valid target for the item
     * that you're using.
     * @param  {Unit}  unit - the unit to check
     * @return {Boolean}      true if valid, false if invalid or if you're
     * not in USE mode.
     */
    window.game.PlayerInventoryUI.prototype.isUnitAUseTarget = function(unit) {
        if (!this.isInUseMode() || !unit.hasBeenPlaced) return false;

        var useTarget = this.usingItem.useTarget;
        var isPlayer = unit.isPlayer();
        var isEnemy = unit.isEnemy();
        var isLiving = unit.isLiving();
        
        if (
            ( useTarget == game.UseTarget.LIVING_PLAYER_UNIT && isPlayer && isLiving ) ||
            ( useTarget == game.UseTarget.LIVING_PLAYER_AND_ENEMY_UNIT && isLiving ) ||
            ( useTarget == game.UseTarget.LIVING_ENEMY_UNIT && isEnemy && isLiving )
            ) {
            return true;
        }
        
        if (
            ( useTarget == game.UseTarget.DEAD_PLAYER_UNIT && isPlayer && !isLiving ) ||
            ( useTarget == game.UseTarget.DEAD_PLAYER_AND_ENEMY_UNIT && !isLiving ) ||
            ( useTarget == game.UseTarget.DEAD_ENEMY_UNIT && isEnemy && !isLiving )
            ) {
            return true;
        }

        return false;
    };

    /**
     * Adjusts the state associated with using an item. For example, updating
     * the quantity of an item or depleting it.
     */
    window.game.PlayerInventoryUI.prototype.justUsedItem = function() {
        // Check to see if we depleted the item
        if ( this.usingItem.isDepleted() ) {
            this.removeDepletedItems();

            // If we have another stack of that item, start using that.
            var slotWithSameItem = game.Player.inventory.getSlotWithItem(this.usingItem);
            if ( slotWithSameItem == null ) {
                this.exitUseMode();
            } else {
                this.usingItem = slotWithSameItem.item;
            }
        } else {
            // We call this because the item still exists, but
            // its quantity is lower.
            this.updateUseInstructions();

            // This updates the text on the item
            this.getSlotUIWithItem(this.usingItem).updateItem();
        }
    };

    /**
     * Uses an item on a unit if the conditions are appropriate (you're in USE
     * mode, 'unit' is a valid target).
     * @param  {Unit} unit - the unit to use the item on
     * @return {Boolean}      true if the item was used
     */
    window.game.PlayerInventoryUI.prototype.useItemOnUnit = function(unit) {
        if ( !this.isInUseMode() || !this.isUnitAUseTarget(unit) ) return false;

        this.usingItem.useOnUnit(unit);
        this.justUsedItem();

        return true;
    };

    /**
     * Attempts to use an item at the passed-in point, which may represent a
     * unit, a battle, a map tile, or nothing.
     * @param  {Number} x - world coordinate
     * @param  {Number} y - world coordinate
     * @return {Boolean}   true if the item was used
     */
    window.game.PlayerInventoryUI.prototype.attemptToUseItem = function(x, y) {
        if ( !this.isInUseMode() ) return false;

        var useTarget = this.usingItem.useTarget;
        var used = false;
        var tileX = Math.floor(x / game.TILESIZE);
        var tileY = Math.floor(y / game.TILESIZE);

        // Check to see if you're targeting a unit
        if ( useTarget == game.UseTarget.LIVING_PLAYER_UNIT || 
            useTarget == game.UseTarget.LIVING_PLAYER_AND_ENEMY_UNIT || 
            useTarget == game.UseTarget.LIVING_ENEMY_UNIT ||
            useTarget == game.UseTarget.DEAD_PLAYER_UNIT ||
            useTarget == game.UseTarget.DEAD_PLAYER_AND_ENEMY_UNIT ||
            useTarget == game.UseTarget.DEAD_ENEMY_UNIT
            ) {

            // Get all units at that point; we want to use the item on the
            // first VALID unit that we find, not just the first unit.
            var collidingUnits = game.UnitManager.getUnitsAtPoint(x, y);
            for (var i = 0; i < collidingUnits.length; i++) {

                if ( this.useItemOnUnit(collidingUnits[i]) ) {
                    // Return so that we don't use it on multiple units (i.e. if
                    // the units occupy the same spot)
                    return true;
                }
            };
        } else if ( this.isTileAUseTarget(tileX, tileY) ) {
            used = this.usingItem.useOnMap(x, y);
        }

        if ( used ) {
            this.justUsedItem();
        }

        return used;
    };

    /**
     * Given an item, this will return the slotUI that holds it. Passing in
     * null will probably return the first empty slotUI, but I don't suggest
     * doing that.
     * @param  {Item} item - the item whose slot you want to find
     * @return {SlotUI}      the slotUI, or null if not found.
     */
    window.game.PlayerInventoryUI.prototype.getSlotUIWithItem = function(item) {
        for (var i = 0; i < this.slots.length; i++) {
            if ( this.slots[i].getItem() === this.usingItem ) {
                return this.slots[i];
            }
        };

        return null;
    };

    /**
     * Remove all depleted items from the inventory. This is always safe to
     * call this since depleted items should never exist.
     *
     * I made this function because 'usingItem' is stored as an item, not a
     * slot, so there's no easy way to know which slot the item is in once
     * you've depleted it, so we just remove all depleted items.
     */
    window.game.PlayerInventoryUI.prototype.removeDepletedItems = function() {
        for (var i = 0; i < this.slots.length; i++) {
            var slot = this.slots[i].slot;

            if ( slot.isUsableSlot() && !slot.isEmpty() && slot.item.isDepleted() ) {
                slot.setItem(null);
            }
        };
    };

    /**
     * Update the instructions that appear when you're in USE mode.
     */
    window.game.PlayerInventoryUI.prototype.updateUseInstructions = function() {
        var item = this.usingItem;
        if ( item == null ) return;

        var totalQuantity = game.Player.inventory.getQuantityAcrossAllSlots(item);
        var quantityString = item.stackable ? ' (' + totalQuantity + ')' : '';
        var targetString;

        var useTarget = this.usingItem.useTarget;

        switch(useTarget) {
            case game.UseTarget.DEAD_PLAYER_UNIT:
                targetString = 'Tap one of your dead units';
                break;

            case game.UseTarget.LIVING_PLAYER_UNIT:
                targetString = 'Tap one of your living units';
                break;
            
            case game.UseTarget.DEAD_PLAYER_AND_ENEMY_UNIT:
                targetString = 'Tap any dead unit';
                break;

            case game.UseTarget.LIVING_PLAYER_AND_ENEMY_UNIT:
                targetString = 'Tap any living unit';
                break;
            
            case game.UseTarget.DEAD_ENEMY_UNIT:
                targetString = 'Tap a dead enemy unit';
                break;

            case game.UseTarget.LIVING_ENEMY_UNIT:
                targetString = 'Tap a living enemy unit';
                break;

            case game.UseTarget.MAP:
                targetString = 'Tap the map';
                break;

            case game.UseTarget.MAP_WALKABLE_ONLY:
                targetString = 'Tap a path tile';
                break;

            default:
                targetString = 'UNDEFINED123';
                break;
        }

        this.$useItemInstructions.text(targetString + ' to use ' + 
            item.name + quantityString + ' or tap here to cancel');
    };

    /**
     * Enters USE mode. This will hide the inventory screen.
     */
    window.game.PlayerInventoryUI.prototype.enterUseMode = function() {
        if ( !this.canUseItem() ) {
            return;
        }

        // Disable the "escape closes a dialog" functionality so that you can
        // exit USE mode without closing dialogs.
        game.DialogManager.setCloseOnEscape(false);

        var item = this.selectedSlotUI.getItem();
        this.usingItem = item;

        this.updateUseInstructions();

        this.hide();
        this.$useItemInstructions.show();

        // Disable the sell button
        this.updateSellButton();
    };

    /**
     * Gets the sell price of the specified item.
     * @param  {Item} item - the item whose sell price you want
     * @return {Number}      - the sell price
     */
    window.game.PlayerInventoryUI.prototype.getSellPrice = function(item) {
        if ( item == null ) {
            return 0;
        }

        var price = item.sellPrice;

        if ( item.usable ) {
            price *= item.quantity;
        } else {
            price += Math.max(0, item.atk);
            price += Math.max(0, item.def);
            price += Math.max(0, Math.floor(item.life / 2.0));
        }

        price = Math.floor(price);

        return price;
    };

    /**
     * Updates the sell button with the appropriate text. Also
     * enables/disables the button.
     */
    window.game.PlayerInventoryUI.prototype.updateSellButton = function() {
        var fontSize = game.playerUsedKeyboard ? '.75em' : '.75em';
        var sellText = 'Sell' + (game.playerUsedKeyboard ? ' (Q)' : '');
        var sellSpan = '<span class="ui-button-text" style="font-size:' + fontSize + '">' + sellText + '</span>';

        if ( this.selectedSlotUI == null || this.selectedSlotUI.isEmpty() || this.isInUseMode() ) {
            this.$sellItemButton.button('disable');
            this.$sellItemButton.html(sellSpan);
            return;
        }

        var item = this.selectedSlotUI.getItem();
        var sellPrice = this.getSellPrice(item);

        this.$sellItemButton.button('enable');
        this.$sellItemButton.html(sellSpan + '<span style="font-size:.75em">' + 
            sellPrice + ' </span>' + 
            game.util.makeTransparentImgTag('icon-sprite diamond-icon'));
    };

    /**
     * This should be called whenever a Slot is added to the inventory.
     *
     * That way, the UI can make a new SlotUI to show it.
     * @param {Slot} slot - the slot to add
     */
    window.game.PlayerInventoryUI.prototype.addedSlot = function(slot) {
        // This points to the element that we will add the SlotUI to.
        var domSelector;

        // This needs some explanation. When we call setSlider on a div, all
        // of the existing children are wrapped in a .scroll-content class.
        // From then on, you need to add to the .scroll-content, not the
        // original div, otherwise your new items will not be in the scroll
        // area.
        var scrollContentClassSelector = ' > .scroll-content';
        var setScrollable = false;

        // This points to the scrollpane, assuming the div in question was
        // already made into a scrollpane (i.e. on all calls to this
        // function after the first).
        var scrollSelector = null;

        switch(slot.slotType) {
            case game.SlotTypes.EQUIP:
                domSelector = '#equippable-item-scroll-pane';
                scrollSelector = domSelector;

                // If the .scroll-content already exists...
                if ( $(domSelector + scrollContentClassSelector).length > 0 ) {
                    // Then we add the SlotUI to that.
                    domSelector += scrollContentClassSelector;
                }
                break;
            case game.SlotTypes.USABLE:
                domSelector = '#usable-item-scroll-pane';
                scrollSelector = domSelector;
                if ( $(domSelector + scrollContentClassSelector).length > 0 ) {
                    domSelector += scrollContentClassSelector;
                }
                break;
            case game.SlotTypes.WAR:
                domSelector = '#war-section';
                break;
            case game.SlotTypes.WIZ:
                domSelector = '#wiz-section';
                break;
            case game.SlotTypes.ARCH:
                domSelector = '#arch-section';
                break;
            default:
                console.log("Unrecognized slot type: " + slot.slotType);
                domSelector = 'body';
                break;
        }

        var newSlotUI = new game.PlayerSlotUI(domSelector, slot);
        this.slots.push(newSlotUI);

        if ( scrollSelector != null ) {
            window.ui.setSlider($(scrollSelector));
        }
    };

    /**
     * If slots were added to the inventory UI while it was hidden, then the
     * setSlider code will determine that the scroll content has a height of
     * 0 and will not actually assign a scrollbar.
     *
     * That means you need to call this when the inventory UI is made
     * visible.
     */
    window.game.PlayerInventoryUI.prototype.setScrollbars = function() {
        window.ui.setSlider($('#equippable-item-scroll-pane'));
        window.ui.setSlider($('#usable-item-scroll-pane'));
    };

    /**
     * This is its own function because setScrollbars also needs to be
     * called every time you show the inventory screen.
     */
    window.game.PlayerInventoryUI.prototype.show = function() {
        this.$inventoryDialog.dialog('open');

        // See the comment for setScrollbars to see why this is needed.
        this.setScrollbars();
    };

    /**
     * Convenience function to hide the inventory UI
     */
    window.game.PlayerInventoryUI.prototype.hide = function() {
        this.$inventoryDialog.dialog('close');
    };

    window.game.PlayerInventoryUI.prototype.toggleVisibility = function() {
        if ( this.$inventoryDialog.is(":visible") ) {
            this.hide();
        } else {
            this.show();
        }
    };

    /**
     * This is called when a slot's item is changed.
     * @param  {Number} slotIndex The index of the Slot/SlotUI that changed.
     */
    window.game.PlayerInventoryUI.prototype.updatedSlot = function(slotIndex) {
        game.InventoryUI.prototype.updatedSlot.call(this, slotIndex);
        this.updateSellButton();
    };

    window.game.PlayerInventoryUI.prototype.revertHighlightOnAllSlots = function() {
        for (var i = 0; i < this.slots.length; i++) {
            this.slots[i].highlight(false, false);
        };
    };

    window.game.PlayerInventoryUI.prototype.getSlot = function(slotIndex) {
        return this.slots[slotIndex];
    };


    /**
     * Enables or disables the useItemButton appropriately.
     */
    window.game.PlayerInventoryUI.prototype.setUseItemButtonState = function() {
        if ( this.canUseItem() ) {
            this.$useItemButton.button('enable');
        } else {
            this.$useItemButton.button('disable');
        }
    };

    /**
     * @return {Boolean} true if you can use the selected item. If there's
     * no item selected or if we're in the wrong game state, then this
     * returns false.
     */
    window.game.PlayerInventoryUI.prototype.canUseItem = function() {
        var selectedSlotUI = this.selectedSlotUI;
        if ( selectedSlotUI == null ) return false;
        var slot = selectedSlotUI.slot;

        var correctGameState = (game.GameStateManager.isNormalGameplay() || game.GameStateManager.isMinigameGameplay());

        return correctGameState && !slot.isEmpty() && slot.isUsableSlot();
    };

    window.game.PlayerInventoryUI.prototype.clickedSlot = function(slotUI) {
        game.InventoryUI.prototype.clickedSlot.call(this, slotUI);

        this.updateSellButton();
        this.updateDescription();
    };

    window.game.PlayerInventoryUI.prototype.updatedSlot = function(slotIndex) {
        if ( !game.InventoryUI.prototype.updatedSlot.call(this, slotIndex) ) {
            return false;
        }

        // Update the description
        this.updateDescription();
        this.updateSellButton();
        
        // It's possible that we now need to update the use instructions
        // too, for example, if we just acquired more of the item that we're
        // currently using.
        this.updateUseInstructions();

        return true;
    };

    window.game.PlayerInventoryUI.prototype.updateDescription = function() {
        game.InventoryUI.prototype.updateDescription.call(this);
        this.setUseItemButtonState();
    };

    /**
     * Attempts to use an item at the passed-in point, which may represent a
     * unit, a battle, a map tile, or nothing.
     * @param  {Number} x - world coordinate
     * @param  {Number} y - world coordinate
     * @return {Boolean}   true if the item was used
     */
    window.game.PlayerInventoryUI.attemptToUseItem = function(x, y) {
        if ( !this.isInUseMode() ) return false;

        var useTarget = this.usingItem.useTarget;
        var used = false;
        var tileX = Math.floor(x / game.TILESIZE);
        var tileY = Math.floor(y / game.TILESIZE);

        // Check to see if you're targeting a unit
        if ( useTarget == game.UseTarget.LIVING_PLAYER_UNIT || 
            useTarget == game.UseTarget.LIVING_PLAYER_AND_ENEMY_UNIT 
            || useTarget == game.UseTarget.LIVING_ENEMY_UNIT ) {

            // Get all units at that point; we want to use the item on the
            // first VALID unit that we find, not just the first unit.
            var collidingUnits = game.UnitManager.getUnitsAtPoint(x, y);
            for (var i = 0; i < collidingUnits.length; i++) {

                if ( this.isUnitAUseTarget(collidingUnits[i]) ) {
                    this.usingItem.useOnUnit(collidingUnits[i]);
                    used = true;

                    // Break so that we don't use it on multiple units (i.e.
                    // if the units occupy the same spot)
                    break;
                }
            };
        } else if ( this.isTileAUseTarget(tileX, tileY) ) {
            used = this.usingItem.useOnMap(x, y);
        }

        if ( used ) {
            // Check to see if we depleted the item
            if ( this.usingItem.isDepleted() ) {
                this.removeDepletedItems();

                // If we have another stack of that item, start using that.
                var slotWithSameItem = game.Inventory.getSlotWithItem(this.usingItem);
                if ( slotWithSameItem == null ) {
                    this.exitUseMode();
                } else {
                    this.usingItem = slotWithSameItem.item;
                }
            } else {
                // We call this because the item still exists, but
                // its quantity is lower.
                this.updateUseInstructions();

                // This updates the text on the item
                this.getSlotUIWithItem(this.usingItem).updateItem();
            }
        }

        return used;
    };

    /**
     * Remove all depleted items from the inventory. This is always safe to
     * call this since depleted items should never exist.
     *
     * I made this function because 'usingItem' is stored as an item, not a
     * slot, so there's no easy way to know which slot the item is in once
     * you've depleted it, so we just remove all depleted items.
     */
    window.game.PlayerInventoryUI.removeDepletedItems = function() {
        for (var i = 0; i < this.slots.length; i++) {
            var slot = this.slots[i].slot;

            if ( slot.isUsableSlot() && !slot.isEmpty() && slot.item.isDepleted() ) {
                slot.setItem(null);
            }
        };
    };

}());