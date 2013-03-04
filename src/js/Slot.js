( function() {

    /**
     * Enum for valid slot types.
     */
    window.game.SlotTypes = {
        EQUIP: 'equip',
        USABLE: 'usable',
        WAR: 'war',
        WIZ: 'wiz',
        ARCH: 'arch'
    };

    /**
     * Slot class.
     * @param {String} domSelector - the jquery selector for the span representing the slot (e.g. '#some-span')
     * @param {SlotTypes} slotType - the type of the slot
     * @param {number} slotIndex - the index of this slot
     */
    window.game.Slot = function Slot(domSelector, slotType, slotIndex) {
        // String representing the type of the slot - pull this from
        // window.game.SlotTypes
        this.slotType = slotType;

        // Number representing the index of the slot itself
        this.slotIndex = slotIndex;

        // Number representing the type of item inside this slot, or null if
        // it's empty.
        this.itemIndex = null;

        // Add the span representing this slot. There are two images: the
        // background and the foreground.
        $(domSelector).append(
            '<span style="display:inline-block;margin:1px;width:32px;height:32px">' +
            '<img style="z-index:5" src="' + this.getBackImage() + '" width="32" height="32"/>' +
            '<img style="display:block;z-index:10" src="'+game.imagePath+'/black_slot.png" width="32" height="32"/>' +
            '</span>');
            
        // Get the span we just added
        var $itemImageTag = $(domSelector + ' > span:last');

        // This is the <span> representing this slot
        this.$spanSelector = $itemImageTag;

        // The background <img> in the <span>
        this.$bgImage = $(domSelector + ' > span:last > img:first');

        // The foreground <img> in the <span>
        this.$itemImage = $(domSelector + ' > span:last > img:last');

        // Position the images so that they're on top of each other.
        var firstImgHeight = this.$bgImage.height();
        this.$itemImage.css({
            position : 'relative',
            top : (-firstImgHeight) + 'px'
        });

        // Setting the item to whatever it currently is will update the picture.
        this.setItem(this.itemIndex);

        $(this.$spanSelector).click(this.selectSlot(this));
        $(this.$spanSelector).dblclick(this.setOrRemoveSlotItem(this));
    };

    /**
     * Gets an onclick function to select a slot
     * @param  {Slot} slot - the slot you clicked
     * @return {Object} the onclick function
     */
    window.game.Slot.prototype.selectSlot = function(slot) {
        return function() {
            game.Inventory.setSelectedSlot(slot);
        };
    };
    
    /**
     * Gets a dblclick function to set a slot's item.
     * @param  {Slot} slot - the slot you double-clicked
     * @return {Object} the dblclick function
     */
    window.game.Slot.prototype.setOrRemoveSlotItem = function(slot) {
        return function() {
            if (slot.itemIndex == null) {
                var itemIndexToSet = 0;
                if (slot.isEquipSlot()) {
                    itemIndexToSet = 1;
                }
                slot.setItem(itemIndexToSet);
            } else {
                slot.setItem(null);
            }
        };
    };

    /**
     * Sets the item in this slot
     * @param {number} itemIndex - the item's type, as a number
     */
    window.game.Slot.prototype.setItem = function(itemIndex) {
        var oldItemIndex = this.itemIndex;
        this.itemIndex = itemIndex;

        if (this.itemIndex == null) {
            this.$itemImage.hide();
        } else {
            var img = game.imagePath + '/img_trans.png';
            var clazz = 'item-sprite gem32-png';
            if (itemIndex == 1) {
                clazz = 'item-sprite shield32-png';
            }
            this.$itemImage.attr('src', img);
            this.$itemImage.attr('class', clazz);
            this.$itemImage.show();
        }
        
        if ( oldItemIndex != this.itemIndex ) {
            game.Inventory.updateDescription();
        }
    };

    /**
     * Returns true if this slot can hold an equippable item.
     */
    window.game.Slot.prototype.isEquipSlot = function() {
        return this.slotType == window.game.SlotTypes.EQUIP || this.slotType == window.game.SlotTypes.WAR || this.slotType == window.game.SlotTypes.WIZ || this.slotType == window.game.SlotTypes.ARCH;
    }; 

    /**
     * Returns true if this slot can hold a usable item.
     */
    window.game.Slot.prototype.isUsableSlot = function() {
        return this.slotType == window.game.SlotTypes.USABLE;
    };

    /**
     * Returns true if this slot has something in it.
     */
    window.game.Slot.prototype.isFilled = function() {
        return this.$itemImage.is(':visible');
    };

    /**
     * Gets the background image for a slot.
     * @return {String} relative path to an image file
     */
    window.game.Slot.prototype.getBackImage = function() {
        var img;
        switch(this.slotType) {
            case window.game.SlotTypes.EQUIP:
                img = game.imagePath + '/blue_slot.png';
                break;
            case window.game.SlotTypes.USABLE:
                img = game.imagePath + '/red_slot.png';
                break;
            case window.game.SlotTypes.WAR:
                img = game.imagePath + '/black_slot.png';
                break;
            case window.game.SlotTypes.WIZ:
                img = game.imagePath + '/purple_slot.png';
                break;
            case window.game.SlotTypes.ARCH:
                img = game.imagePath + '/green_slot.png';
                break;
            default:
                img = game.imagePath + '/black_slot.png'; break;
        }

        return img;
    };

    /**
     * Changes the background image of this slot back to normal.
     * @return {null}
     */
    window.game.Slot.prototype.deselectSlot = function() {
        var img = this.getBackImage();
        this.$bgImage.attr('src', img);
    };
}());
