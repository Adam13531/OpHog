( function() {

    /**
     * A very simple class to hold two things. This is just so that I don't cram
     * them into an unnamed object like {foo:bar, baz:qux}, which really
     * wouldn't be the worst thing...
     */
    window.game.LootObject = function LootObject($lootSpan, ttl) {
        /**
         * A JQuery selector representing the span holding the loot
         * @type {Object}
         */
        this.$lootSpan = $lootSpan;

        /**
         * Time to live in seconds.
         * @type {Number}
         */
        this.ttl = ttl;
    };
}());
