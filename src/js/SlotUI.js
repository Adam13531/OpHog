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
        //
        // The image needs an ID too so that accept() will work.
        $(domSelector).append(
            '<span id="slot' + this.slotIndex +'"style="display:inline-block;margin:1px;width:32px;height:32px">' +
            '<img style="z-index:5" src="' + this.getBackImage() + '" width="32" height="32"/>' +
            '<img id="img-slot' + this.slotIndex + '"style="display:block;z-index:10" src="'+game.imagePath+'/black_slot.png" width="32" height="32"/>' +
            '</span>');
            
        // Get the span we just added
        var $itemImageTag = $(domSelector + ' > span:last');

        // This is the <span> representing this slot
        this.$spanSelector = $itemImageTag;

        // The background <img> in the <span>
        this.$bgImage = $(domSelector + ' > span:last > img:first');

        // The foreground <img> in the <span>
        this.$itemImage = $(domSelector + ' > span:last > img:last');
        // http://stackoverflow.com/questions/2098387/jquery-ui-draggable-elements-not-draggable-outside-of-scrolling-div
        var dropped = false;

        // This is the slot that you dragged from
        //   
        draggingSlotIndex = null;
        var indexInClosure = this.slotIndex;
        var slotUIToDrag = this;
        this.$itemImage.addClass('draggable-item');
        this.$itemImage.draggable({
            // prevents ui-draggable from being added
            addClasses:false,

            containment: '#top_part_with_characters_and_items',

            // Reverts back to original position if target is invalid
            revert: 'invalid' ,

            // Element is cloned and the clone is dragged
            helper: 'clone',

            // Where the draggable helper is appended while dragging
            appendTo: 'body',

            start: function(event, ui) {
                dropped = false;
                draggingSlotIndex = indexInClosure;
                $(this).addClass('hideit');
            },
            stop: function(event, ui) {
                if (dropped==true) {
                    $(this).remove();
                } else {
                    $(this).removeClass('hideit');
                }
            },

            // If true, container auto-scrolls while dragging
            scroll: false
        });


        $(this.$spanSelector).droppable({
            // accept: '.draggable-item', // this could also be a function that could check IDs
            // 
            // // http://jsfiddle.net/z7kWM/
            // 
            // $("div.droppable").droppable({
            //     accept: function (elm) {
            //         var $this = $(this);
            //         if ($this.data("question-id") == elm.data("question-id"))
            //             return true;
            //         return false;
            //     },
            //     drop: function(e,ui) {
            //         console.log(e, ui);
            //     }
            // });

            // $("div.draggable").draggable({
            //     revert: "invalid"
            // });
            accept: function(elm) {
                console.log('hi');
                // have to figure out here if it can be accepted
                // use elm.attr('id')
            },
            hoverClass: 'testhover',
            activeClass: 'testactive',
            drop: function(event, ui) {

                // return;

                game.util.debugDisplayText('Dragged from slot' + draggingSlotIndex + ' to ' + event.target.id);
                var indexOnly = parseInt(event.target.id.replace('slot', ''));
                if (indexOnly == draggingSlotIndex) {
                    return;
                }

                var success = game.InventoryUI.dragItemDone(draggingSlotIndex, indexOnly);
                if ( success ) {
                    dropped = true;
                    $.ui.ddmanager.current.cancelHelperRemoval = true;
                    // ui.helper.appendTo(this);
                    ui.helper.remove();
                }


            }
        });

        // Position the images so that they're on top of each other.
        var firstImgHeight = this.$bgImage.height();
        this.$itemImage.css({
            position : 'relative',
            top : (-firstImgHeight) + 'px'
        });

        // Setting the item to whatever it currently is will update the picture.
        this.updateItem();

        $(this.$spanSelector).click(this.clickedSlot(this));
        $(this.$spanSelector).dblclick(this.setOrRemoveSlotItem(this));
    };

    /**
     * Gets an onclick function to select a slot
     * @param  {SlotUI} slotUI - the slot you clicked
     * @return {Object} the onclick function
     */
    window.game.SlotUI.prototype.clickedSlot = function(slotUI) {
        return function() {
            game.InventoryUI.clickedSlot(slotUI);
        };
    };

    window.game.SlotUI.prototype.isEmpty = function() {
        return this.slot == null || this.slot.isEmpty();
    };

    /**
     * Gets a dblclick function to set a slot's item.
     * @param  {Slot} slot - the slot you double-clicked
     * @return {Object} the dblclick function
     */
    window.game.SlotUI.prototype.setOrRemoveSlotItem = function(slotUI) {
        return function() {
            var slot = slotUI.slot;
            if (slot.item == null) {

                var itemID = 0;
                if (slot.isEquipSlot()) {
                    itemID = 1;
                }

                var newItem = new game.Item(itemID);
                slot.setItem(newItem);
            } else {
                slot.setItem(null);
            }
        };
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
            var img = game.imagePath + '/img_trans.png';
            this.$itemImage.attr('src', img);
            this.$itemImage.attr('class', item.cssClass);
            this.$itemImage.addClass('draggable-item'); // TODO: this is really bad, I shouldn't have to add this every time.
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

    window.game.SlotUI.prototype.selectSlot = function() {
        this.$bgImage.attr('src', game.imagePath + '/slot2.png');
    };
    
}());
