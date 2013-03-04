( function() {

    // There's only one inventory, so we'll define everything in a single
    // object.
    window.game.Inventory = {
        
        /**
         * Array of Slot objects.
         * @type {Array}
         */
        slots: new Array(),
        
        /**
         * The currently selected slot.
         * @type {Slot}
         */
        selectedSlot: null,
        
        /**
         * Adds a slot to your inventory
         * @param {Slot} slot - the slot to add
         */
        addSlot: function(slot) {
            this.slots.push(slot);
        },
        
        /**
         * Selects a slot. There can only be one selected slot.
         * @param {[type]} slot [description]
         */
        setSelectedSlot: function(slot) {
            if (this.selectedSlot != null && this.selectedSlot.slotIndex != slot.slotIndex) {
                this.selectedSlot.deselectSlot();
            }

            // Select only the current one
            this.selectedSlot = slot;

            slot.$bgImage.attr('src', game.imagePath + '/slot2.png');
            this.updateDescription();
        },
        
        /**
         * @return {Slot} the slot that was selected
         */
        getSelectedSlot: function() {
            return this.selectedSlot;              
        },
        
        /**
         * Updates the description based on which item is selected.
         * @return {null}
         */
        updateDescription: function() {
            // Make a var here so I don't have to type 'this' all the time
            var selectedSlot = this.selectedSlot;
            if ( selectedSlot == null ) return;
            
            var item = selectedSlot.itemIndex;
            var desc = '<no description for this> - ' + 'Slot type: ' + selectedSlot.slotType + ' Item index: ' + selectedSlot.itemIndex;
            if (item == null) {
                desc = 'You don\'t have an item selected.<br/><br/>Scroll the slots above by dragging.<br/><br/><b>Double-click to add/remove items.</b>';
                if (selectedSlot.isUsableSlot()) {
                    $('#item-description').attr('class', 'test2');
                }
                if (selectedSlot.isEquipSlot()) {
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