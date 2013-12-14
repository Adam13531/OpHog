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