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
         * This is the item that you're using. If this is null, then you're not
         * in USE mode. It is set when you click "Use" so that you can still
         * click other slots and see what they do.
         * @type {Item}
         */
        usingItem: null,

        /**
         * Sets up the entire Inventory UI.
         */
        setupUI: function() {
            $('#war-section').append('<img src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite war32-png' + '"/>');
            $('#wiz-section').append('<img src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite wiz32-png' + '"/>');
            $('#arch-section').append('<img src="'+game.imagePath+'/img_trans.png" class="' + 'char-sprite arch32-png' + '"/>');

            // Put some starter text for the description
            $('#item-description').html('<h2>Click a slot to select it.</h2>');

            this.$useItemButton = $('#useItemButton');
            this.$useItemButton.button();

            // Lower the font size so that the button isn't huge
            $(this.$useItemButton.selector + '> span').css({
                'font-size': '.75em'
            });

            this.$useItemInstructions = $('#useItemInstructions');

            // Position the instructions based on the canvas so that it looks
            // like a banner at the top.
            var $canvas = $('#canvas');
            var canvasPos = $canvas.position();
            var width = $canvas.width() - 100;
            var left = ($canvas.width() - width) / 2;
            this.$useItemInstructions.css({
                position : 'absolute',
                top : (canvasPos.top + 5) + 'px',
                left : (left) + 'px',
                width: (width) + 'px',
                opacity:.85
            });

            this.$useItemButton.button('disable');
            this.$useItemInstructions.hide();

            this.$useItemButton.click(function(inventoryUI) {
                return function() {
                    inventoryUI.enterUseMode();
                }
            }(this));

            this.$useItemInstructions.click(function(inventoryUI) {
                return function() {
                    inventoryUI.exitUseMode();
                }
            }(this));

            // For more thorough comments, look at the settings dialog.
            $('#inventory-screen').dialog({
                // This is just for debugging (FYI: 'true' is for debugging, but
                // I sometimes check in this code with this set to 'false' but
                // with this comment still)
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

                // Fade in very quickly
                show: {
                    effect: 'fade',
                    duration: 150
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
         * Exit USE mode. This will hide the instructions that show up.
         * @return {null}
         */
        exitUseMode: function() {
            $('#useItemInstructions').hide();
            $('#inventory-screen').dialog('open');
            this.usingItem = null;
        },

        /**
         * @return {Boolean} true if the inventory is in USE mode.
         */
        isInUseMode: function() {
            return this.usingItem != null;
        },

        /**
         * Returns true if the unit passed in is a valid target for the item
         * that you're using.
         * @param  {Unit}  unit - the unit to check
         * @return {Boolean}      true if valid, false if invalid or if you're
         * not in USE mode.
         */
        isUnitAUseTarget: function(unit) {
            if (!this.isInUseMode()) return false;

            var useTarget = this.usingItem.useTarget;
            return ( useTarget == game.UseTarget.PLAYER_UNIT && unit.isPlayer ) ||
                ( useTarget == game.UseTarget.PLAYER_AND_ENEMY_UNIT ) ||
                ( useTarget == game.UseTarget.ENEMY_UNIT && !unit.isPlayer );

        },

        // x and y are in pixels and are contained to the bounds of the canvas.
        // Returns true if you actually used an item.
        
        /**
         * Attempts to use an item at the passed-in point, which may represent a
         * unit, a battle, a map tile, or nothing.
         * @param  {Number} x - coordinate, in pixels, bound by canvas size
         * @param  {Number} y - coordinate, in pixels, bound by canvas size
         * @return {Boolean}   true if the item was used
         */
        attemptToUseItem: function(x, y) {
            if ( !this.isInUseMode() ) return false;

            var useTarget = this.usingItem.useTarget;

            // Check to see if you're targeting a unit
            if ( useTarget == game.UseTarget.PLAYER_UNIT || 
                useTarget == game.UseTarget.PLAYER_AND_ENEMY_UNIT 
                || useTarget == game.UseTarget.ENEMY_UNIT ) {

                // Get all units at that point; we want to use the item on the
                // first VALID unit that we find, not just the first unit.
                var collidingUnits = game.UnitManager.getUnitsAtPoint(x, y);
                for (var i = 0; i < collidingUnits.length; i++) {

                    if ( this.isUnitAUseTarget(collidingUnits[i]) ) {
                        this.usingItem.useOnUnit(collidingUnits[i]);

                        // Check to see if we depleted the item
                        if ( this.usingItem.isDepleted() ) {
                            this.removeDepletedItems();
                            this.exitUseMode();
                        } else {
                            // We call this because the item still exists, but
                            // its quantity is lower.
                            this.updateUseInstructions();
                        }

                        // Return true that we used the item.
                        return true;
                    }
                };
            }

            return false;
        },

        /**
         * Remove all depleted items from the inventory. This is always safe to
         * call this since depleted items should never exist.
         *
         * I made this function because 'usingItem' is stored as an item, not a
         * slot, so there's no easy way to know which slot the item is in once
         * you've depleted it, so we just remove all depleted items.
         * @return {null}
         */
        removeDepletedItems: function() {
            for (var i = 0; i < this.slots.length; i++) {
                var slot = this.slots[i].slot;

                if ( slot.isUsableSlot() && !slot.isEmpty() && slot.item.isDepleted() ) {
                    slot.setItem(null);
                }
            };
        },

        /**
         * Update the instructions that appear when you're in USE mode.
         * @return {null}
         */
        updateUseInstructions: function() {
            var item = this.usingItem;
            var quantityString = item.stackable ? ' (' + item.quantity + ')' : '';
            var targetString;

            var useTarget = this.usingItem.useTarget;

            switch(useTarget) {
                case game.UseTarget.PLAYER_UNIT:
                    targetString = 'Tap one of your units';
                    break;
                
                case game.UseTarget.PLAYER_AND_ENEMY_UNIT:
                    targetString = 'Tap any unit';
                    break;
                
                case game.UseTarget.ENEMY_UNIT:
                    targetString = 'Tap an enemy unit';
                    break;

                default:
                    targetString = 'UNDEFINED123';
                    break;
            }

            this.$useItemInstructions.text(targetString + ' to use ' + 
                item.name + quantityString + ' or tap here to cancel');
            this.$useItemInstructions.show();
        },

        /**
         * Enters USE mode. This will hide the inventory screen.
         * @return {null}
         */
        enterUseMode: function() {
            if ( this.selectedSlotUI == null || this.selectedSlotUI.isEmpty() ) {
                return;
            }

            var item = this.selectedSlotUI.slot.item;
            this.usingItem = item;

            this.updateUseInstructions();

            $('#inventory-screen').dialog('close');
            // Leaving these here in case we want them later...
            // $('#inventory-screen').dialog('option', 'hide').duration = 100;
            // $('#inventoryThemeSpan').css({
            //     opacity: '.5' // note: opacity starts at .95
            // });
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

            // If we selected a usable item, enable the 'Use' button.
            if ( item != null && slot.isUsableSlot() ) {
                this.$useItemButton.button('enable');
            } else {
                this.$useItemButton.button('disable');
            }
        }
        
    };
}()); 