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
     * The number of seconds that an item should appear in the loot UI for. This
     * includes the time that is spent fading out.
     * @type {Number}
     */
    game.NUM_SEC_TO_SHOW_OBTAINED_ITEMS = 5;

    /**
     * Loot notifications will show up at this X coordinate. The X coordinate is
     * important because loot notifications are just textboxes, and texboxes can
     * be reflowed if their width would make them go off the screen, so the X
     * coordinates shouldn't change.
     * @type {Number}
     */
    game.LOOT_NOTIFICATION_X = 50;

    /**
     * The loot UI shows you which items you recently obtained.
     */
    window.game.LootUI = {

        /**
         * Used to identify the HTML element holding the item information.
         * @type {Number}
         */
        nextID: 0,

        /**
         * Array of objects representing loot you recently got.
         * @type {Array:LootObject}
         */
        lootObjects: new Array(),

        /**
         * If true, loot notifications will show up on the screen.
         * @type {Boolean}
         */
        showLootNotifications: true,

        setupUI: function() {
            // Set loot notifications to enabled. The save file (or the user)
            // can later change this.
            this.setShowLootNotifications(true);
        },

        /**
         * Alerts the user that they obtained an item. This will add a row to
         * the UI.
         * @param {Item} item                  - the item you got
         * @param {Boolean} didItemFitInInventory - if false, a message will be
         * displayed about how there isn't enough room
         * @param {Number} originalQuantity      - this is the quantity of the
         * item when the enemy dropped it (as opposed to the quantity that will
         * fit in the inventory).
         */
        addItemNotification: function(item, didItemFitInInventory, originalQuantity) {
            if ( item == null || !this.showLootNotifications) return;

            var lootObject = new game.LootObject(item, originalQuantity, didItemFitInInventory);
            this.lootObjects.push(lootObject);
        },

        /**
         * Sets showLootNotifications and updates the button appropriately.
         * @param {Boolean} enabled - this is optional. If you leave it
         * undefined, then it will be treated as whatever the current state of
         * the button is.
         */
        setShowLootNotifications: function(enabled) {
            if ( enabled === undefined ) {
                enabled = $('#showLootNotifications').prop('checked');
            }

            this.showLootNotifications = enabled;
            $('#showLootNotifications').prop('checked', enabled);
        },

        /**
         * Update all of the loot objects, fading out where necessary.
         * @param  {Number} delta - time elapsed in ms since this was last
         * called
         */
        update: function(delta) {
            var deltaAsSec = delta / 1000;
            var change = this.speed * deltaAsSec;
            var lootObject;
            var opacity;

            for (var i = 0; i < this.lootObjects.length; i++) {
                lootObject = this.lootObjects[i];
                lootObject.ttl -= deltaAsSec;

                var ratio = lootObject.ttl / game.NUM_SEC_TO_SHOW_OBTAINED_ITEMS;

                // Opacity equation (let 'r' == 'ratio'): 3r² + 2r + .15
                // This way, it shows at full opacity for quite some time before
                // fading to .15 very quickly.
                opacity = (3 * ratio * ratio) + (2 * ratio) + .15;
                opacity = Math.min(1, opacity);
                lootObject.backgroundOpacity = opacity / 2;
                lootObject.foregroundOpacity = opacity;
                if ( lootObject.ttl <= 0 ) {
                    this.lootObjects.splice(i, 1);
                    i--;
                }
            };
        },

        draw: function(ctx) {
            // Even if the minimap isn't showing at the upper left, we'll still
            // push this down.
            var y = game.Minimap.height + 10;
            var padding = 4;
            for (var i = 0; i < this.lootObjects.length; i++) {
                this.lootObjects[i].y = y;
                this.lootObjects[i].draw(ctx);
                y += this.lootObjects[i].height + padding;
            };
        }
    };
}()); 