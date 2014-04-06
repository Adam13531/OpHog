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
( function(){
    
    /**
     * SpriteSheet class
     * @param {String} imageURL - location of the image to use
     * @param {Number} tileSize - size of each tile
     * @param {Function} onload - a function to call when the spritesheet is ready to use
     */
    window.game.SpriteSheet = function SpriteSheet(imageURL, tileSize, onload) {
        this.tileSize = tileSize;
        this.image = new Image();
        this.image.src = imageURL;
        this.finalOnload = onload;

        // This is a horizontally flipped version of the image. It can only be
        // loaded after the first image is done loading.
        this.hFlipImage = new Image();

        // The number of images we've loaded so far.
        this.imagesLoaded = 0;

        // Make a SpriteSheet onLoad so that when you get back to YOUR onLoad,
        // the SpriteSheet is initialized. This will be recreated every time we
        // create a new SpriteSheet
        this.image.onload = this.imageLoaded(this);
    };

    // This was modified from some StackOverflow code. It will modify this
    // spritesheet's image to essentially form a whole new spritesheet, e.g. a
    // horizontally flipped spritesheet, that way we don't have to flip sprites
    // on the fly.
    function getBase64Image(img, hFlip, doubleSizeImage) {
        // Create an empty canvas element. This is a virtual element and does
        // not exist in the DOM yet, so no cleanup on it needs to be done.
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        if ( doubleSizeImage ) {
            canvas.width *= 2;
            canvas.height *= 2;
        }

        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");

        if ( hFlip ) {
            ctx.translate(canvas.width,0);
            ctx.scale(-1,1);
        }

        if ( doubleSizeImage ) {
            ctx.scale(2,2);
        }

        ctx.drawImage(img, 0, 0);

        // Get the data-URL formatted image. Firefox supports PNG and JPEG. You
        // could check img.src to guess the original format, but be aware the
        // using "image/jpg" will re-encode the image.
        var dataURL = canvas.toDataURL("image/png");
        return dataURL;
        // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }

    /**
     * @return {Number} - the number of sprites in a given row of this
     * spritesheet.
     */
    window.game.SpriteSheet.prototype.getNumSpritesPerRow = function() {
        return this.image.width / this.tileSize;
    };

    // If I defined this in the constructor, then it would add every argument to
    // the closure's scope, which we don't want in case there are any circular
    // references. Also, even if circular references never showed up, it's just
    // good sense to keep things simple and separate.
    window.game.SpriteSheet.prototype.imageLoaded = function(spritesheet) {
        return function() {
            // Specify the flipped image's onload function here so that we don't
            // capture too many things in the closure.
            spritesheet.hFlipImage.onload = function() {
                spritesheet.numCols = spritesheet.image.width / spritesheet.tileSize;
                spritesheet.numRows = spritesheet.image.height / spritesheet.tileSize;
                spritesheet.loadedVariation();
            }

            spritesheet.hFlipImage.src = getBase64Image(spritesheet.image, true, false);
        };
    };

    /**
     * Call this when you've loaded a variation of the spritesheet (e.g.
     * hFlipImage).
     */
    window.game.SpriteSheet.prototype.loadedVariation = function() {
        this.imagesLoaded++;
        var numImagesNeeded = 1;
        if ( this.imagesLoaded == numImagesNeeded ) {
            this.finalOnload();
        }
    };

    /**
     * See getSpriteData.
     * @param  {game.UnitData} unitData - the unit data to pull the graphic
     * indexes and dimensions from.
     */
    window.game.SpriteSheet.prototype.getSpriteDataFromUnitData = function(unitData, hFlip) {
        return this.getSpriteData(unitData.graphicIndexes, unitData.width, unitData.height, hFlip);
    };

    /**
     * See getSpriteData.
     * @param  {Number} graphicIndex - a single graphic index
     * @param {Boolean} hFlip - if true, horizontally flip the sprite
     */
    window.game.SpriteSheet.prototype.getSpriteDataFromSingleIndex = function(graphicIndex, hFlip) {
        return this.getSpriteData([graphicIndex], 1, 1, hFlip);
    };

    /**
     * This is very similar to getSpriteDataFromSingleIndex, but the resulting
     * image is exactly the size that it needs to be instead of minimally 2x2
     * tiles.
     *
     * This and getSpriteData can probably be refactored into a single function.
     */
    window.game.SpriteSheet.prototype.get1x1Sprite = function(graphicIndex, hFlip) {
        // Create an empty canvas element. This is a virtual element and does
        // not exist in the DOM yet.
        var canvas = document.createElement("canvas");
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;

        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");

        if ( hFlip ) {
            ctx.translate(canvas.width,0);
            ctx.scale(-1,1);
        }

        this.drawSprite(ctx, graphicIndex, 0, 0, true);

        var dataURL = canvas.toDataURL("image/png");
        return dataURL;
    };

    /**
     * Returns base64-encoded image data for a set of up to four graphic
     * indexes.
     *
     * The sprite returned will be justified to the left and bottom of a 2x2
     * square.
     * @param  {Array:Number} graphicIndexes - the graphic indexes
     * @param  {Number} width         - the width in tiles
     * @param  {Number} height        - the height in tiles
     * @param  {Boolean} hFlip        - if true, horizontally flip the sprite
     * @return {String}                base64-encoded image data
     */
    window.game.SpriteSheet.prototype.getSpriteData = function(graphicIndexes, width, height, hFlip) {
        // Create an empty canvas element. This is a virtual element and does
        // not exist in the DOM yet.
        var canvas = document.createElement("canvas");
        canvas.width = this.tileSize * 2;
        canvas.height = this.tileSize * 2;

        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");

        // Justify to the left side
        if ( width == 1 && hFlip ) {
            ctx.translate(-canvas.width / 2, 0);
        }

        // Justify to the bottom
        if ( height == 1 ) {
            ctx.translate(0,canvas.height /2);
        }

        if ( hFlip ) {
            ctx.translate(canvas.width,0);
            ctx.scale(-1,1);
        }

        var index = 0;
        for (var j = 0; j < height; j++) {
            for (var i = 0; i < width; i++) {
                this.drawSprite(ctx, graphicIndexes[index], i * this.tileSize, j * this.tileSize, false);
                index++;
            };
        };

        var dataURL = canvas.toDataURL("image/png");
        return dataURL;
    };

    /**
     * Draws a sprite from this sheet
     * @param {Object} ctx - the canvas context
     * @param {Number} graphicIndex - the index of the sprite in the sheet
     * @param {Number} x - coord to draw at (pixels)
     * @param {Number} y - coord to draw at (pixels)
     * @param {Boolean} hFlip - if true, horizontally flip the sprite
     */
    window.game.SpriteSheet.prototype.drawSprite = function(ctx, graphicIndex, x, y, hFlip) {
        if (typeof(hFlip)==='undefined') {
            hFlip = false;
        }

        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;

        var startX = (graphicIndex % this.numCols) * this.tileSize;
        var imageToUse = this.image;
        if ( hFlip === true ) {
            startX = (this.numCols - (graphicIndex % this.numCols) - 1) * this.tileSize;
            imageToUse = this.hFlipImage;
        }
        var startY = Math.floor(graphicIndex / this.numCols) * this.tileSize;

        ctx.drawImage(imageToUse, startX, startY, this.tileSize, this.tileSize, x, y, this.tileSize, this.tileSize);
    };

}());