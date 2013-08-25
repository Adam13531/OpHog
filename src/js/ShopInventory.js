( function() {

    /**
     * Amount of time that needs to go by (in seconds) until the shop's
     * inventory is refreshed with new items.
     * @type {Number}
     */
    window.game.INITIAL_SHOP_INVENTORY_REFRESH_TIME = 20;

	/**
	 * Inventory for the shop. This inherits from game.Inventory
	 */
    window.game.ShopInventory = function ShopInventory() {
        this.base = game.Inventory;
        this.base(true);

        // Add equippable slots
        for (var i = 0; i < 10; i++) {
            var newSlot = new game.ShopSlot(game.SlotTypes.EQUIP, this.slotID++);
            this.addSlot(newSlot);
        };

        // Add usable slots
        for (var i = 0; i < 10; i++) {
            var newSlot = new game.ShopSlot(game.SlotTypes.USABLE, this.slotID++);
            this.addSlot(newSlot);
        };

        this.generateItems();

        /**
        * Time in seconds until the inventory refreshes with new items
        * @type {Number}
        */
        this.timeUntilNewInventoryItems = game.INITIAL_SHOP_INVENTORY_REFRESH_TIME;

        // Have the first item show by default by making it selected
        game.ShopUI.clickedSlot(game.ShopUI.slots[0]);
    };

    window.game.ShopInventory.prototype = new game.Inventory;

    /**
     * Randomly generates items and puts them into the shop inventory
     */
    window.game.ShopInventory.prototype.generateItems = function() {
        for (var i = 0; i < this.slots.length; i++) {
            var slot = this.slots[i];
            slot.setItem(game.GenerateRandomInventoryItem(slot.isUsableSlot()));
        };
    };

    window.game.ShopInventory.prototype.addSlot = function(slot) {
        game.Inventory.prototype.addSlot.call(this, slot);

        // Tell the UI that we've added a slot so it will add the graphic
        // to the UI.
        game.ShopUI.addedSlot(slot);
    };

    /**
     * Updates things every game loop
     * @param  {Number} deltaInSeconds - change in seconds since last update
     */
    window.game.ShopInventory.prototype.update = function(deltaInSeconds) {
        this.timeUntilNewInventoryItems -= deltaInSeconds;

        // Checks to see if new items need to be generated for the inventory
        if (this.timeUntilNewInventoryItems < 0) {
            this.generateItems();
            this.timeUntilNewInventoryItems = game.INITIAL_SHOP_INVENTORY_REFRESH_TIME;
            // Let the UI know that there are new items in the inventory
            game.ShopUI.newItemsInInventory();
        }
        // Set the timer on the shop UI
        var roundedTime = Math.ceil(this.timeUntilNewInventoryItems);
        var minutes = Math.floor(roundedTime / 60);
        var seconds = roundedTime % 60;
        var secondsString = (seconds >= 10) ? seconds : '0' + seconds;

        $('#newItemTimer').text('New items in: ' + minutes + ':' + secondsString);
    };

}()); 