( function() {

    // The inventory UI keeps track of available items (equippable and usable),
    // but it also tracks the equipped items, so it's sort of like the inventory
    // for each character class too.
    window.game.InventoryUI = {
        
        /**
         * Array of SlotUI objects. These should never be rearranged since they
         * are referred to by numerical index (slotUI.slotIndex).
         * @type {Array<SlotUI>}
         */
        slots: new Array(),
        
        /**
         * The currently selected slot.
         * @type {SlotUI}
         */
        selectedSlotUI: null,

        // This is the slot that you dragged from and must be global
        // 
        // This is also to fix a bug that happens when you just mouseUp on something
        // without actually dragging.
        //
        // This needs to be global because it's shared amongst the different slots.
        draggingSlotUI: null,

        /**
         * Sets up the entire Inventory UI.
         */
        setupUI: function() {
            $('#war-section').append('<img src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite war32-png' + '"/>');
            $('#wiz-section').append('<img src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite wiz32-png' + '"/>');
            $('#arch-section').append('<img src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite arch32-png' + '"/>');

            // Put some starter text for the description
            $('#item-description').html('<h2>Click a slot to select it.</h2>');

            // For more thorough comments, look at the settings dialog.
            $('#inventory-screen').dialog({
                autoOpen: false,
                width:360,
                height:342,
                resizable:false,

                // Wrap the dialog in a span so that it gets themed correctly.
                appendTo:"#inventoryThemeSpan",
                hide: {
                    effect: 'fade',
                    duration: 400
                },
    
                // Position the inventory screen in the center of the canvas
                position: {
                    my: 'center',
                    at: 'center',
                    of: ('#canvas')
                },
    
            });
        },
        
        /**
         * This should be called whenever a Slot is added to the inventory.
         *
         * That way, the UI can make a new SlotUI to show it.
         * @param {Slot} slot - the slot to add
         */
        addedSlot: function(slot) {
            // This points to the element that we will add the SlotUI to.
            var domSelector;

            // This needs some explanation. When we call setSlider on a div, all
            // of the existing children are wrapped in a .scroll-content class.
            // From then on, you need to add to the .scroll-content, not the
            // original div, otherwise your new items will not be in the scroll
            // area.
            var scrollContentClassSelector = ' > .scroll-content';
            var setScrollable = false;

            // This points to the scrollpane, assuming the div in question was
            // already made into a scrollpane (i.e. on all calls to this
            // function after the first).
            var scrollSelector = null;

            switch(slot.slotType) {
                case game.SlotTypes.EQUIP:
                    domSelector = '#equippable-item-scroll-pane';
                    scrollSelector = domSelector;

                    // If the .scroll-content already exists...
                    if ( $(domSelector + scrollContentClassSelector).length > 0 ) {
                        // Then we add the SlotUI to that.
                        domSelector += scrollContentClassSelector;
                    }
                    break;
                case game.SlotTypes.USABLE:
                    domSelector = '#usable-item-scroll-pane';
                    scrollSelector = domSelector;
                    if ( $(domSelector + scrollContentClassSelector).length > 0 ) {
                        domSelector += scrollContentClassSelector;
                    }
                    break;
                case game.SlotTypes.WAR:
                    domSelector = '#war-section';
                    break;
                case game.SlotTypes.WIZ:
                    domSelector = '#wiz-section';
                    break;
                case game.SlotTypes.ARCH:
                    domSelector = '#arch-section';
                    break;
                default:
                    console.log("Unrecognized slot type: " + slot.slotType);
                    domSelector = 'body';
                    break;
            }

            var newSlotUI = new game.SlotUI(domSelector, slot);
            this.slots.push(newSlotUI);

            if ( scrollSelector != null ) {
                window.ui.setSlider($(scrollSelector));
            }
        },

        /**
         * If slots were added to the inventory UI while it was hidden, then the
         * setSlider code will determine that the scroll content has a height of
         * 0 and will not actually assign a scrollbar.
         *
         * That means you need to call this when the inventory UI is made
         * visible.
         */
        setScrollbars: function() {
            window.ui.setSlider($('#equippable-item-scroll-pane'));
            window.ui.setSlider($('#usable-item-scroll-pane'));
        },

        /**
         * This is called when a slot's item is changed.
         * @param  {Number} slotIndex The index of the Slot/SlotUI that changed.
         * @return {null}
         */
        updatedSlot: function(slotIndex) {
            // This is necessary because Slot sets an item before a corresponding
            // SlotUI even exists, so we need to make sure it's been added.
            if ( slotIndex >= this.slots.length ) return;

            // Update the slot UI
            this.slots[slotIndex].updateItem();

            // Update the description
            this.updateDescription();
        },

        /**
         * Selects a slot. There can only be one selected slot.
         * @param {SlotUI} slotUI The slot to select
         */
        clickedSlot: function(slotUI) {
            if ( this.selectedSlotUI != null ) {
                this.selectedSlotUI.deselectSlot();
            }
            this.selectedSlotUI = slotUI;
            slotUI.selectSlot();
            this.updateDescription();
        },

        revertHighlightOnAllSlots: function() {
            for (var i = 0; i < this.slots.length; i++) {
                this.slots[i].highlight(false, false);
            };
        },
        
        /**
         * @return {SlotUI} the slot that was selected
         */
        getSelectedSlot: function() {
            return this.selectedSlotUI;              
        },

        getSlot: function(slotIndex) {
            return this.slots[slotIndex];
        },
        
        /**
         * Updates the description based on which item is selected.
         * @return {null}
         */
        updateDescription: function() {
            // Make a var here so I don't have to type 'this' all the time
            var selectedSlotUI = this.selectedSlotUI;
            if ( selectedSlotUI == null ) return;

            var slot = selectedSlotUI.slot;
            
            var item = slot.item;
            var desc = '<no description for this> - ' + 'Slot type: ' + slot.slotType + ' Item: ' + item;
            if (item == null) {
                desc = 'You don\'t have an item selected.<br/><br/>Scroll the slots above by dragging.<br/><br/><b>Double-click to add/remove items.</b>';
            } else {
                desc = item.htmlDescription;
            }

            if (slot.isEquipSlot()) {
                $('#item-description').attr('class', 'test1');
            } else if (slot.isUsableSlot()) {
                $('#item-description').attr('class', 'test2');
            }

            $('#item-description').html(desc);
        }
        
    };
}()); 