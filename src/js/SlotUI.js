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

        // http://stackoverflow.com/questions/2098387/jquery-ui-draggable-elements-not-draggable-outside-of-scrolling-div
        var dropped = false;

        // Capture this slot in the closures below
        var thisSlotUI = this;

        this.$itemImage.draggable({
            // prevents ui-draggable from being added
            addClasses:false,

            // Prevents you from dragging outside of this element
            containment: '#top_part_with_characters_and_items',

            // The z-index of the draggable helper. IE requires this to be
            // explicitly set to something higher than the dialog's z-index.
            zIndex: 100,

            // Reverts back to original position if target is invalid
            revert: 'invalid',

            // Element is cloned and the clone is dragged
            helper: 'clone',

            // Used to scope this draggable so that dragging the dialog won't
            // trigger these events
            scope: 'inventory-draggable',

            // Where the draggable helper is appended while dragging
            appendTo: 'body',

            start: function(event, ui) {
                dropped = false;
                game.InventoryUI.draggingSlotUI = thisSlotUI;
                $(this).addClass('hideit');
            },
            stop: function(event, ui) {
                // $(this) refers to the original DOM element that you dragged.
                // We use the clone helper, so if we dropped the clone, then
                // we can remove the original (which was hidden anyway). If
                // the clone wasn't accepted, then it will revert back to its
                // original position, then it will be removed, so we need to
                // show our original again.
                if (dropped==true) {
                    $(this).remove();
                } else {
                    $(this).removeClass('hideit');
                }

                // Revert all highlighting
                game.InventoryUI.revertHighlightOnAllSlots();

                game.InventoryUI.draggingSlotUI = null;
            },

            // If true, container auto-scrolls while dragging
            scroll: false
        });


        // Although yes, this is droppable for the slot, it may make more sense to put this in InventoryUI.
        $(this.$spanSelector).droppable({
            scope: 'inventory-draggable',

            // This is triggered when something is dragged. We do this instead
            // of just setting an activeClass so that we do more than just apply
            // css.
            //
            // If this isn't called, then slots won't be highlighted when you
            // start dragging.
            // 
            // We don't implement deactivate because we need to revert all of
            // the slots' visual state after the drop ends, so that goes in the
            // draggable's 'stop' function.
            activate: function(event, ui) {
                var targetID = $(this).attr('id');
                var targetSlotIndex = parseInt(targetID.replace('slot', ''));

                if (thisSlotUI.swapItems(game.InventoryUI.draggingSlotUI, true)) {
                    thisSlotUI.highlight(true, false);
                }

            },

            // This returns true if this will accept the dragged item. There
            // many droppables though, so suppose you drop an item in slot #3
            // (which means drop() was called), that doesn't stop accept() from
            // being called on all slots afterward, except drop() was already
            // called, so now the slot whose item you WERE dragging is
            // potentially empty, and that'll change the value of "accept" this
            // time around. That's not the only problem though: imagine you're
            // dragging an equippable item - it would graphically fade all of
            // the usable slots since you can't drag an equippable item to a
            // usable slot. That would never get reverted since 'accept' is
            // always going to return false for the usable slots.  The solution
            // is this: when you're done dragging the item entirely, revert all
            // graphical state back to what it was before you dragged.
            accept: function(elm) {
                if (game.InventoryUI.draggingSlotUI == null ) return null;

                var canBeDraggedTo = thisSlotUI.swapItems(game.InventoryUI.draggingSlotUI, true);
                if ( !canBeDraggedTo ) {
                    // Highlight it red. If we wanted to add a class here, we'd
                    // need to make sure to remove them in the 'stop' of the
                    // draggable with something like
                    // $('.testactive').removeClass('testactive');
                    thisSlotUI.highlight(false, true);
                }
                return canBeDraggedTo;
            },

            // Whatever you're hovering over will get this class
            hoverClass: 'testhover',

            // This only applies to things that accept() the draggable
            // activeClass: 'testactive',
            drop: function(event, ui) {
                if (thisSlotUI.slotIndex == game.InventoryUI.draggingSlotUI.slotIndex) {
                    return;
                }

                var success = thisSlotUI.swapItems(game.InventoryUI.draggingSlotUI, false);
                if ( success ) {
                    dropped = true;

                    // Select the slot we moved to
                    game.InventoryUI.clickedSlot(thisSlotUI);
                    $.ui.ddmanager.current.cancelHelperRemoval = true;
                    ui.helper.remove();
                    return true;
                }

                return false;
            }
        });

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

        $(this.$spanSelector).click(this.clickedSlot(this));

        // For usable slots, double-clicking will enter USE mode.
        if ( this.slot.isUsableSlot() ) {
            $(this.$spanSelector).dblclick(this.useItem(this));
        }
    };

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


    window.game.SlotUI.prototype.swapItems = function(otherSlotUI, simulateOnly) {
        // If no SlotUI was passed in, then we can't swap.
        if ( otherSlotUI == null ) {
            return false;
        }

        return this.slot.swapItems(otherSlotUI.slot, simulateOnly);
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
     * Gets a dblclick function to enter USE mode.
     * @param  {Slot} slot - the slot you double-clicked
     * @return {Object} the dblclick function
     */
    window.game.SlotUI.prototype.useItem = function(slotUI) {
        return function() {
            if (!slotUI.isEmpty()) {
                game.InventoryUI.enterUseMode();
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
            this.$itemImage.attr('class', item.cssClass);

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
