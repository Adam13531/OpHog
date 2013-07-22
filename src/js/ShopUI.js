( function() {

	/**
	 * Marketplace for users to purchase items. There is only one of these
	 * objects. This inherits from game.InventoryUI
	 */
    window.game.ShopUI = function ShopUI() {
        this.base = game.InventoryUI;
        this.base();

        $('#shop-screen').dialog({
            autoOpen: false,
            resizable:false,
            autoResize: true,
            width: 260,

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
                domSelector = '#shopui-equippable-item-pane';
                scrollSelector = domSelector;

                // If the .scroll-content already exists...
                if ( $(domSelector + scrollContentClassSelector).length > 0 ) {
                    // Then we add the SlotUI to that.
                    domSelector += scrollContentClassSelector;
                }
                break;
            case game.SlotTypes.USABLE:
                domSelector = '#shopui-usable-item-pane';
                scrollSelector = domSelector;
                if ( $(domSelector + scrollContentClassSelector).length > 0 ) {
                    domSelector += scrollContentClassSelector;
                }
                break;
            default:
                console.log("Unrecognized slot type: " + slot.slotType);
                domSelector = 'body';
                break;
        }

        var newSlotUI = new game.SlotUI(domSelector, slot);
        this.slots.push(newSlotUI);

        if ( scrollSelector != null ) {
            window.ui.setSlider($(scrollSelector));
        }
    }

}()); 