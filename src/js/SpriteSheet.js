( function(){
    
    /**
     * SpriteSheet class
     * @param {string} imageURL - location of the image to use
     * @param {number} tileSize - size of each tile
     * @param {function} onload - a function to call when the spritesheet is ready to use
     */
    window.game.SpriteSheet = function SpriteSheet(imageURL, tileSize, onload) {
        this.tileSize = tileSize;
        this.image = new Image();
        this.image.src = imageURL;
        this.finalOnload = onload;

        // This is a horizontally flipped version of the image. It can only be
        // loaded after the first image is done loading.
        this.hFlipImage = new Image();

        // Make a SpriteSheet onLoad so that when you get back to YOUR onLoad,
        // the SpriteSheet is initialized. This will be recreated every time we
        // create a new SpriteSheet
        this.image.onload = this.imageLoaded(this);
    };

    // This was modified from some StackOverflow code.
    function getBase64Image(img) {
        // Create an empty canvas element. This is a virtual element and does
        // not exist in the DOM yet.
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");
        ctx.translate(canvas.width,0);
        ctx.scale(-1,1);
        ctx.drawImage(img, 0, 0);

        // Get the data-URL formatted image. Firefox supports PNG and JPEG. You
        // could check img.src to guess the original format, but be aware the
        // using "image/jpg" will re-encode the image.
        var dataURL = canvas.toDataURL("image/png");
        return dataURL;
        // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }

    // If I defined this in the constructor, then it would add every  argument
    // to the closure's scope, which we don't want in case there are any
    // circular references. Also, even if circular  references never showed up,
    // it's just good sense to keep things  simple and separate.
    window.game.SpriteSheet.prototype.imageLoaded = function(spritesheet) {
        return function() {
            // Specify the flipped image's onload function here so that we don't
            // capture too many things in the closure.
            spritesheet.hFlipImage.onload = function()
            {
                spritesheet.numCols = spritesheet.image.width / spritesheet.tileSize;
                spritesheet.numRows = spritesheet.image.height / spritesheet.tileSize;
                spritesheet.finalOnload();
            }

            spritesheet.hFlipImage.src = getBase64Image(spritesheet.image);
        };
    };

    /**
     * Draws a sprite from this sheet
     * @param {Object} ctx - the canvas context
     * @param {number} graphicIndex - the index of the sprite in the sheet
     * @param {number} x - coord to draw at (pixels)
     * @param {number} y - coord to draw at (pixels)
     * @param {bool} hFlip - if true, horizontally flip the sprite
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