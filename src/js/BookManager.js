( function() {

    /**
     * Books are on the overworld and can provide tips/help content. This class
     * will manage their contents, which one you're viewing, etc.
     * @type {Object}
     */
    window.game.BookManager = {

        /**
         * Which book you're currently reading. This points to an object in
         * bookInfo.
         * @type {[type]}
         */
        readingBook: null,

        /**
         * Any textboxes created by the book that you're reading. This class
         * will handle creating/displaying/removing them as opposed to passing
         * this off to the TextManager. I did it this way so that every time you
         * close any book, you can simply remove every textbox from this class.
         * If the TextManager managed that, then you'd have to selectively
         * remove the ones that the book spawned.
         * @type {Array}
         */
        textBoxes: [],

        /**
         * An array of objects with id, tileX, and tileY, representing a book on
         * the overworld.
         * @type {Array:Object}
         */
        bookInfo: [
            {
                id: 0,
                tileX: 0,
                tileY: 0,
            }
        ],

        /**
         * If a book exists at the specified tile coordinates, then this will
         * open that book.
         * @param  {Number} tileX - the tile X
         * @param  {Number} tileY - the tile Y
         * @return {Boolean}       - true if you did indeed find a book
         */
        openBookIfOneExistsHere: function(tileX, tileY) {
            for (var i = 0; i < this.bookInfo.length; i++) {
                var info = this.bookInfo[i];
                if ( tileX == info.tileX && tileY == info.tileY ) {
                    this.readingBook = info;
                    break;
                }
            };

            var foundABook = this.readingBook != null;

            if ( foundABook ) {
                game.GameStateManager.enterReadingABookState();

                if ( this.readingBook.id == 0 ) {
                    var textBox = new game.TextBox(50, 50, 'This book will eventually tell you some more about the game. I haven\'t finished coding this yet. Tap anywhere to continue.', 800);
                    this.textBoxes.push(textBox);
                }
            }

            return foundABook;
        },

        /**
         * Call this when the browser size changes.
         */
        browserSizeChanged: function() {
            var browserWidth = $(window).width();
            var browserHeight = $(window).height();

            for (var i = 0; i < this.textBoxes.length; i++) {
                var textbox = this.textBoxes[i];
                textbox.setMaxWidth(textbox.initialMaxWidth);
            };
        },

        draw: function(ctx) {
            for (var i = 0; i < this.textBoxes.length; i++) {
                this.textBoxes[i].draw(ctx);
            };
        },

        /**
         * Call this when you exit the "reading a book" state so that the
         * contents of the book can be cleaned up.
         */
        stopReadingBook: function() {
            this.readingBook = null;
            this.textBoxes = [];
        }

    };
}()); 