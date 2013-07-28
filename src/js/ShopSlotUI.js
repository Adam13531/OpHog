( function() {

	window.game.ShopSlotUI = function ShopSlotUI(domSelector, slot) {
		this.base = game.SlotUI;
		this.base(true, domSelector, slot);
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