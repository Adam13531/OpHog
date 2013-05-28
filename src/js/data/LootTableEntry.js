( function() {

    /**
     * A simple class representing a single item in an enemy's loot table.
     */
    window.game.LootTableEntry = function LootTableEntry(itemID, relativeWeight) {
        /**
         * The ID of the item that can be dropped;
         * @type {Number}
         */
        this.itemID = itemID;

        /**
         * Relative chance to drop the item. See util.randomFromWeights.
         *
         * The name of this variable must not change. Again, see
         * randomFromWeights for an explanation.
         * @type {Number}
         */
        this.relativeWeight = relativeWeight;
    };
}());
