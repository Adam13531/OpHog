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
     * Books are on the overworld and can provide tips/help content. This class
     * will manage their contents, which one you're viewing, etc.
     * @type {Object}
     */
    window.game.BookManager = {

        /**
         * Which book you're currently reading. This points to an object in
         * bookInfo.
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
            },
            {
                id: 1,
                tileX: 2,
                tileY: 4,
            },
            {
                id: 2,
                tileX: 4,
                tileY: 7,
            },
            {
                id: 3,
                tileX: 0,
                tileY: 9,
            },
            {
                id: 4,
                tileX: 3,
                tileY: 13,
            },
            {
                id: 5,
                tileX: 7,
                tileY: 12,
            },
            {
                id: 6,
                tileX: 7,
                tileY: 3,
            },
            {
                id: 7,
                tileX: 16,
                tileY: 6,
            },
            {
                id: 8,
                tileX: 11,
                tileY: 3,
            },
            {
                id: 9,
                tileX: 2,
                tileY: 27,
            },
        ],

        /**
         * Tells which books you've already read so that we can modify their
         * graphics accordingly.
         * 
         * Key: bookID (Number)
         * Value: true (Boolean, constant)
         * @type {Object}
         */
        booksRead: {},

        /**
         * Returns the book at these tile coordinates.
         * @return {Object} - object from bookInfo
         */
        getBookAtTileCoordinates: function(tileX, tileY) {
            for (var i = 0; i < this.bookInfo.length; i++) {
                var info = this.bookInfo[i];
                if ( tileX == info.tileX && tileY == info.tileY ) {
                    return info;
                }
            };

            return null;
        },

        /**
         * If a book exists at the specified tile coordinates, then this will
         * open that book.
         * @param  {Number} tileX - the tile X
         * @param  {Number} tileY - the tile Y
         * @return {Boolean}       - true if you did indeed find a book
         */
        openBookIfOneExistsHere: function(tileX, tileY) {
            this.readingBook = this.getBookAtTileCoordinates(tileX, tileY);

            var foundABook = (this.readingBook != null);

            if ( foundABook ) {
                var id = this.readingBook.id;
                this.changeBookGraphic(id);

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

                if ( id == 0 ) {
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

                    var warningString = '';
                    if ( !game.UnitPlacementUI.purchasedAtLeastOneUnit() ) {
                        warningString += '<div style="color:#550000">You need to purchase a unit before you can enter the world!</div><br/>';
                    }

                    html = warningString + 
                    '<div>Use ' + diamondsString + ' ' + diamondImgTag + ' to purchase units at the bottom right' + purchaseString + ', then tap the ' + spawnerImgTag + ' to enter a world.</div><br/>' + 
                    '<div>Once in the world, you need to place your units using the buttons at the bottom left. Without units to defend, enemies will rush your castles, and when your castles reach 0 life, you lose.</div><br/>' + 
                    '<div>These books can provide valuable information; make sure to read them all!</div>';
                    title = 'The Book of Beginnings';
                } else if ( id == 1 ) {
                    var coinImgTag = 
                        '<img src="' + iconSheet.get1x1Sprite(game.Graphic.GOLD_COIN, true) + '" style="vertical-align:baseline"/>';
                    title = 'Paperback of Placement';
                    html = '<div>You\'re given coins ' + coinImgTag + ' at the beginning of each world so that you can place your units. After placing a unit, it will move and attack on its own.<br/><br/>Choose its location wisely! </div>';
                } else if ( id == 2 ) {
                    title = 'Vision Volume';
                    html = '<div>The black shroud you see is fog; you can see the terrain beneath it, but not enemies, treasure, or any other mysteries.<br/><br/>It helps to explore it quickly!</div>';
                } else if ( id == 3 ) {
                    title = 'Minigame Manuscript';
                    html = '<div>After beating a world, you can choose to fight groups of enemies. The harder the enemies, the more diamonds you\'ll get!</div>';
                } else if ( id == 4 ) {
                    var extraInstructions = '';
                    if ( game.playerUsedKeyboard ) {
                        extraInstructions = '(by presing "I" on your keyboard) ';
                    }
                    title = 'Inventory Album';
                    html = '<div>Open your inventory ' + extraInstructions + ' to see your items.<br/><br/>Here, you can equip items (like swords or shields) to an entire <i>class</i> of units at a time. You can also use items like potions and gems.</div>';
                } else if ( id == 5 ) {
                    var wolfImg = '<img src="' + charSheet.get1x1Sprite(game.Graphic.BLACK_WOLF, true) + '" style="vertical-align:bottom"/>';
                    var ravenImg = '<img src="' + charSheet.get1x1Sprite(game.Graphic.CROW_RAVEN, true) + '" style="vertical-align:bottom"/>';
                    var dragonImg = '<img src="' + charSheet.get1x1Sprite(game.Graphic.GREEN_DRAGON, true) + '" style="vertical-align:bottom"/>';
                    var archImg = '<img src="' + charSheet.get1x1Sprite(game.UnitType.PLAYER_ARCHER.graphicIndexes[0], true) + '" style="vertical-align:bottom"/>';
                    var warImg = '<img src="' + charSheet.get1x1Sprite(game.UnitType.PLAYER_WARRIOR.graphicIndexes[0], true) + '" style="vertical-align:bottom"/>';
                    var warFaceLeftImg = '<img src="' + charSheet.get1x1Sprite(game.UnitType.PLAYER_WARRIOR.graphicIndexes[0], false) + '" style="vertical-align:bottom"/>';
                    var warImgBlueBg = '<img style="background-color:#0000ff" src="' + charSheet.get1x1Sprite(game.UnitType.PLAYER_WARRIOR.graphicIndexes[0], true) + '" style="vertical-align:bottom"/>';
                    var wizImg = '<img src="' + charSheet.get1x1Sprite(game.UnitType.PLAYER_WIZARD.graphicIndexes[0], true) + '" style="vertical-align:bottom"/>';
                    var warImgRedBg = '<img style="background-color:#ff0000" src="' + charSheet.get1x1Sprite(game.UnitType.PLAYER_WARRIOR.graphicIndexes[0], false) + '" style="vertical-align:bottom"/>';
                    var quickAtkImg = '<img src="' + eff24Sheet.get1x1Sprite(game.Graphic.MEDIUM_GRAY_CIRCLE_1, true) + '" style="vertical-align:bottom"/>';
                    var healImg = '<img src="' + eff24Sheet.get1x1Sprite(game.Graphic.MEDIUM_BLUE_CIRCLE_1, true) + '" style="vertical-align:bottom"/>';
                    var reviveImg = '<img src="' + eff24Sheet.get1x1Sprite(game.Graphic.SMALL_YELLOW_STAR, true) + '" style="vertical-align:bottom"/>';
                    var buffStatsImg = '<img src="' + eff24Sheet.get1x1Sprite(game.Graphic.MEDIUM_PURPLE_CIRCLE_2, true) + '" style="vertical-align:bottom"/>';
                    var tombstoneImg = '<img src="' + envSheet.get1x1Sprite(game.Graphic.RIP_TOMBSTONE, true) + '" style="vertical-align:bottom"/>';
                    title = 'Scroll of Skills';
                    var critText = 'Critical hit (' + (game.WARRIOR_CRIT_CHANCE * 100) + '% chance to do ' + (game.WARRIOR_CRIT_DAMAGE_MULT * 100) + '% damage)';
                    html = '<div>Units gain abilities as they level up. They use these abilities randomly in battles. ' +
                    '<ul>' +
                        '<li>Archers can summon pets' + 
                            '<ul style="margin:0em">' + 
                                '<li>Lv. ' + game.ARCHER_SKILL_1_REQUIRED_LVL + ': Wolf ' + archImg + ' ' + wolfImg + '</li>' + 
                                '<li>Lv. ' + game.ARCHER_SKILL_2_REQUIRED_LVL + ': Raven ' + archImg + ' ' + ravenImg + '</li>' + 
                                '<li>Lv. ' + game.ARCHER_SKILL_3_REQUIRED_LVL + ': Dragon ' + archImg + ' ' + dragonImg + '</li>' + 
                            '</ul>' +
                        '</li>' +
                        '<li>Warriors get new combat skills' + 
                            '<ul style="margin:0em">' + 
                                '<li>Lv. ' + game.WARRIOR_SKILL_1_REQUIRED_LVL + ': Quick Attack (attack with low cooldown) ' + warImg + quickAtkImg + '</li>' + 
                                '<li>Lv. ' + game.WARRIOR_SKILL_2_REQUIRED_LVL + ': Self-defense buff ' + warImgBlueBg + '</li>' + 
                                '<li>Lv. ' + game.WARRIOR_SKILL_3_REQUIRED_LVL + ': ' + critText + '</li>' + 
                            '</ul>' +
                        '</li>' +
                        '<li>Wizards gain support abilities' + 
                            '<ul style="margin:0em">' + 
                                '<li>Lv. ' + game.WIZARD_SKILL_1_REQUIRED_LVL + ': Heal ' + wizImg + healImg + warFaceLeftImg + '</li>' + 
                                '<li>Lv. ' + game.WIZARD_SKILL_2_REQUIRED_LVL + ': Buff stats' + wizImg + buffStatsImg + warImgRedBg + '</li>' + 
                                '<li>Lv. ' + game.WIZARD_SKILL_3_REQUIRED_LVL + ': Revive ' + wizImg + reviveImg + tombstoneImg + '</li>' + 
                            '</ul>' +
                        '</li>' +
                    '</ul></div>';

                } else if ( id == 6 ) {
                    title = 'Dictionary of Difficulties';
                    var easySpawnerImg = '<img src="' + envSheet.get1x1Sprite(game.Graphic.SPAWNER, false) + '" style="vertical-align:bottom"/>';
                    var mediumSpawnerImg = '<img src="' + envSheet.get1x1Sprite(game.Graphic.SPAWNER_MEDIUM, false) + '" style="vertical-align:bottom"/>';
                    var hardSpawnerImg = '<img src="' + envSheet.get1x1Sprite(game.Graphic.SPAWNER_HARD, false) + '" style="vertical-align:bottom"/>';
                    html = '<div>You can gauge the relative difficulty of a world before entering it!<ul>' +
                        '<li>' + easySpawnerImg + ': easy</li>' +
                        '<li>' + mediumSpawnerImg + ': medium</li>' +
                        '<li>' + hardSpawnerImg + ': hard</li>' +
                        '</ul>Watch out though, these difficulties are relative to the area. A ' + hardSpawnerImg + ' in the forest is probably easier than a ' + mediumSpawnerImg + ' in the desert!</div>';
                } else if ( id == 7 ) {
                    title = 'Codex of Choices';
                    html = '<div>The harsh fires to the east are still more welcoming than the spirits you\'ll encounter in the cemetery to the south. Should you endure those ghostly trials, you\'ll find a quicker route to the jungle.</div>';
                } else if ( id == 8 ) {
                    title = 'Hardcover of Hotkeys';
                    html = '<div>There are many shortcuts to help you. Try some out now!' + 
                        '<ul>' +
                            '<li>WASD: scroll the map (hold shift to scroll faster)</li>' +
                            '<li>Arrows+space: select units to buy/place on the lower bar</li>' +
                            '<li>I: open/close the inventory</li>' +
                            '<li>Y: open/close the shop</li>' +
                            '<li>Q: sell selected inventory item</li>' +
                            '<li>E: play music</li>' +
                            '<li>R (only in-world): place all units you can afford</li>' +
                        '</ul>' +
                    '</div>';
                } else if ( id == 9 ) {
                    title = 'Word of the Winner';
                    html = '<div>Congratulations! You have conquered the last world. That\'s all there is for now. If you\'d like to start over, press F10 to enable Dev Mode, then press F7 to delete your save data.<br/><br/>Hope you had fun!</div>';
                } 

                game.BookDialog.setHtml(html);
                game.BookDialog.setTitle(title);
                game.BookDialog.show();
            }

            return foundABook;
        },

        /**
         * @return {Object} - an object from bookInfo
         */
        getBookByID: function(bookID) {
            return game.util.getItemInContainerByProperty(this.bookInfo, 'id', bookID);
        },

        /**
         * Opens a book for you whether you clicked it or not.
         * @param  {Number} bookID - the ID of the book (see bookInfo).
         */
        forceBookToOpen: function(bookID) {
            var bookInfo = this.getBookByID(bookID);
            if ( bookInfo == null ) return;

            this.openBookIfOneExistsHere(bookInfo.tileX, bookInfo.tileY);
        },

        /**
         * This will "close" a book by changing its graphic. We exploit the
         * positioning of books on the spritesheet to accomplish this; the open
         * book is always one row above the closed book.
         * @param  {Number} bookID - the ID of the book in bookInfo.
         */
        changeBookGraphic: function(bookID) {
            var bookInfo = this.getBookByID(bookID);

            // 'changedGraphicAlready' is only injected in this function; it
            // 'will be undefined otherwise.
            if ( bookInfo == null || bookInfo.changedGraphicAlready ) return;

            this.booksRead[bookID] = true;
            bookInfo.changedGraphicAlready = true;

            var tileX = bookInfo.tileX;
            var tileY = bookInfo.tileY;
            game.overworldMap.extraLayer[tileY * game.overworldMap.numCols + tileX] -= envSheet.getNumSpritesPerRow();
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

        highlightTheBookYoureReading: function(ctx) {
            if ( this.readingBook == null ) return;

            var blink = Math.sin(game.alphaBlink * 4);
            var alpha = blink * .1 + .3;
            var greenFillStyle = 'rgba(0, 255, 0, ' + alpha + ')';
            var drawX = this.readingBook.tileX * game.TILESIZE;
            var drawY = this.readingBook.tileY * game.TILESIZE;

            ctx.save();
            game.Camera.scaleAndTranslate(ctx);
            ctx.fillStyle = greenFillStyle;
            ctx.fillRect(drawX,drawY,game.TILESIZE,game.TILESIZE);
            game.Camera.resetScaleAndTranslate(ctx);
            ctx.restore();
        },

        draw: function(ctx) {
            this.highlightTheBookYoureReading(ctx);

            for (var i = 0; i < this.textBoxes.length; i++) {
                this.textBoxes[i].draw(ctx);
            };
        },

        /**
         * Call this when you've loaded a game save. It'll set the correct book
         * graphics.
         */
        loadedGameSave: function() {
            for(key in this.booksRead) {
                this.changeBookGraphic(key);
            };
        },

        /**
         * Call this to exit the "reading a book" state.
         */
        stopReadingBook: function() {
            if ( game.GameStateManager.isReadingABook() ) {
                game.GameStateManager.enterOverworldState();
            }

            game.BookDialog.hide();
            this.readingBook = null;
            this.textBoxes = [];
        }

    };
}()); 