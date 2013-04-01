( function() {

    window.game.EquippableBy = {
        NONE: 0,
        WAR: 1,
        WIZ: 2,
        ARCH: 4,
        ALL: 7
    };

    /**
     * Required properties:
     * id, itemLevel, htmlDescription, [usable|equippableBy], cssClass
     *
     * Optional properties:
     * stackable (if this is provided, then startingQuantity can also be provided, otherwise the default is 1)
     * @type {Object}
     */
    window.game.ItemType = {
        GEM: {
            id: 0,
            itemLevel:1,
            htmlDescription:'The Gem of All Knowledge<br/><font color="#a3a3cc"><b>Gives the user the keen insight to tackle everyday life in the ghetto.<b/></font>',
            usable:true,
            stackable:true,
            startingQuantity:3,
            cssClass:'item-sprite gem32-png'
        },
        SHIELD: {
            id: 1,
            itemLevel:1,
            htmlDescription:'Grugtham\'s shield<br/><font color="#660000"><b>500000 Dragon Kill Points<b/></font>',
            equippableBy: game.EquippableBy.ALL,
            cssClass:'item-sprite shield32-png'
        },
        SWORD: {
            id: 2,
            itemLevel:1,
            htmlDescription:'Skull Stab<br/><font color="#660000"><b>It is said that this sword can actually only pierce hearts.<b/></font>',
            equippableBy: game.EquippableBy.WAR | game.EquippableBy.ARCH,
            cssClass:'item-sprite sword32-png'
        },
    };

    window.game.GetItemDataFromID = function(itemID) {
        for ( var key in game.ItemType ) {
            var item = game.ItemType[key];
            if ( item.id == itemID ) {
                return item;
            }
        }

        return null;
    };


    /**
     * Items can't be both stackable and equippable.
     *
     * If an item is not in a slot, then there's no reference to it.
     */
    window.game.Item = function Item(itemID) {
        var itemData = game.GetItemDataFromID(itemID);

        this.usable = false;
        this.stackable = false;
        this.equippableBy = game.EquippableBy.NONE;

        if ( itemData.usable ) {
            this.usable = true;

            if ( itemData.stackable ) {
                this.quantity = (itemData.startingQuantity) ? itemData.startingQuantity : 1;
            }
        } else {
            this.equippableBy = itemData.equippableBy;
        }

        this.cssClass = itemData.cssClass;
        this.htmlDescription = itemData.htmlDescription;
    };


    window.game.Item.prototype.isEquippableBy = function(equippableBy) {
        return !this.usable && (this.equippableBy & equippableBy) != 0;
    };


}());
