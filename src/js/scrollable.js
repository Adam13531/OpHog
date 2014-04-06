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

    // This will call jquery-ui.js's function: $.widget = function( name, base, prototype ) {...}
    //
    // This should ONLY be used on an element that has setSlider called on it.
    // In other words, don't call this yourself. Also, if something ever needs
    // a scrollbar, then later DOESN'T need it, then destroy should probably
    // be called.
    // 
    // You can call public functions in this like so:
    // $jQuerySelector.scrollable("publicFunctionName")
    $.widget("ui.scrollable", $.ui.mouse, {

        options : {
            // "scrollpane" must be passed in. It's the div representing the entire scrollpane
            // (it's the same thing you're calling scrollable() on in the first place).
            scrollpane : null
        },

        // Be very careful about what you put in _create. It is only called once
        // despite how many times you call ui.scrollable(). I ran into a bug
        // before where I was caching a scrollbar in the inventory, but when
        // I first called addSlot, the scrollbar didn't exist, and I assumed that
        // _create would be called again to set it once it DID exist.
        // 
        // More useful information here: http://ajpiano.com/widgetfactory/
        _create : function(test) {
            // This represents the position of the mouse/scrollbar when the user clicks.
            this.scrollPos = null;
            this._mouseInit();
        },

        // This is probably not a complete destroy function. Based on the wiki
        // (http://wiki.jqueryui.com/w/page/12138135/Widget%20factory): "This
        // destroys an instantiated plugin and does any necessary cleanup. All
        // modifications your plugin performs must be removed on destroy. This
        // includes removing classes, unbinding events, destroying created
        // elements, etc. The widget factory provides a starting point, but
        // should be extended to meet the needs of the individual plugin."
        // 
        // I never call this directly.
        destroy : function() {
            this._mouseDestroy();
            this._destroy();
        },

        _destroy: function() {
            this._super();
        },

        _mouseStart : function(event) {
            this.sliderVertical = this.options.scrollpane.find(".slider-vertical");

            // If there was no slider, then we apparently called scrollable()
            // without even needing a scrollbar.
            if ( this.sliderVertical.length == 0 ) {
                return;
            }

            var curValue = this.sliderVertical.slider("value");

            this.scrollPos = {
                x : event.pageX,
                y : event.pageY,
                startValue : curValue
            };
        },
        _mouseStop : function(event) {
        },

        _mouseDrag : function(event) {
            if ( this.sliderVertical.length == 0 ) {
                return;
            }

            var mouseYDifference = this.scrollPos.y - event.pageY;
            var curValue = this.sliderVertical.slider("value");
            var finalValue = this.scrollPos.startValue - mouseYDifference;

            this.sliderVertical.slider("value", finalValue);

            // This is a workaround for a bug in Chrome. See the 'garbage' tag in the HTML file for a full comment.
            $('#garbage').html('<b></b>');
        }
    });

    // This code was adapted from http://www.simonbattersby.com/blog/vertical-scrollbar-using-jquery-ui-slider/
    window.ui.setSlider = function($scrollpane) {//$scrollpane is the div to be scrolled
        //set options for handle image - amend this to true or false as required
        var handleImage = false;

        //change the main div to overflow-hidden as we can use the slider now
        $scrollpane.css('overflow', 'hidden');

        //if it's not there, wrap a div around the contents of the scrollpane to allow the scrolling
        if ($scrollpane.find('.scroll-content').length == 0)
            $scrollpane.children().wrapAll('<\div class="scroll-content"> /');

        //compare the height of the scroll content to the scroll pane to see if we need a scrollbar
        var difference = $scrollpane.find('.scroll-content').height() - $scrollpane.height();
        //eg it's 200px longer
        $scrollpane.data('difference', difference);

        //scrollbar exists but is no longer required
        if (difference <= 0 && $scrollpane.find('.slider-wrap').length > 0) {
            $scrollpane.find('.slider-wrap').remove();
            //remove the scrollbar
            $scrollpane.find('.scroll-content').css({
                top : 0
            });
            //and reset the top position
        }

        //if the scrollbar is needed, set it up...
        if (difference > 0) {
            var proportion = difference / $scrollpane.find('.scroll-content').height();
            //eg 200px/500px

            var handleHeight = Math.round((1 - proportion) * $scrollpane.height());
            //set the proportional height - round it to make sure everything adds up correctly later on
            handleHeight -= handleHeight % 2;

            //if the slider has already been set up and this function is called again, we may need to set the position of the slider handle
            var contentposition = $scrollpane.find('.scroll-content').position();
            var sliderInitial = 100 * (1 - Math.abs(contentposition.top) / difference);

            //if the slider-wrap doesn't exist, insert it and set the initial value
            if ($scrollpane.find('.slider-wrap').length == 0) {
                // Apply "no-slider-vertical" so that we don't get a background
                $scrollpane.append('<\div class="slider-wrap no-slider-vertical"><\div class="slider-vertical"><\/div><\/div>');
                //append the necessary divs so they're only there if needed
                sliderInitial = 100;
            }

            $scrollpane.find('.slider-wrap').height($scrollpane.height());
            //set the height of the slider bar to that of the scroll pane

            //set up the slider
            $scrollpane.find('.slider-vertical').slider({
                orientation : 'vertical',
                min : 0,
                max : 100,
                range : 'min',
                value : sliderInitial,
                slide : function(event, ui) {
                    var topValue = -((100 - ui.value) * difference / 100);
                    $scrollpane.find('.scroll-content').css({
                        top : topValue
                    });
                    //move the top up (negative value) by the percentage the slider has been moved times the difference in height
                    $scrollpane.find(".ui-slider-range").height(ui.value + '%');
                    //set the height of the range element
                },
                change : function(event, ui) {
                    var topValue = -((100 - ui.value) * ($scrollpane.find('.scroll-content').height() - $scrollpane.height()) / 100);
                    //recalculate the difference on change
                    $scrollpane.find('.scroll-content').css({
                        top : topValue
                    });
                    //move the top up (negative value) by the percentage the slider has been moved times the difference in height
                    $scrollpane.find(".ui-slider-range").height(ui.value + '%');
                }
            });

            //set the handle height and bottom margin so the middle of the handle is in line with the slider
            $scrollpane.find(".ui-slider-handle").css({
                height : handleHeight,
                'margin-bottom' : -0.5 * handleHeight
            });
            var origSliderHeight = $scrollpane.height();
            //read the original slider height
            var sliderHeight = origSliderHeight - handleHeight;
            //the height through which the handle can move needs to be the original height minus the handle height
            var sliderMargin = (origSliderHeight - sliderHeight) * 0.5;
            //so the slider needs to have both top and bottom margins equal to half the difference
            $scrollpane.find(".ui-slider").css({
                height : sliderHeight,
                'margin-top' : sliderMargin
            });
            //set the slider height and margins
            $scrollpane.find(".ui-slider-range").css({
                bottom : -sliderMargin
            });
            //position the slider-range div at the top of the slider container

            //if required create elements to hold the images for the scrollbar handle
            if (handleImage) {
                $(".ui-slider-handle").append('<img class="scrollbar-top" src="/images/misc/scrollbar-handle-top.png"/>');
                $(".ui-slider-handle").append('<img class="scrollbar-bottom" src="/images/misc/scrollbar-handle-bottom.png"/>');
                $(".ui-slider-handle").append('<img class="scrollbar-grip" src="/images/misc/scrollbar-handle-grip.png"/>');
            }
        }//end if

        //code for clicks on the scrollbar outside the slider
        $(".ui-slider").click(function(event) {//stop any clicks on the slider propagating through to the code below
            event.stopPropagation();
        });

        $(".slider-wrap").click(function(event) {//clicks on the wrap outside the slider range
            var offsetTop = $(this).offset().top;
            //read the offset of the scroll pane
            var clickValue = (event.pageY - offsetTop) * 100 / $(this).height();
            //find the click point, subtract the offset, and calculate percentage of the slider clicked
            $(this).find(".slider-vertical").slider("value", 100 - clickValue);
            //set the new value of the slider
        });

        // -------- code that I'm adding to make mouse-drag in the content area work --------------
        $scrollpane.find('.scroll-content').scrollable({
            scrollpane : $scrollpane
        });
        // -------- code that I'm adding to make mouse-drag in the content area work --------------

        //additional code for mousewheel
        if ($.fn.mousewheel) {
            $scrollpane.unmousewheel();
            //remove any previously attached mousewheel events
            $scrollpane.mousewheel(function(event, delta) {

                var speed = Math.round(5000 / $scrollpane.data('difference'));
                if (speed < 1)
                    speed = 1;
                if (speed > 100)
                    speed = 100;

                var sliderVal = $(this).find(".slider-vertical").slider("value");
                //read current value of the slider

                sliderVal += (delta * speed);
                //increment the current value

                $(this).find(".slider-vertical").slider("value", sliderVal);
                //and set the new value of the slider

                event.preventDefault();
                //stop any default behaviour
            });

        }

    }
}());
