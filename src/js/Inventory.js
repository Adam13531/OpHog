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
         * Sets up the entire Inventory UI.
         */
        setupUI: function() {
            // Add slots to the inventory
            for (var i = 0; i < 32; i++) {
                this.addSlot(new game.Slot('#equippable-item-scroll-pane', window.game.SlotTypes.EQUIP, this.slots.length));
            };
            for (var i = 0; i < 32; i++) {
                this.addSlot(new game.Slot('#usable-item-scroll-pane', window.game.SlotTypes.USABLE, this.slots.length));
            };

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
            
            // Add slots for each character class
            for (var i = 0; i < 2; i++) {
                this.addSlot(new game.Slot('#war-section', window.game.SlotTypes.WAR, this.slots.length));
            };
            for (var i = 0; i < 2; i++) {
                this.addSlot(new game.Slot('#wiz-section', window.game.SlotTypes.WIZ, this.slots.length));
            };
            for (var i = 0; i < 2; i++) {
                this.addSlot(new game.Slot('#arch-section', window.game.SlotTypes.ARCH, this.slots.length));
            };

            // Make the items scrollable
            window.ui.setSlider($('#equippable-item-scroll-pane'));
            window.ui.setSlider($('#usable-item-scroll-pane'));

            // Put some starter text for the description
            $('#item-description').html('<h1>Click here to close the whole screen.</h1>');
            $('#item-description').click(function() {
                if (window.this.getSelectedSlot() == null )
                {
                    $('#inventory-screen').hide();
                }
            });
        },
        
        /**
         * Adds a slot to your inventory
         * @param {Slot} slot - the slot to add
         */
        addSlot: function(slot) {
            this.slots.push(slot);
        },
        
        /**
         * Selects a slot. There can only be one selected slot.
         * @param {Slot} slot The slot to select
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