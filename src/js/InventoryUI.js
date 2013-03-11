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

        /**
         * Sets up the entire Inventory UI.
         */
        setupUI: function() {
            var $canvas = $('#canvas');
            var width = $canvas.width();
            var canvasPos = $canvas.position();
            // canvasPos.top -= 100;
            // canvasPos.left -= 400;

            // Position where the equippable items go
            $('#equippable-item-scroll-pane').css({
                position : 'absolute',
                top : (canvasPos.top + 350) + 'px',
                left : (canvasPos.left + width + 175) + 'px'
            });

            // Base the location of the usable items on the equippable ones
            var equipPanePos = $('#equippable-item-scroll-pane').position();
            var equipPaneWidth = $('#equippable-item-scroll-pane').width();
            var equipPaneHeight = $('#equippable-item-scroll-pane').height();
            $('#usable-item-scroll-pane').css({
                position : 'absolute',
                top : (equipPanePos.top) + 'px',
                left : (equipPanePos.left + equipPaneWidth + 5) + 'px'
            });
            $('#item-description').css({
                position : 'absolute',
                top : (equipPanePos.top + equipPaneHeight + 5) + 'px',
                left : (canvasPos.left + width + 5) + 'px'
            });

            // The warrior's section
            $('#war-section').append('<img src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite war32-png' + '"/>');
            $('#war-section').css({
               position: 'absolute',
               top: (equipPanePos.top) + 'px',
               left: (canvasPos.left + width + 5) + 'px'
            });
            
            // The wizard's section comes next
            var warPos = $('#war-section').position();
            var warHeight = $('#war-section').height();
            $('#wiz-section').append('<img src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite wiz32-png' + '"/>');
            $('#wiz-section').css({
               position: 'absolute',
               top: (warPos.top + warHeight + 5) + 'px',
               left: (warPos.left) + 'px'
            });
            
            var wizPos = $('#wiz-section').position();
            var wizHeight = $('#wiz-section').height();
            $('#arch-section').append('<img src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite arch32-png' + '"/>');
            $('#arch-section').css({
               position: 'absolute',
               top: (wizPos.top + wizHeight + 5) + 'px',
               left: (wizPos.left) + 'px'
            });

            // Put some starter text for the description
            $('#item-description').html('<h1>Click here to close the whole screen.</h1>');
            $('#item-description').click(function() {
                if (game.InventoryUI.getSelectedSlot() == null )
                {
                    $('#inventory-screen').hide();
                }
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
        setSelectedSlot: function(slotUI) {
            if (this.selectedSlotUI != null && this.selectedSlotUI.slotIndex != slotUI.slotIndex) {
                this.selectedSlotUI.deselectSlot();
            }

            // Select only the current one
            this.selectedSlotUI = slotUI;

            slotUI.$bgImage.attr('src', game.imagePath + '/slot2.png');
            this.updateDescription();
        },
        
        /**
         * @return {SlotUI} the slot that was selected
         */
        getSelectedSlot: function() {
            return this.selectedSlotUI;              
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
            
            var item = slot.itemIndex;
            var desc = '<no description for this> - ' + 'Slot type: ' + slot.slotType + ' Item index: ' + slot.itemIndex;
            if (item == null) {
                desc = 'You don\'t have an item selected.<br/><br/>Scroll the slots above by dragging.<br/><br/><b>Double-click to add/remove items.</b>';
                if (slot.isUsableSlot()) {
                    $('#item-description').attr('class', 'test2');
                }
                if (slot.isEquipSlot()) {
                    $('#item-description').attr('class', 'test1');
                }
            } else if (item == 0) {
                desc = 'The Gem of All Knowledge<br/><font color="#a3a3cc"><b>Gives the user the keen insight to tackle everyday life in the ghetto.<b/></font>';
                $('#item-description').attr('class', 'test2');
            } else if (item == 1) {
                desc = 'Grugtham\'s shield<br/><font color="#660000"><b>500000 Dragon Kill Points<b/></font>';
                $('#item-description').attr('class', 'test1');
            }

            $('#item-description').html(desc);
        }
        
    };
}()); 