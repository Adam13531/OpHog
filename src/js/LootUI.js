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
         * Sets up the entire loot UI.
         */
        setupUI: function() {
            $('#loot-ui').dialog({
                autoOpen: false, 

                // Set a reasonable width. For now, you'll still have multi-line
                // loot notifications when you run out of space or if your item
                // name is too long.
                width:300,

                minHeight:30,
                autoResize: true,
                resizable:false,

                // Wrap the dialog in a span so that it gets themed correctly.
                appendTo:"#lootUIDialogThemeSpan",

                // Fade in very quickly
                show: {
                    effect: 'fade',
                    duration: game.DIALOG_SHOW_MS
                },

                // Position at the upper left of the canvas
                position: {
                    my: 'left top',
                    at: 'left top',
                    of: ('#canvas')
                },
    
            });
        },

        /**
         * Alerts the user that they obtained an item. This will add a row to
         * the UI and then show the UI.
         * @param {Item} item                  - the item you got
         * @param {Boolean} didItemFitInInventory - if false, a message will be
         * displayed about how there isn't enough room
         * @param {Number} originalQuantity      - for stackable items, this is
         * the quantity of the item when the enemy dropped it. This is needed
         * because of how stackable items are added to the inventory right now.
         * If this isn't supplied, the quantity is pulled from the item.
         */
        addItemNotification: function(item, didItemFitInInventory, originalQuantity) {
            if ( item == null ) return;

            var obtainText = 'Obtained ' + item.name;
            if ( !didItemFitInInventory ) {
                obtainText += '<font color="red"> - not enough room in inventory!</font>';
            }

            var id = this.nextID++;

            // Put a span around the image and text so that we can remove
            // everything at once.
            $('#loot-ui').append('<span id="loot' + id +'">' + 
                '<span style="position:relative;display:inline-block;top:8px"></span> ' + 
                obtainText + '<br/></span>');

            var $entireLootSpan = $('#loot' + id);
            var $itemSpan = $('#loot' + id + ' > span:last');

            // Stackable items need to display quantity
            if (item.stackable) {
                // If the caller didn't supply the original quantity, use the
                // item's quantity.
                if ( !originalQuantity ) {
                    originalQuantity = item.quantity;
                }
                // This code closely follows how SlotUI displays quantity text
                $itemSpan.html('<span style="color: white; font-size:.95em;position:absolute;left:2px;top:11px;">' + 
                    '<b>' + originalQuantity + '</b></span>');
            } 

            // Apply the image
            var img = game.imagePath + '/img_trans.png';
            $itemSpan.attr('src', img);
            $itemSpan.attr('class', item.cssClass);

            // Style the quantity text
            $itemSpan.addClass('outline-font');

            // Keep track of this new object
            var lootObject = new game.LootObject($entireLootSpan, game.NUM_SEC_TO_SHOW_OBTAINED_ITEMS);
            this.lootObjects.push(lootObject);

            $('#loot-ui').dialog('open');
        },

        /**
         * Update all of the loot objects, fading out where necessary and
         * closing the UI if they're all gone.
         * @param  {Number} delta - time elapsed in ms since this was last
         * called
         * @return {null}
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
                lootObject.$lootSpan.css({'opacity': opacity});

                if ( lootObject.ttl <= 0 ) {
                    lootObject.$lootSpan.remove();
                    this.lootObjects.splice(i, 1);
                    i--;

                    if ( this.lootObjects.length == 0 ) {
                        $('#loot-ui').dialog('close');
                    }
                }
            };
        }
    };
}()); 