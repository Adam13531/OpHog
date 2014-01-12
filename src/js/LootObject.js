( function() {

    /**
     * A class representing a row in the loot UI.
     */
    window.game.LootObject = function LootObject(item, originalQuantity, didFit) {
        this.base = game.TextBox;

        /**
         * Time to live in seconds.
         * @type {Number}
         */
        this.ttl = game.NUM_SEC_TO_SHOW_OBTAINED_ITEMS;
        this.item = item;

        this.text = 'Obtained ' + this.item.name;
        if ( this.item.stackable ) this.text += ' (' + originalQuantity + ')';
        if ( !didFit ) this.text += ' - not enough room in inventory!';

        // The x and y coordinates don't matter; the LootUI will set them to
        // where they should be.
        this.base(0, 0, this.text, 400);

        // Now modify the default colors if the item didn't fit.
        if ( !didFit ) {
            this.textOutlineColor = '#200';
            this.textColor = '#f00';
            this.borderColor = 'rgba(200,0,0,.75)';
        }

        var itemSize = this.padding * 2 + game.ITEM_SPRITE_SIZE;

        // Accommodate the item both horizontally and vertically.
        this.leftPaddingBeforeText = itemSize;
        this.minHeight = itemSize;
    };

    window.game.LootObject.prototype = new game.TextBox;

    window.game.LootObject.prototype.drawForeground = function(ctx) {
        itemSheet.drawSprite(ctx, this.item.graphicIndex, this.x + this.padding, this.y + this.height / 2 - game.ITEM_SPRITE_SIZE / 2);
    };

}());
