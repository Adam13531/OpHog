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

}()); 