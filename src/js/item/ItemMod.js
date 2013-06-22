( function() {

    /**
     * Types of item mods.
     */
    window.game.ItemModType = {
        LIFE_LEECH: 'life leech'
    };
  
    /**
     * ItemMod base-class constructor.
     * @param {game.ItemModType} type - the type of the mod
     */
    window.game.ItemMod = function ItemMod(type) {
        this.type = type;
    };

    /**
     * This is called when you deal damage.
     * @param  {Unit} attacker    - the unit who attacked
     * @param  {Unit} target      - the target that was attacked
     * @param  {Number} damageDealt - the damage dealt. This can't exceed
     * whatever the target's life was before it was hit, so if the target has 40
     * life and you hit it for 100, this function will only be passed 40.
     * @return {undefined}
     */
    window.game.ItemMod.prototype.onAttack = function(attacker, target, damageDealt) {};

    /**
     * @return {ItemMod} a copy of this mod
     */
    window.game.ItemMod.prototype.copy = function() {
        console.log('copy - unimplemented for: ' + this.type);
        return null;
    };

    /**
     * @return {String} a description of this mod
     */
    window.game.ItemMod.prototype.getDescription = function() {
        console.log('getDescription - unimplemented for: ' + this.type);
        return 'Unrecognized ItemMod type: ' + this.type;
    };

}());