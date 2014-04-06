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
     * Creates an <img/> tag whose src is img_trans.png. This is simply meant to
     * make calling code look cleaner; the caller can accomplish this with one
     * line of code.
     * @param  {String} cssClass - the CSS class string to apply
     * @param  {String} id       - an ID, or undefined if you don't want one
     * @return {String}          - an <img/> tag
     */
    window.game.util.makeTransparentImgTag = function(cssClass, id) {
        var tag = '<img ';

        if ( id !== undefined ) {
            tag += 'id="' + id + '" ';
        }

        tag += 'src="'+game.imagePath+'/img_trans.png" class="' + cssClass + '"/>';
        return tag;
    };

    /**
     * This is easiest to show using an example. Suppose you have this CSS class:
     *
     * .potion {
     *     background-position: -64px -0px;
     * }
     *
     * If you call getCssPropertyFromCssClass('potion', 'background-position'),
     * you'll get '-64px -0px' back in return, which you can then parse with 
     * string.split and parseInt().
     *
     * I made this function before items had graphicIndex set on them directly,
     * so we only had the CSS class and we wanted the graphic index. I'm keeping
     * the function around so that we don't have to rewrite it.
     * 
     * @param  {String} cssClass       - a CSS class (without the period)
     * @param  {String} propToRetrieve - the property you want from the DOM
     * element that gets ceated
     * @return {String} - the value of the property you requested
     */
    window.game.util.getCssPropertyFromCssClass = function(cssClass, propToRetrieve) {
        // Temporarily add to the garbage element with a display of none. People
        // online said that you can't trust the results unless you add it to the
        // DOM.
        $('#garbage').append('<span id="justUsedForGettingCssProp" style="display:none" class="' + cssClass + '"/>');
        var valString = $('#justUsedForGettingCssProp').css(propToRetrieve);
        $('#justUsedForGettingCssProp').remove();
        return valString;
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
     * Generates a random number between lowerBound and (upperBound-1).
     * @param  {Nmber} lowerBound - the lower bound
     * @param  {Number} upperBound - the upper bound
     * @return {Number}            - a random number in that range
     */
    window.game.util.randomInteger = function(lowerBound, upperBound) {
        if (lowerBound > upperBound) {
            var temp = lowerBound;
            lowerBound = upperBound;
            upperBound = temp;
        }
        
        return Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound;
    };

    /**
     * When your min/max are stored as an array of length 2, use this
     * convenience function. It is only here to improve readability.
     *
     * Note: this generates from [min,max) (i.e. max-1).
     */
    window.game.util.randomIntegerInRange = function(arrayOfLength2) {
        return this.randomInteger(arrayOfLength2[0], arrayOfLength2[1]);
    };

    /**
     * This function sets 'property' in the specified dictionary with
     * defaultValue if it doesn't already exist.
     *
     * For example, calling it like (game.UnitType.ORC, 'width', 1) will set the
     * orc's width to 1 if it didn't already have a width.
     * @param  {Object} dict - any dictionary
     * @param  {String} property - any property. After this function, this
     * property will definitely be set.
     * @param  {Object} defaultValue - the value to use if the property wasn't
     * set.
     */
    window.game.util.useDefaultIfUndefined = function(dict, property, defaultValue) {
        if ( dict[property] === undefined ) {
            dict[property] = defaultValue;
        }
    };

    /**
     * This function is really simple: it generates a number in the range [0,1)
     * and returns true if that number is less than the one you passed in.
     *
     * You should use this function whenever you're computing a percent chance
     * for something to happen, e.g. "I want this attack to hit 50% of the
     * time", so put "if (game.util.percentChance(.5))" in your code.
     * @param  {Number} percent - a number, typically representing a percent
     * chance for something to happen, so it will probably be in the range
     * [0,1], but it can really be any number.
     * @return {Boolean}
     */
    window.game.util.percentChance = function(percent) {
        // Math.random() generates in the range [0,1)
        return Math.random() < percent;
    };

    /**
     * Given an enumeration that is used to represent flags (i.e. the values are
     * unique powers of 2) and a set of flags generated by OR-ing members of
     * this enum, this function will tell you the names of the flags that are 
     * set.
     *
     * For example:
     * var E = {
     *     METAL: 1,
     *     BLUE: 2,
     *     FAST: 4
     * };
     * var sonic = E.BLUE | E.FAST;
     * 
     * flagsToSemanticString(sonic, E) === "6 (BLUE|FAST)"
     */
    window.game.util.flagsToSemanticString = function(flags, sourceEnum) {
        var semanticString = '';
        for ( key in sourceEnum ) {
            if ( (flags & sourceEnum[key]) != 0 ) {
                if ( semanticString != '' ) semanticString += '|';
                semanticString += key;
            }
        }

        semanticString = flags + ' (' + semanticString + ')';

        return semanticString;
    };

    /**
     * Formats a number into a string. It's easiest to see what this does with
     * examples:
     *
     * game.util.formatPercentString(.5, 0)
     * "50"     <-- this represents "50%"
     * game.util.formatPercentString(.5552, 0)
     * "55"
     * game.util.formatPercentString(.5552, 1)
     * "55.5"
     * game.util.formatPercentString(.5552, 2)
     * "55.52"
     * game.util.formatPercentString(.5552, 3)
     * "55.52"  <-- doesn't add a zero for padding
     * 
     * @param  {Number} percentFromZeroToOne - a number representing a percent
     * @param  {Number} numDecimalPoints     - the number of decimal points you
     * want. This will not add zeroes for padding.
     * @return {String}                      - a string representing the percent
     */
    window.game.util.formatPercentString = function(percentFromZeroToOne, numDecimalPoints) {
        var percentFromZeroToOneHundred = percentFromZeroToOne * 100;
        var powerOfTen = Math.pow(10, numDecimalPoints);
        var formatted = Math.floor(percentFromZeroToOneHundred * powerOfTen) / powerOfTen;
        return '' + formatted;
    };

    /**
     * Simply adds all of the elements in an array. This assumes nothing about
     * their types, so you can use this to concatenate strings if you want.
     *
     * For example, calling this with [1,4,7] returns 12.
     * @param  {Array} array - an array of anything
     * @return {Object}       their "sum" (typically a number)
     */
    window.game.util.sumArrayValues = function(array) {
        var sum = 0;
        for (var i = 0; i < array.length; i++) {
            sum += array[i];
        };
        return sum;
    };

    /**
     * Randomly pulls unique elements from an array. For example:
     *
     * getElementsFromArray([1,2,3,4,5], 3) can return [4,1,3], or [1,5,2], etc.
     * but it cannot return [1,1,2] (no duplicates allowed unless they existed
     * in the original array).
     * @param  {Array} array - any array
     * @param  {Number} numElements - the number of elements you want
     * @param  {Boolean} useRelativeWeights - if true, this will randomly take
     * an element according to the weights of each object (see
     * randomFromWeights). If false, all elements will have an equal chance at
     * being chosen.
     * @return {Array} - an array containing some elements
     * from the input array.
     */
    window.game.util.getElementsFromArray = function(array, numElements, useRelativeWeights) {
        if ( useRelativeWeights === undefined ) useRelativeWeights = false;

        // Shallow-copy the array so that we can remove from this as we choose.
        var copy = this.shallowCopyArray(array);

        // The elements that we'll return.
        var randomElements = [];

        for (var i = 0; i < numElements; i++) {
            // If there are no more elements in the source array, we're done.
            if ( copy.length == 0 ) break;

            var index = null;

            if ( useRelativeWeights ) {
                var randomElement = this.randomFromWeights(copy);
                if ( randomElement == null ) {
                    // The only way this is possible is if you don't actually
                    // have relative weights on each object in the array.
                    console.log('Error: getElementsFromArray with useRelativeWeights==true returned a null element.');
                }

                // randomFromWeights returns an object, so we need to figure out
                // that object's index so that we can later remove it.
                for (var j = 0; j < copy.length; j++) {
                    if ( randomElement === copy[j] ) {
                        index = j;
                        break;
                    }
                };

            } else {
                index = Math.floor(Math.random() * copy.length);
            }

            randomElements.push(copy[index]);
            copy.splice(index, 1);
        };

        return randomElements;
    };
    
    /**
     * Given a list of weighted items, this will return one at random (according
     * to the weights).
     *
     * For example, if you have the weights (5,10,15), then they should be
     * picked with the frequencies (16.66%, 33.33%, 50%).
     *
     * This code was converted from Java code I wrote for BotLandLite. Back
     * then, I tested this with 100K trials with (5,10,15) and got these
     * numbers: 16713, 33260, and 50027. Those are pretty darn close to 16.66%,
     * 33.33%, and 50%.
     * @param {Array:Object} objectsWithRelativeWeight - this is an array of any
     * object that contains the property 'relativeWeight'.
     * @return {Object} - an object from the passed-in list, or null if none of
     * them had a weight.
     */
    window.game.util.randomFromWeights = function(objectsWithRelativeWeight) {
        // Get the total weight so that we can later get percentages.
        var totalWeight = 0;

        for (var i = 0; i < objectsWithRelativeWeight.length; i++) {
            if ( objectsWithRelativeWeight[i].relativeWeight === undefined ) {
                console.log('Warning: an object was passed in to ' +
                    'randomFromWeights that does not have "relativeWeight" ' +
                    'as a property. Returning null.');
                return null;
            }
            totalWeight += objectsWithRelativeWeight[i].relativeWeight;
        };

        if (totalWeight == 0) {
            // I will almost certainly never expect you to pass in all-zero
            // weights, so I print a warning here when it does.
            console.log('Warning: randomFromWeights is returning null.');
            return null;
        }

        // Generate a random float now so that we can stop once we found the
        // correct number below.
        var f = Math.random();

        // Make percentages based on the total weight. These are cumulative, so
        // in our (5,10,15) example, 'percentages' will be {0.16666667, 0.5,
        // 1.0}.
        var percentages = new Array(objectsWithRelativeWeight.length);
        var lastPercent = 0;

        for (var i = 0; i < objectsWithRelativeWeight.length; i++) {
            percentages[i] = lastPercent + (objectsWithRelativeWeight[i].relativeWeight / totalWeight);
            lastPercent = percentages[i];

            // We also return if we're at the last item to account for odd float
            // behavior.
            if ( f < lastPercent || i == objectsWithRelativeWeight.length - 1 ) {
                return objectsWithRelativeWeight[i];
            }
        };

        // This should be unreachable code due to the returns above.
        return null;
    }

    /**
     * Two circles collide if the distance between their centers is less than
     * the sum of their radii.
     * @param  {Number} x1 Center X of circle 1 (in pixels)
     * @param  {Number} y1 Center Y of circle 1 (in pixels)
     * @param  {Number} r1 Radius of circle 1 (in pixels)
     * @return {Boolean}    true if they collide
     */
    window.game.util.circlesCollide = function(x1, y1, r1, x2, y2, r2) {
        return window.game.util.distance(x1, y1, x2, y2) <= (r1 + r2);
    };

    /**
     * @return {Boolean} true if the point (x,y) is inside the rectangle (rectX,
     * rectY, rectW, rectH).
     */
    window.game.util.pointInRect = function(x, y, rectX, rectY, rectW, rectH) {
        return ( x >= rectX && x <= rectX + rectW && y >= rectY && y <= rectY + rectH );
    };

    /**
     * Tells you when two rectangles collide (intersection OR containment).
     */
    window.game.util.rectsCollide = function(x1,y1,w1,h1, x2,y2,w2,h2) {
        if ( x2 > x1 + w1 || y2 > y1 + h1 || x2 + w2 < x1 || y2 + h2 < y1 ) return false;
        return true;
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
        return game.util.randomArrayElement(game.util.getDictKeysAsArray(dict));
    };

    /**
     * Returns all of the keys of a dict as an array.
     *
     * E.g. calling this on {'hi':1, 'there':2} will return ['hi', 'there']
     * @param  {Object} dict - any dictionary
     * @return {Array}      - that dictionary's keys
     */
    window.game.util.getDictKeysAsArray = function(dict) {
        if ( dict === undefined || dict == null ) return [];

        var key;
        var allKeys = [];
        for(key in dict) {
            if(dict.hasOwnProperty(key) ) {
                allKeys.push(key);
            }
        }

        return allKeys;
    }

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
     *
     * All divs are added to one "master container" div because the canvas will
     * always be positioned at (0,0), so the "master container" will be put at
     * (0,0) on top of the canvas, then divs added to that can still flow
     * downwards.
     * @param  {String} text - the text to display.
     * @param  {String} identifierTag - this is optional. If you don't specify
     * it, it defaults to '1'. This can be any tag text you want, e.g. "unit
     * error". Specifying the same identifier across multiple calls to this
     * function will simply update the text you're outputting. Specifying
     * different identifiers will make multiple divs.
     */
    window.game.util.debugDisplayText = function(text, identifierTag) {
        // If you didn't supply an argument, set the ID to 1
        if ( typeof identifierTag === 'undefined' ) identifierTag = '1';

        // Add the "master container" div (see function-level comments) if it
        // doesn't exist.
        var $divContainer = $('#allDebugDisplayText');
        if ( $divContainer.length == 0 ) {
            // Use 'body' because it's always defined.
            $('body').after('<div id="allDebugDisplayText"></div>');

            // Obtain the div now that it exists
            $divContainer = $('#allDebugDisplayText');

            $divContainer.css({
                'position': 'absolute',
                'top': '0px',
                'left': '0px',
                'z-index': '99999',
                'width': '100%'
            });

            // All child divs will get this
            $divContainer.addClass('outline-font');
        }

        // Get rid of spaces since they screw this up somehow. The '/g' is
        // needed to replace all of the spaces.
        identifierTag = identifierTag.replace(/ /g, '');
        
        var divID = 'debugOutput' + identifierTag;

        // See if the div already exists
        var $debugDiv = $('#' + divID);
        if ( $debugDiv.length == 0 ) {
            // It didn't, so add it before the canvas
            $divContainer.append('<div id="' + divID +'"></div>');

            // Obtain the div now that it exists
            $debugDiv = $('#' + divID);
        }

        $debugDiv.text(text);
        $debugDiv.css({
            'color': '#fff',
            'font-size': '2em',
            'z-index': '99999'
        });
    };

    /**
     * Dumps the properties of an object directly into the DOM.
     * @param  {Object} object - any object
     */
    window.game.util.dumpObject = function(object) {
        for (var prop in object) {
            if ( object.hasOwnProperty(prop) ) {
                this.debugDisplayText(prop + ': ' + object[prop], '' + prop);
            }
        };
    };

    /**
     * Sets the color of the slider channel based on the value of the slider
     * (when it's filled more, the background color is brighter).
     * @param {Object} $slider - a JQuery UI slider to change the color of
     * @param {Boolean} changeGreen - if true, this will set the color to green,
     * otherwise red.
     */
    window.game.util.setSliderColor = function($slider, changeGreen) {
        var max = $slider.slider('option', 'max');
        var sliderValue = $slider.slider("value");
        var percent = sliderValue / max;
        var colorVal = Math.round((percent) * 255);
        colorVal = Math.min(255, Math.max(0, colorVal));
        paddedColorString = colorVal.toString(16);

        // If 'colorVal' is 10, then the string will be 'a', but it SHOULD be
        // '0a', so pad it here.
        if ( paddedColorString.length != 2 ) paddedColorString = '0' + paddedColorString;

        var colorString = changeGreen ? '#00' + paddedColorString + '00' : '#' + paddedColorString + '0000';

        $slider.css({
            'background': colorString
        });
    };

    /**
     * Copies all properties from one object to another EXCEPT for
     * propsToIgnore.
     * @param  {Object} sourceObject - the object from which to copy properties
     * @param  {Object} destObject - the object to copy properties to
     * @param  {Array:String} propsToIgnore - an array of properties NOT to
     * copy.
     */
    window.game.util.copyProps = function(sourceObject, destObject, propsToIgnore) {
        if ( propsToIgnore === undefined ) propsToIgnore = [];
        for ( var prop in sourceObject ) {
            if ( sourceObject.hasOwnProperty(prop) && propsToIgnore.indexOf(prop) == -1 ) {
                destObject[prop] = sourceObject[prop];
            }
        }
    };

    /**
     * Copies all properties from sourceObject to destObject EXCEPT for any
     * properties already defined in destObject, i.e. this will not OVERWRITE
     * any existing properties in destObject.
     *
     * For example:
     *
     * var sourceObject = {id: 5, relativeWeight:1, hello:'world'}
     * var destObject = {id: 5, relativeWeight: 9999, hi: 'there'}
     *
     * Calling copyPropsIfUndefined will result in a destObject of:
     *
     * {id: 5, relativeWeight:9999, hi:'there', hello:'world'}
     * See how relativeWeight and hi:'there' are unchanged?
     *
     * @param  {Object} sourceObject - the object from which to copy properties
     * @param  {Object} destObject - the object to copy properties to
     */
    window.game.util.copyPropsIfUndefined = function(sourceObject, destObject) {
        var propsToIgnore = [];
        for ( var prop in destObject ) {
            if ( destObject.hasOwnProperty(prop) ) {
                propsToIgnore.push(prop);
            }
        }

        this.copyProps(sourceObject, destObject, propsToIgnore);
    };

    /**
     * Returns an item in a container based on a property comparison.
     *
     * For example, if you have an array like this:
     * a = [{id:1, name:'hi'}, {id:3, name:'hey'}, {id:5, name:'hey'}]
     *
     * You can call this with (a, 'name', 'hey') and it will return the second
     * entry, or (a, 'id', 5) will return the third entry.
     *
     * Comparison is '==' for two reasons:
     * 1. Searching for the key of one dictionary (which must be a string) in
     *    the values of another will still work, e.g. for id comparisons.
     * 2. 'propertyName' likely doesn't change types amongst objects in the same
     *    container, so '==' is probably what you want anyway.
     *
     * You can also call this with a dictionary, e.g.
     * a = {ATTACK: {id: 1}, FIREBALL: {id: 2}}
     * 
     * (a, 'id', 2) will return the FIREBALL object.
     *
     * One last note: if you're calling this on an array, consider switching 
     * the array to a hashtable whose keys are 'propertyName'.
     * 
     * @param  {Object} container - an array a dictionary (either 
     * is fine) of objects.
     * @param  {String} propertyName - the name of a property in the objects of
     * the container.
     * @param  {Object} propertyValue - a value for the property
     * @return {Object} the first element in 'container' whose property matches 
     * what you passed in.
     */
    window.game.util.getItemInContainerByProperty = function(container, propertyName, propertyValue) {
        // Need to special-case arrays based on the Google style guide:
        // http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml?showone=for-in_loop#for-in_loop
        if ( $.isArray(container) ) {
            for (var i = 0; i < container.length; i++) {
                if ( container[i] !== null && container[i][propertyName] == propertyValue ) {
                    return container[i];
                }
            };
        } else {
            for ( var key in container ) {
                if ( container[key][propertyName] == propertyValue ) {
                    return container[key];
                }
            }
        }

        return null;
    };

    /**
     * This will print the current stack trace to the screen. It's useful for
     * devices that don't have a console (e.g. iPad).
     *
     * I adapted this code from something I found online.
     */
    window.game.util.printStackTrace = function() {
        var callstack = [];
        var stackLines = null;
        try {
            // The whole point of this line is to produce an exception.
            thisVariableDoes.notExist +=0;
        } catch(e) {

            // Many browsers will have 'stack' in the exception (at least Chrome
            // and Firefox will).
            if (e.stack) {
                stackLines = e.stack.split('\n');
            } else if (window.opera && e.message) { //Opera
                stackLines = e.message.split('\n');
            }

            if ( stackLines != null ) {
                for (var i = 0; i < stackLines.length; i++) {
                    callstack.push(stackLines[i]);
                };
                //Remove call to this function, which will appear on the top of
                //the stack.
                callstack.shift();
            }
        }

        // Not sure how well the following code works.
        if (stackLines == null) { //IE and Safari
            var currentFunction = arguments.callee.caller;
            while (currentFunction) {
                var fn = currentFunction.toString();
                var fname = fn.substring(fn.indexOf('function') + 8, fn.indexOf('')) || 'anonymous';
                callstack.push(fname);
                currentFunction = currentFunction.caller;
            }
        }

        game.util.debugDisplayText(callstack.join('\n'),'callstack')
    };

}());
