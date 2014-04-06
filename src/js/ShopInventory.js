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
     * Amount of time that needs to go by (in seconds) until the shop's
     * inventory is refreshed with new items.
     * @type {Number}
     */
    window.game.INITIAL_SHOP_INVENTORY_REFRESH_TIME = 30;

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

        /**
        * Time in seconds until the inventory refreshes with new items
        * @type {Number}
        */
        this.timeUntilNewInventoryItems = game.INITIAL_SHOP_INVENTORY_REFRESH_TIME;

        this.generateItems();

        // Have the first item show by default by making it selected
        game.ShopUI.clickedSlot(game.ShopUI.slots[0]);
    };

    window.game.ShopInventory.prototype = new game.Inventory;

    /**
     * Randomly generates items and puts them into the shop inventory
     */
    window.game.ShopInventory.prototype.generateItems = function() {
        // Figure out the level of the items based on your units.
        var playerLevelStats = game.UnitManager.getLevelStatsOfPlayerUnits();

        var minItemLevel = 1;
        var averageLevel = playerLevelStats.averageLevel;
        var maxItemLevel = Math.max(1, Math.floor(playerLevelStats.maxLevel * 1.1));

        // Don't generate items if you don't have units. That way they can't use
        // their diamonds to buy items instead of their first unit.
        if ( averageLevel == 0 ) {
            // Try again in another second
            this.timeUntilNewInventoryItems = 1;
            return;
        }

        for (var i = 0; i < this.slots.length; i++) {
            // There's only a small chance per slot that a new item is
            // generated. There's no need to make this number too small since
            // people could just go AFK and wait for items or they could refresh
            // the tab to get new ones. I think 25% is good.
            if ( game.util.randomInteger(1,4) != 1 ) continue;

            var slot = this.slots[i];
            var allowUsable = slot.isUsableSlot();
            var allowEquippable = !allowUsable;

            minItemLevel = averageLevel;

            // 10% chance to make this slot have a minItemLevel of 1. This still
            // makes it very unlikely to actually show level 1 items when the
            // max level is high enough, but this way you will always be able to
            // find weak usable items.
            if ( allowUsable && game.util.randomInteger(1,10) == 1 ) {
                minItemLevel = 1;
            }
            var item = game.GenerateRandomItem(minItemLevel, maxItemLevel, allowUsable, allowEquippable);

            // There's a chance to raise the quantity of usable items so that
            // you're not always buying 'startingQuantity'.
            if ( item.usable && game.util.randomInteger(1,25) <= averageLevel ) {
                item.quantity = Math.min(99, item.quantity + game.util.randomInteger(0, averageLevel));
            }
            slot.setItem(item);
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
        var oldTime = this.timeUntilNewInventoryItems;
        this.timeUntilNewInventoryItems -= deltaInSeconds;

        // Only update when at least one second has actually passed (at the very
        // least so that we don't call '$.text()' repeatedly).
        if ( Math.floor(oldTime) == Math.floor(this.timeUntilNewInventoryItems) ) {
            return;
        }

        // Checks to see if new items need to be generated for the inventory
        if (this.timeUntilNewInventoryItems < 0) {
            this.timeUntilNewInventoryItems = game.INITIAL_SHOP_INVENTORY_REFRESH_TIME;
            this.generateItems();
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