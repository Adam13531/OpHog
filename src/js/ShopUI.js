( function() {

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

        $('#shop-screen').dialog({
            autoOpen: true,
            resizable:false,
            autoResize: true,
            width: 400,
            height: 310,

            // Wrap the dialog in a span so that it gets themed correctly.
            appendTo:"#shopDialogThemeSpan",
            hide: {
                effect: 'fade',
                duration: 400
            },

            // Position the unit placement screen in the center of the canvas
            position: {
                my: 'center',
                at: 'center',
                of: ('#canvas')
            },
        });

        // Turn this into a jQuery button so it gets themed
        $('#shopBuyButton').button();

        $('#shopBuyButton').click(this.buyItem());
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
        game.InventoryUI.prototype.updatedSlot.call(this, slotIndex);

        // Update the description
        this.updateDescription();
    };

    //TODO: This is test code. Real buy prices will be computed
    // probably in Item.js in a better way
    window.game.ShopUI.prototype.getBuyPrice = function() {
        // var item = this.getSelectedSlot().slot.item;
        if ( this.getSelectedSlot() == null) {
            return 0;
        }

        var item = this.getSelectedSlot().slot.item;
        if ( item == null ) {
            return 0;
        }

        return item.itemID * 1000;
    };

    window.game.ShopUI.prototype.playerCoinsChanged = function() {
        this.updateBuyButton();
        this.updateDescription();
    };

    window.game.ShopUI.prototype.updateBuyButton = function() {
        if ( !this.itemIsBuyable() ) {
            $('#shopBuyButton').button('disable');
        } else {
            $('#shopBuyButton').button('enable');
        }
        $('#shopBuyButton').text('Buy $' + this.getBuyPrice());
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
            game.Player.modifyCoins(-cost);
            var added = game.Player.inventory.addItem(item);
            if ( added != game.AddedItemToInventoryState.NOT_ADDED) {
                game.ShopUI.getSelectedSlot().slot.setItem(null); // Removes the bought item
                game.ShopUI.updateBuyButton();
            } else {
                // Give the player their money back if they couldn't get the item
                // into their inventory.
                game.Player.modifyCoins(cost);
                var textObj = new game.TextObj(screenWidth / 2, screenHeight / 2, 'You don\'t have enough inventory space', true, '#f00', false);
                game.TextManager.addTextObj(textObj);
            }
        };
    };

    window.game.ShopUI.prototype.itemIsBuyable = function() {
        var cost = this.getBuyPrice();
        if (  !game.Player.hasThisMuchMoney(cost) ||
              this.getSelectedSlot() == null ||
              this.getSelectedSlot().isEmpty() ) {
            return false;
        } else {
            return true;
        }
    };

}());