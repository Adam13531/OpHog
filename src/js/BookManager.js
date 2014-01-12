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
                var html = 'No content set';
                var title = 'No title set';
                game.GameStateManager.enterReadingABookState();

                var types = [game.PlaceableUnitType.ARCHER, game.PlaceableUnitType.WARRIOR, game.PlaceableUnitType.WIZARD];
                var imgTags = ['','',''];
                var numNonBlankCharImages = 0;
                for (var i = 0; i < types.length; i++) {
                    var graphicIndexes = game.UnitManager.getUnitCostume(types[i], -1);
                    if ( graphicIndexes != null ) {
                        imgTags[i] = '<img src="' + charSheet.get1x1Sprite(graphicIndexes[0], true) + '" style="vertical-align:bottom"/>';
                        numNonBlankCharImages++;
                    }
                };

                if ( this.readingBook.id == 0 ) {
                    var spawnerImgTag = 
                        '<img src="' + envSheet.get1x1Sprite(game.Graphic.SPAWNER, true) + '" style="vertical-align:bottom"/>';
                    var diamondImgTag = 
                        '<img src="' + iconSheet.get1x1Sprite(game.Graphic.BLUE_DIAMOND, true) + '" style="vertical-align:baseline"/>';

                    var purchaseString = '';
                    if ( numNonBlankCharImages ) {
                        purchaseString += ' (';
                        var didFirst = false;
                        if ( imgTags[0] != '' ) {
                            purchaseString += imgTags[0];
                            if ( numNonBlankCharImages == 2 ) purchaseString += ' or ';
                            if ( numNonBlankCharImages == 3 ) purchaseString += ', ';
                            didFirst = true;
                        }
                        if ( imgTags[1] != '' ) {
                            purchaseString += imgTags[1];
                            if ( numNonBlankCharImages == 2 && !didFirst ) purchaseString += ' or ';
                            if ( numNonBlankCharImages == 3 ) purchaseString += ', or ';
                        }
                        if ( imgTags[2] != '' ) purchaseString += imgTags[2];
                        purchaseString += ')';
                    }
                    var diamondsString = '<span style="color:#00bbbb">diamonds</span>';

                    html = '<div>Use ' + diamondsString + ' ' + diamondImgTag + ' to purchase units' + purchaseString + ', then click the ' + spawnerImgTag + ' to enter a world.' +
                        '</div><br/><div>These books can provide valuable information; make sure to read them all!</div>';
                    title = 'The Book of Beginnings';
                }

                game.BookDialog.setHtml(html);
                game.BookDialog.setTitle(title);
                game.BookDialog.show();
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
            game.BookDialog.hide();
            this.readingBook = null;
            this.textBoxes = [];
        }

    };
}()); 