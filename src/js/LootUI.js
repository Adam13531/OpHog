( function() {

    /**
     * The number of seconds that an item should appear in the loot UI for. This
     * includes the time that is spent fading out.
     * @type {Number}
     */
    game.NUM_SEC_TO_SHOW_OBTAINED_ITEMS = 5;

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
         * @param {Number} originalQuantity      - for stackable items, this is
         * the quantity of the item when the enemy dropped it. This is needed
         * because of how stackable items are added to the inventory right now.
         * If this isn't supplied, the quantity is pulled from the item.
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
            $('#showLootNotifications').button('refresh');
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
                lootObject.opacity = opacity;
                if ( lootObject.ttl <= 0 ) {
                    this.lootObjects.splice(i, 1);
                    i--;
                }
            };
        },

        draw: function(ctx) {
            var x = 50;

            // Even if the minimap isn't showing at the upper left, we'll still
            // push this down.
            var y = game.Minimap.height + 10;
            var padding = 4;
            for (var i = 0; i < this.lootObjects.length; i++) {
                this.lootObjects[i].draw(x, y, ctx);
                y += this.lootObjects[i].height + padding;
            };
        }
    };
}()); 