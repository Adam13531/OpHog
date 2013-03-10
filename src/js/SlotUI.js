( function() {

    /**
     * SlotUI class.
     * @param {String} domSelector - the jquery selector for the span representing the slot (e.g. '#some-span')
     * @param {Slot} slot - the Slot backing this SlotUI.
     */
    window.game.SlotUI = function SlotUI(domSelector, slot) {
        this.slot = slot;
        this.slotIndex = slot.slotIndex;

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
        this.updateItem();

        $(this.$spanSelector).click(this.selectSlot(this));
        $(this.$spanSelector).dblclick(this.setOrRemoveSlotItem(this));
    };

    /**
     * Gets an onclick function to select a slot
     * @param  {SlotUI} slotUI - the slot you clicked
     * @return {Object} the onclick function
     */
    window.game.SlotUI.prototype.selectSlot = function(slotUI) {
        return function() {
            game.InventoryUI.setSelectedSlot(slotUI);
        };
    };

    /**
     * Gets a dblclick function to set a slot's item.
     * @param  {Slot} slot - the slot you double-clicked
     * @return {Object} the dblclick function
     */
    window.game.SlotUI.prototype.setOrRemoveSlotItem = function(slotUI) {
        return function() {
            var slot = slotUI.slot;
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
     * Updates the images representing this slot.
     */
    window.game.SlotUI.prototype.updateItem = function() {
        var itemType = this.slot.itemIndex;

        if (itemType == null) {
            this.$itemImage.hide();
        } else {
            var img = game.imagePath + '/img_trans.png';
            var clazz = 'item-sprite gem32-png';
            if (itemType == 1) {
                clazz = 'item-sprite shield32-png';
            }
            this.$itemImage.attr('src', img);
            this.$itemImage.attr('class', clazz);
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
     * Changes the background image of this slot back to normal.
     * @return {null}
     */
    window.game.SlotUI.prototype.deselectSlot = function() {
        var img = this.getBackImage();
        this.$bgImage.attr('src', img);
    };
    
}());
