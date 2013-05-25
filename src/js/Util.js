( function() {

    /**
     * Calculate the distance between two sets of coordinates.
     *
     * The units are simply numbers (not pixels or tiles).
     *
     * This computes Euclidean distance.
     */
    window.game.util.distance = function(x1, y1, x2, y2) {
        var dif1 = x2 - x1;
        var dif2 = y2 - y1;
        return Math.sqrt(dif1 * dif1 + dif2 * dif2);
    };

    /**
     * Calculates the Manhattan distance between two sets of coordinates.
     *
     * The units are simply numbers (not pixels or tiles).
     *
     * This computes "taxicab" distance, i.e. a diagonal counts as 2, not
     * sqrt(2) like util.distance would provide.
     */
    window.game.util.manhattanDistance = function(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    };    

    /**
     * Two circles collide if the distance between their centers is less than
     * the sum of their radii.
     * @param  {number} x1 Center X of circle 1 (in pixels)
     * @param  {number} y1 Center Y of circle 1 (in pixels)
     * @param  {number} r1 Radius of circle 1 (in pixels)
     * @return {boolean}    true if they collide
     */
    window.game.util.circlesCollide = function(x1, y1, r1, x2, y2, r2) {
        return window.game.util.distance(x1, y1, x2, y2) <= (r1 + r2);
    };

    /**
     * Given an array, this will return a random element.
     * @param  {Array} array An array to choose from.
     * @return {Object}       A random element from that array.
     */
    window.game.util.randomArrayElement = function(array) {
        if ( array == null || array.length == 0 ) return null;
        return array[Math.floor(Math.random() * array.length)];
    };

    /**
     * Shallow-copies an array. Example usage:
     * a = new Array(1,2,3);
     * b = shallowCopyArray(a);
     * b.splice(0,3); // 'a' will still be [1,2,3]
     *
     * Based on jsperf.com, this is faster than doing
     * var newArray = [].concat(array).
     * 
     * @param  {Array} array The array to copy
     * @return {Array}       A shallow copy of the array
     */
    window.game.util.shallowCopyArray = function(array) {
        var newArray = new Array();
        for (var i = 0; i < array.length; i++) {
            newArray.push(array[i]);
        };
        return newArray;
    };

    /**
     * Pushes all members of pushThisEntireArray to array.
     * @param  {Array} array               - array to add to
     * @param  {Array} pushThisEntireArray - array whose elements you'll add
     * @return {null}
     */
    window.game.util.pushAllToArray = function(array, pushThisEntireArray) {
        if ( array == null || pushThisEntireArray == null ) return;
        for (var i = 0; i < pushThisEntireArray.length; i++) {
            array.push(pushThisEntireArray[i]);
        };
    };

    /**
     * Given an array, this will return the reverse of a copy of it, so the
     * original array will not be modified.
     *
     * E.g. [1,2,3] becomes [3,2,1]
     * @param  {Array} array - the array to reverse
     * @return {Array}       - a reversed copy of the array
     */
    window.game.util.copyAndReverseArray = function(array) {
        return array.slice(0).reverse();
    };

    /**
     * Returns a random key from the dictionary that you pass in.
     * @param  {Object} dict - a dictionary, e.g. {a:5, b:6}
     * @return {Object}      a key in that dictionary, e.g. 'a' or 'b'
     */
    window.game.util.randomKeyFromDict = function(dict) {
        if ( dict === undefined || dict == null ) return null;
        
        var key;
        var allKeys = [];
        for(key in dict) {
            if(dict.hasOwnProperty(key) ) {
                allKeys.push(key);
            }
        }

        return game.util.randomArrayElement(allKeys);
    };
    /**
     * This will modify the 'current' coordinates so that they get closer to the
     * desired coordinates.
     * @param  {Number} currentX  - starting X coordinate (can be any coordinate
     * system you want)
     * @param  {Number} currentY  - starting Y coordinate
     * @param  {Number} desiredX  - desired X coordinate
     * @param  {Number} desiredY  - desierd Y coordinate
     * @param  {Number} speed     - speed (units are up to you and are based on
     * your coordinate system)
     * @param  {Boolean} useVector - if true, this will compute a line between
     * 'current' and 'desired' and travel along that. If false, this will simply
     * move as close in each axis as possible. This leads to "unsmooth"
     * movement, e.g. if you're moving 1000 pixels right and only 50 pixels up,
     * then passing false will cause the vertical movement to finish almost
     * immediately.
     * @return {Object}           An object with 'x' (number), 'y' (number), and
     * 'atDestination' (boolean).
     */
    window.game.util.chaseCoordinates = function(currentX, currentY, desiredX, desiredY, speed, useVector) {
        if ( useVector ) {
            var distX = desiredX - currentX;
            var distY = desiredY - currentY;

            // The desired angle
            var angle = Math.atan2(distY, distX);

            if ( Math.abs(currentX - desiredX) < speed ) {
                currentX = desiredX;
            } else {
                currentX += speed * Math.cos(angle);
            }

            if ( Math.abs(currentY - desiredY) < speed ) {
                currentY = desiredY;
            } else {
                currentY += speed * Math.sin(angle);
            }
        } else {

            if ( currentX < desiredX ) {
                if ( Math.abs(currentX - desiredX) < speed ) {
                    currentX = desiredX;
                } else {
                    currentX += speed;
                }
            } else {
                if ( Math.abs(currentX - desiredX) < speed ) {
                    currentX = desiredX;
                } else {
                    currentX -= speed;
                }
            }

            if ( currentY < desiredY ) {
                if ( Math.abs(currentY - desiredY) < speed ) {
                    currentY = desiredY;
                } else {
                    currentY += speed;
                }
            } else {
                if ( Math.abs(currentY - desiredY) < speed ) {
                    currentY = desiredY;
                } else {
                    currentY -= speed;
                }
            }
        }

        var atDestination = (currentX == desiredX && currentY == desiredY);

        return {x: currentX, y: currentY, atDestination: atDestination};
    };

    /**
     * Sometimes, you want to output some text to the page without using
     * console.log. In that case, you should use this function, which will add a
     * div to the page (if it doesn't already exist), then set the text of that
     * div.
     * @param  {String} text                  The text to display.
     * @param  {Number} labelIdentifierNumber A number corresponding to debug
     * text. Specifying this argument will let you put multiple debug outputs on
     * the same page.
     */
    window.game.util.debugDisplayText = function(text, labelIdentifierNumber) {
        // If you didn't supply an argument, set the ID to 1
        if ( typeof labelIdentifierNumber === "undefined" ) labelIdentifierNumber = "1";

        var divID = 'debugOutput' + labelIdentifierNumber;

        // See if the div already exists
        var debugDiv = $('#' + divID);
        if ( debugDiv.length == 0 ) {
            // It didn't, so add it before the canvas
            $('#container').before('<div id="' + divID +'"></div>');

            // Obtain the div now that it exists
            debugDiv = $('#' + divID);
        }

        debugDiv.text(text);
    };

}());
