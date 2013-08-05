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
            height: 342,

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

        $('#shopBuyButton').click(function() {
            // Update the description to let the user know that they need to
            // select the item they want to purchase.
            if ( game.ShopUI.getSelectedSlot() == null ) {
                game.ShopUI.$itemDescriptionID.html(game.DEFAULT_SHOP_UI_DESCRIPTION);
                return;
            }
            var cost = game.ShopUI.getBuyPrice();
            var item = game.ShopUI.getSelectedSlot().slot.item;
            game.Player.modifyCoins(-cost);

            game.Player.inventory.addItem(item);
        });
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

    window.game.ShopUI.prototype.updateDescription = function() {
        game.InventoryUI.prototype.updateDescription.call(this);

        var cost = this.getBuyPrice();
        if ( !game.Player.hasThisMuchMoney(cost) ) {
            this.$itemDescriptionID.html('You don\'t have enough coins');
        }
    };

    window.game.ShopUI.prototype.playerCoinsChanged = function() {
        this.updateBuyButton();
        this.updateDescription();
    };

    window.game.ShopUI.prototype.updateBuyButton = function() {
        var cost = this.getBuyPrice();
        if ( !game.Player.hasThisMuchMoney(cost) ) {
            $('#shopBuyButton').attr('disabled', 'disabled');
        } else {
            $('#shopBuyButton').removeAttr('disabled');
        }
    };

}());