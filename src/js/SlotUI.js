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
     * SlotUI base-class constructor. useThisConstructor is here to ensure that
     * this constructor is only being used when a base class really wants to
     * call it. That's because it gets called when a base class first inherits
     * from it.
     * @param {Boolean} useThisConstructor - True when this constructor code
     * should run
     * @param {String} domSelector - the jquery selector for the span
     * representing the slot (e.g. '#some-span')
     * @param {Slot} slot - the Slot backing this SlotUI.
     */
    window.game.SlotUI = function SlotUI(useThisConstructor, domSelector, slot) {
        if ( useThisConstructor == undefined) return;

        this.slot = slot;
        this.slotIndex = slot.slotIndex;

        // Add the span representing this slot. There are two images: the
        // background and the foreground.
        //
        // The image needs an ID too so that accept() will work.
        // 
        // Not all child classes will use all of these DOM elements. TODO:
        // refactor this.
        $(domSelector).append(
            '<span id="slot' + this.slotIndex +'"style="position:relative;display:inline-block;margin:1px;width:32px;height:32px">' +
            '<img style="z-index:5" src="' + this.getBackImage() + '" width="32" height="32"/>' +
            '<span style="display:block;z-index:10;width:32px;height:32px;"></span>' +
            '<img style="display:block;z-index:11" src="'+game.imagePath+'/trans-green.png" width="32" height="32"/>' +
            '<img style="display:block;z-index:11" src="'+game.imagePath+'/trans-red.png" width="32" height="32"/>' +
            '</span>');
            
        // Get the span we just added
        var $itemImageTag = $(domSelector + ' > span:last');

        // This is the <span> representing this slot
        this.$spanSelector = $itemImageTag;

        // The background <img> in the <span>
        this.$bgImage = $(domSelector + ' > span:last > img:first');

        // The foreground image in the <span>. This is a span itself so that it
        // can display quantity for stackable items. This gives the added
        // benefit of making the text draggable along with the item.
        this.$itemImage = this.$bgImage.next();

        // These are simply overlays that will be shown/hidden appropriately
        // when dragging items around.
        this.$greenImage = this.$itemImage.next();
        this.$redImage = this.$greenImage.next();

        // Position the images so that they're on top of each other.
        $.each([this.$itemImage, this.$greenImage, this.$redImage], function(index, value) {
            value.css({
                position : 'absolute',
                top: 0,
                left: 0
            });
        });

        this.highlight(false, false);

        // Setting the item to whatever it currently is will update the picture.
        this.updateItem();

        game.HammerHelper.registerClickAndTap($(this.$spanSelector), this.clickedSlot(this));
    };

    /**
     * Highlights or unhighlights the slot.
     * @param  {Boolean} isGreen - true if you want the green image to show
     * @param  {Boolean} isRed   - true if you want the red image to show
     */
    window.game.SlotUI.prototype.highlight = function(isGreen, isRed) {
        if ( isGreen ) {
            this.$greenImage.show();
        } else {
            this.$greenImage.hide();
        }

        if ( isRed ) {
            this.$redImage.show();
        } else {
            this.$redImage.hide();
        }
    };

    /**
     * Gets an onclick function to select a slot
     * @param  {SlotUI} slotUI - the slot you clicked
     * @return {Object} the onclick function
     */
    window.game.SlotUI.prototype.clickedSlot = function(slotUI) {};

    window.game.SlotUI.prototype.isEmpty = function() {
        return this.slot == null || this.slot.isEmpty();
    };

    /**
     * Updates the images representing this slot.
     */
    window.game.SlotUI.prototype.updateItem = function() {
        // (this is here purely to save typing out 'this.slot.item')
        var item = this.slot.item;

        if (item == null) {
            this.$itemImage.hide();
        } else {
            if (item.stackable) {
                // Remember: put all font-related style on THIS span, not
                // surrounding spans.
                this.$itemImage.html('<span style="color: white; font-size:.95em;position:absolute;left:2px;top:11px;"><b>' + item.quantity + '</b></span>');
            } else {
                // Non-stackable items shouldn't show any number.
                this.$itemImage.html('');
            }

            var img = game.imagePath + '/img_trans.png';
            this.$itemImage.attr('src', img);
            this.$itemImage.addClass('item-sprite');
            this.$itemImage.css('background-position', item.getCssBackgroundPosition());

            // Add this so that the quantity is actually visible
            this.$itemImage.addClass('outline-font');
            this.$itemImage.show();
        }
    };

    /**
     * Gets the background image for a slot.
     * @return {String} relative path to an image file
     */
    window.game.SlotUI.prototype.getBackImage = function() {
        var img;
        switch(this.slot.slotType) {
            case game.SlotTypes.EQUIP:
                img = game.imagePath + '/blue_slot.png';
                break;
            case game.SlotTypes.USABLE:
                img = game.imagePath + '/red_slot.png';
                break;
            case game.SlotTypes.WAR:
                img = game.imagePath + '/black_slot.png';
                break;
            case game.SlotTypes.WIZ:
                img = game.imagePath + '/purple_slot.png';
                break;
            case game.SlotTypes.ARCH:
                img = game.imagePath + '/green_slot.png';
                break;
            default:
                img = game.imagePath + '/black_slot.png';
                break;
        }

        return img;
    };

    /**
     * Gets this slot's item.
     * @return {Item} - this slot's item
     */
    window.game.SlotUI.prototype.getItem = function() {
        return this.slot.item;
    };

    /**
     * Changes the background image of this slot back to normal.
     */
    window.game.SlotUI.prototype.deselectSlot = function() {
        var img = this.getBackImage();
        this.$bgImage.attr('src', img);
    };

    window.game.SlotUI.prototype.selectSlot = function() {
        this.$bgImage.attr('src', game.imagePath + '/slot2.png');
    };
    
}());
