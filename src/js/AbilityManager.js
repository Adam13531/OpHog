( function() {

    /**
     * When obtaining a random unit, you pass a combination of these flags.
     *
     * For example, if you only want living ally units, pass
     * RandomUnitFlags.ALLY | RandomUnitFlags.ALIVE.
     */
    window.game.RandomUnitFlags = {
        ALLY: 1,
        FOE: 2,
        ALIVE: 4,
        DEAD: 8,
        BOSS: 16
    };

    /**
     * Describes how the unit is going to use its abilities
     * @type {Object}
     */
    window.game.AbilityAI = {
        USE_ABILITY_0_WHENEVER_POSSIBLE: 'use ability 0 whenever possible',
        RANDOM: 'random',
        USE_REVIVE_IF_POSSIBLE: 'use revive if possible',
        USE_HEAL_IF_POSSIBLE: 'use heal if possible'
    };

    /**
     * Instructions on what to do when a unit gets hit
     * @type {Object}
     */
    window.game.ActionOnHit = {
        DO_DAMAGE: 'do damage',
        HEAL: 'heal',
        REVIVE: 'revive'
    };

    /**
     * Instructions on how to calculate damage or heal amounts that will be done 
     * to a target
     * @type {Object}
     */
    window.game.DamageFormula = {
        ATK_MINUS_DEF: 'atk minus def',
        REVIVE: 'revive',
        GET_HALF_OF_MISSING_LIFE: 'get half of missing life'
    };

    /**
     * Types of abilities
     * @type {Object}
     */
    window.game.AbilityType = {
        ATTACK: 'attack',
        HEAL: 'heal',
        REVIVE: 'revive',
        BUFF: 'buff',
        DEBUFF: 'debuff',
        SUMMON: 'summon'
    };

    /**
     * This is intended to have the following specialized use. It must contain the sum of all 
     * the relative weights for the ability type that it holds.
     * @param {game.AbilityType} type - Type of Ability
     * @param {Number} relativeWeight - This is the sum of ALL the
     * abilities that are of "type" (The other property).
     */
    window.game.UsableAbilityType = function UsableAbilityType(type, relativeWeight) {
        this.type = type;
        this.relativeWeight = relativeWeight;
    };

    /**
     * Abilities for the units
     * @type {Object} //TODO: Fill this out and don't for got to mention that replacesAbility doesn't need to be specified and will default to false
     */
    window.game.Ability = {
        ATTACK: {
            id: 0,
            graphicIndex: 43,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
            // chanceToCrit: .1,
        },

        SKULL_THROW: {
            id: 1,
            graphicIndex: 43,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        SPIT_WEB: {
            id: 2,
            graphicIndex: 43,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        SCORPION_STING: {
            id: 3,
            graphicIndex: 43,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        SNAKE_VENOM: {
            id: 4,
            graphicIndex: 43,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        BRANCH_WHIP: {
            id: 5,
            graphicIndex: 43,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        BOULDER_DROP: {
            id: 6,
            graphicIndex: 46,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        FLAME_THROWER: {
            id: 7,
            graphicIndex: 43,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        THROWING_KNIVES: {
            id: 8,
            graphicIndex: 44,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        FIREBALL: {
            id: 9,
            graphicIndex: 43,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        BEARD_THROW: {
            id: 10,
            graphicIndex: 43,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        REVIVE: {
            id: 11,
            graphicIndex: 108,
            type: game.AbilityType.REVIVE,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.ALLY | game.RandomUnitFlags.DEAD,
            actionOnHit: game.ActionOnHit.REVIVE,
            damageFormula: game.DamageFormula.REVIVE
        },

        SUMMON: {
            id: 12,
            graphicIndex: 1, // Blank graphic
            type: game.AbilityType.SUMMON,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        HEAL: {
            id: 13,
            type: game.AbilityType.HEAL,
            graphicIndex: 70,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.ALLY | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.HEAL,
            damageFormula: game.DamageFormula.GET_HALF_OF_MISSING_LIFE
        }

    };

	/**
	 * Ability manager. Basically, this object contains a lot of utility functions 
	 * for abilities.
	 * @type {Object}
	 */
	window.game.AbilityManager = {

		/**
	     * Displays an error if a necessary ability attribute was never defined. 
	     * These are programmer errors, which means we need to go add this attribute 
	     * to ability.
	     * @param {game.Ability} ability - Ability with the undefined attribute
	     * @param {String} undefinedAttribute - Name of the undefined attribute
	     */
	    displayUndefinedAbilityError: function(ability, undefinedAttribute) {
	        if ( ability[undefinedAttribute] === undefined ) {
	            console.log('ERROR: Ability with id: ' + ability.id  + ' has ' + undefinedAttribute + ' undefined.');
	        }
	    },

	    /**
	     * Fills in all the missing attributes for each ability. For example, if
	     * all we did was specify that we want an ability by giving it an ID, then
	     * this will fill in the default projectile graphic index, etc for that
	     * ability
	     * @param {Array:game.Ability} abilitiesList List of abilities to check
	     */
	    setDefaultAbilityAttrIfUndefined: function(abilitiesList) {
	        for ( var i = 0; i < abilitiesList.length; i++ ) {
	            var unitAbility = abilitiesList[i];
	            var abilityData = this.getAbilityDataFromID(unitAbility.id);
	            this.displayUndefinedAbilityError(abilityData, 'type');
	            this.displayUndefinedAbilityError(abilityData, 'allowedTargets');
	            this.displayUndefinedAbilityError(abilityData, 'actionOnHit');
	            this.displayUndefinedAbilityError(abilityData, 'damageFormula');

	            game.util.useDefaultIfUndefined(abilitiesList[i], 'type', abilityData.type);
	            game.util.useDefaultIfUndefined(abilitiesList[i], 'graphicIndex', abilityData.graphicIndex);
	            game.util.useDefaultIfUndefined(abilitiesList[i], 'relativeWeight', abilityData.relativeWeight);
	            game.util.useDefaultIfUndefined(abilitiesList[i], 'allowedTargets', abilityData.allowedTargets);
	            game.util.useDefaultIfUndefined(abilitiesList[i], 'actionOnHit', abilityData.actionOnHit);
	            game.util.useDefaultIfUndefined(abilitiesList[i], 'damageFormula', abilityData.damageFormula);
	        }
	    },

	    /**
	     * Gets the ability from the id that is passed in as a parameter
	     * @param  {Number} abilityID - ID of the ability to get. An example is 
	     * game.Ability.ATTACK.id.
	     * @param  {Array:Ability} abilityList - Ability list to search through
	     * @return {game.Ability} - Ability that was found
	     */
		getAbility: function(abilityID, abilityList) {
	        var abilityData = null;
	        for ( var i = 0; i < abilityList.length; i++ ) {
	            if ( abilityList[i].id == abilityID ) {
	                abilityData = abilityList[i];
	            }
	        }

	        if ( abilityData == null ) {
	            console.log('Error - Unit with type: ' + this.unitType + ' doesn\'t contain an ability with ID: ' + abilityID + '.');
	            if ( typeof(abilityID) !== 'number' ) {
	                // If you hit this, it's likely that you passed in the entire
	                // abilityData instead of just the ID.
	                console.log('The above error happened because abilityID isn\'t even a number.');
	            }
	        }
	        return abilityData;
	    },

	    /**
	     * Makes a copy of an ability.
	     * @param {game.Ability} originalAbility - ability that will be copied
	     * @return {game.Ability} New copy of the ability
	     */
	    copyAbility: function(originalAbility) {
	        var newAbility = {};

	        // If you ever have any non-primitive data (e.g. an array), then you
	        // need to manually copy that over. In that case, make sure to specify
	        // the name in 'propsToIgnore' in copyProps.
	        game.util.copyProps(originalAbility, newAbility);
	        return newAbility;
	    },

	    /**
	     * Makes an exact copy of the ability list that's passed in
	     * @param  {Array:Ability} abilitiesList - List of abilities to make a 
	     * copy of
	     * @return {Array:Abilitytype} Copy of the ability list that was passed 
	     * in
	     */
	    copyAbilitiesList: function(abilitiesList) {
	        var newAbilitiesList = [];
	        for (var i = 0; i < abilitiesList.length; i++) {
	            var newAbility = this.copyAbility(abilitiesList[i]);
	            newAbilitiesList.push(newAbility);
	        };
	        return newAbilitiesList;
    	},

    	/**
	     * Gets the default ability template based on an ID that was passed in
	     * @param {game.Ability.id} abilityID - ID of the ability to get the data for
	     * @return {game.Ability} Default ability template for the ID that was passed in.
	     */
	    getAbilityDataFromID: function(abilityID) {
	        var abilityData = null;
	        for ( var key in game.Ability ) {
	            var abilityDataTemplate = game.Ability[key];
	            if ( abilityDataTemplate.id == abilityID ) {
	                abilityData = abilityDataTemplate;
	            }
	        }
	        if ( abilityData == null ) {
	            console.log('Error - ' + abilityID + ' is not a valid ability ID.');
	            if ( typeof(abilityID) !== 'number' ) {
	                // If you hit this, it's likely that you passed in the entire
	                // abilityData instead of just the ID.
	                console.log('The above error happened because abilityID isn\'t even a number.');
	            }
	        }
	        return abilityData;
	    },

	    /**
	     * Checks to see if the ability list contains the passed in ability ID. If 
	     * it does, that means this ability exists inside the ability list that is 
	     * passed in.
	     * @param {game.Ability.id} abilityID - ID of the ability to look for
	     * @param {Array:game.Ability} abilityList - Ability list to search through
	     * @return {Number} Index in the ability list where the ability is or returns 
	     * -1 if the ability doesn't exist in the ability list
	     */
	    hasAbility: function(abilityID, abilityList) {
	        for (var i = 0; i < abilityList.length; i++) {
	            if ( abilityList[i].id == abilityID ) {
	                return i;
	            }
	        };
	        return -1;
	    },

        /**
         * Returns true if the usable ability type list contains the ability type
         * @param  {game.AbilityType}  abilityType - Ability type to search for
         * @param  {Array:game.UsableAbilityType}  usableAbilityTypeList List of 
         * usable ability types to look through
         * @return {Boolean} Returns true if the list contains the ability type 
         * that was passed in
         */
        hasAbilityType: function(abilityType, usableAbilityTypeList) {
            for (var i = 0; i < usableAbilityTypeList.length; i++) {
                if ( usableAbilityTypeList[i].type == abilityType ) {
                    return true;
                }
            };
            return false;
        },

	    /**
	     * Removes all abilities of the ability type that's passed in. This will 
	     * modify the contents of the list that's passed in.
	     * @param  {game.AbilityType} abilityType - Specifies the type of abilities 
	     * that need to be removed from the list.
	     * @param  {Array:game.Ability} abilitiesList - List of the abilities to 
	     * remove the abilities from
	     */
	    removeAbilitiesOfType: function(abilityType, abilitiesList) {
	        for (var i = abilitiesList.length - 1; i >= 0; i--) {
	            if ( abilitiesList[i].type == abilityType ) {
	                abilitiesList.splice(i, 1);
	            }
	        };
	    },

        /**
         * Removes a specified ability type from the list
         * @param  {game.AbilityType} abilityType - Ability type to remove
         * @param  {Array:game.AbilityType} abilityTypeList List of ability types
         */
        removeAbilityType: function(abilityType, abilityTypeList) {
            for (var i = 0; i < abilityTypeList.length; i++) {
                if ( abilityTypeList[i] == abilityType ) {
                    abilityTypeList.splice(i, 1);
                    break;
                }
            };
        },

	    /**
	     * Gets all the abilities of the ability type that's passed in. This returns 
	     * a new array, so the original abilities can't be modified at all
	     * @param  {game.AbilityType} abilityType - Specifies the type of abilities 
	     * that need to be retrieved
	     * @param  {Array:game.Ability} abilitiesList - List of abilities to search 
	     * through
	     * @return {Array:game.Ability} New list of the abilities that were found. 
	     * They are all the same type as the ability type that was passed in.
	     */
	    getAbilitiesOfType: function(abilityType, abilitiesList) {
	        var newAbilitiesList = [];

	        for (var i = 0; i < abilitiesList.length; i++) {
	            if ( abilitiesList[i].type == abilityType) {
	                ability = this.copyAbility(abilitiesList[i]);
	                newAbilitiesList.push(ability);
	            }
	        };
	        return newAbilitiesList;
	    },

        /**
         * Returns the usable ability type from the list that is the same type
         * as the one that's passed in.
         * @param  {game.AbilityType} abilityType - type of ability to look for
         * @param  {Array:game.UsableAbilityType} usableAbilityTypeList - List of usable
         * ability types to search through
         * @return {game.UsableAbilityType} Usable ability type that was found.
         * Will return null if a usable ability type isn't found
         */ 
        getAbilityType: function(abilityType, usableAbilityTypeList) {
            for (var i = 0; i < usableAbilityTypeList.length; i++) {
                if ( usableAbilityTypeList[i].type == abilityType ) {
                    return usableAbilityTypeList[i];
                }
            };
            return null;
        },

        /**
         * Gets all ability types
         * @return {Array:game.AbilityType} List of all the ability types
         */
        getAbilityTypes: function() {
            var abilityTypeList = [];
            for (var abilityType in game.AbilityType) {
                abilityTypeList.push(game.AbilityType[abilityType]);
            }
            return abilityTypeList;
        },
	};
}());