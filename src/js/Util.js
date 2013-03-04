( function() {

    /**
     * Calculate the distance between two sets of coordinates.
     *
     * The units are simply numbers (not pixels or tiles).
     */
    window.game.util.distance = function(x1, y1, x2, y2) {
        var dif1 = x2 - x1;
        var dif2 = y2 - y1;
        return Math.sqrt(dif1 * dif1 + dif2 * dif2);
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
    window.game.util.randomArrayElement = function(array, hi, there) {
        if ( array == null ) return null;
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
            $('#canvas').before('<div id="' + divID +'"></div>');

            // Obtain the div now that it exists
            debugDiv = $('#' + divID);
        }

        debugDiv.text(text);
    };

}());
