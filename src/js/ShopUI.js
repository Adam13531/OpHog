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
     * Default text that shows up in the item description part of the Shop UI
     * @type {String}
     */
    window.game.DEFAULT_SHOP_UI_DESCRIPTION = '<p>Select an item you would like to buy.</p>';

	/**
	 * Marketplace for users to purchase items. There is only one of these
	 * objects. This inherits from game.InventoryUI
	 */
    window.game.ShopUI = function ShopUI() {
        this.base = game.InventoryUI;
        this.base();

        this.$itemDescriptionID = $('#shopui-item-description');

        this.$itemDescriptionID.html(game.DEFAULT_SHOP_UI_DESCRIPTION);

        var $shopDialog = $('#shop-screen');
        $shopDialog.dialog({
            autoOpen: false,
            resizable:false,
            autoResize: true,
            width: 360,
            height: 310,

            // Wrap the dialog in a span so that it gets themed correctly.
            appendTo:"#shopDialogThemeSpan",
            hide: {
                effect: 'fade',
                duration: game.DIALOG_HIDE_MS
            },

            // Position the unit placement screen in the center of the canvas
            position: {
                my: 'center',
                at: 'center',
                of: game.$canvas
            },
        });

        game.DialogManager.addDialog($shopDialog);

        // Turn this into a jQuery button so it gets themed
        $('#shopBuyButton').button();

        game.HammerHelper.registerClickAndTap($('#shopBuyButton'), this.buyItem());
    };

    window.game.ShopUI.prototype = new game.InventoryUI;

    /**
     * Shows the ShopUI
     */
    window.game.ShopUI.prototype.show = function() {
        $('#shop-screen').dialog('open');
    };

    /**
     * Hides the ShopUI
     */
    window.game.ShopUI.prototype.hide = function() {
        $('#shop-screen').dialog('close');
    };

    window.game.ShopUI.prototype.addedSlot = function(slot) {
        // This points to the element that we will add the SlotUI to.
        var domSelector;

        switch(slot.slotType) {
            case game.SlotTypes.EQUIP:
                domSelector = '#shopui-equippable-item-pane';
                scrollSelector = domSelector;
                break;
            case game.SlotTypes.USABLE:
                domSelector = '#shopui-usable-item-pane';
                break;
            default:
                console.log("Unrecognized slot type: " + slot.slotType);
                domSelector = 'body';
                break;
        }

        var newSlotUI = new game.ShopSlotUI(domSelector, slot);
        this.slots.push(newSlotUI);
    };

    window.game.ShopUI.prototype.clickedSlot = function(slotUI) {
        game.InventoryUI.prototype.clickedSlot.call(this, slotUI);
        this.updateBuyButton();
        this.updateDescription();
    };

    window.game.ShopUI.prototype.updatedSlot = function(slotIndex) {
        if (!game.InventoryUI.prototype.updatedSlot.call(this, slotIndex)) {
            return false;
        }

        this.updateDescription();
        return true;
    };

    //TODO: This is test code. Real buy prices will be computed
    // probably in Item.js in a better way
    window.game.ShopUI.prototype.getBuyPrice = function() {
        // var item = this.getSelectedSlot().slot.item;
        if ( this.getSelectedSlot() == null) {
            return 0;
        }

        var item = this.getSelectedSlot().slot.item;
        if ( item == null ) return 0;

        var sellPrice = game.playerInventoryUI.getSellPrice(item);
        if ( item.usable ) {
            return Math.floor(item.sellPrice * item.quantity * 20);
        } else {
            return sellPrice * 10;
        }
    };

    /**
     * Basically an event handler that gets alerted when the player either gains
     * or loses money.
     */
    window.game.ShopUI.prototype.playerDiamondsChanged = function() {
        this.updateBuyButton();
        this.updateDescription();
    };

    /**
     * Updates the buy button. It either gets enabled or disabled based on
     * whether or not the currently selected item is buyable. The cost of the
     * item is also always displayed on the buy button.
     */
    window.game.ShopUI.prototype.updateBuyButton = function() {
        if ( !this.itemIsBuyable() ) {
            $('#shopBuyButton').button('disable');
        } else {
            $('#shopBuyButton').button('enable');
        }
        $('#shopBuyButton').button( 'option' ,'icons', {
            secondary: 'diamond'
            });
        $('#shopBuyButton > .ui-button-text').html('Price: ' + this.getBuyPrice());
    };

    /**
     * Updates the UI because new items have been added to the inventory.
     * Ex) If a player bought something, that slot will be blank, 
     * so the buy button will be disabled. When this inventory refreshes, 
     * it should enable the buy button again if the player can buy the 
     * new item that appears there.
     */
    window.game.ShopUI.prototype.newItemsInInventory = function() {
        this.updateBuyButton();
    };

    window.game.ShopUI.prototype.buyItem = function() {
        return function() {
            // Update the description to let the user know that they need to
            // select the item they want to purchase.
            if ( game.ShopUI.getSelectedSlot() == null ) {
                game.ShopUI.$itemDescriptionID.html(game.DEFAULT_SHOP_UI_DESCRIPTION);
                return;
            }

            if ( !game.ShopUI.itemIsBuyable() ) {
                return;
            }

            var cost = game.ShopUI.getBuyPrice();
            var item = game.ShopUI.getSelectedSlot().slot.item;
            game.Player.modifyDiamonds(-cost);
            var added = game.Player.inventory.addItem(item);
            if ( added != game.AddedItemToInventoryState.NOT_ADDED) {
                game.ShopUI.getSelectedSlot().slot.setItem(null); // Removes the bought item
                game.ShopUI.updateBuyButton();
            } else {
                // Give the player their money back if they couldn't get the item
                // into their inventory.
                game.Player.modifyDiamonds(cost);
                // Alert the player that they don't have enough inventory space
                var textObj = new game.TextObj(game.canvasWidth / 2, game.canvasHeight / 2, 'You don\'t have enough inventory space', true, '#f00', false);
                game.TextManager.addTextObj(textObj);
            }
        };
    };

    /**
     * Checks to see if an item is buyable. 
     * @return {Boolean} - Returns true if the player has enough money and the 
     * currently selected slot isn't null or empty
     */
    window.game.ShopUI.prototype.itemIsBuyable = function() {
        // You can't buy items before you've bought your first unit, otherwise
        // you may make it impossible to beat even the first map.
        if ( !game.UnitPlacementUI.purchasedAtLeastOneUnit() ) {
            return false;
        }

        var cost = this.getBuyPrice();
        if ( !game.Player.hasThisManyDiamonds(cost) ||
              this.getSelectedSlot() == null ||
              this.getSelectedSlot().isEmpty() ) {
            return false;
        } else {
            return true;
        }
    };

}());