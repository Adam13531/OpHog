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
        BOSS: 16,

        // Note: there is no corresponding HAS_FULL_LIFE flag because we don't
        // foresee using it often, so any ability that does NOT specify
        // IS_MISSING_LIFE as a flag can target units regardless of their life.
        // Units that DO specify this flag can ONLY work on units who are not at
        // maximum (which means they could be at 0 life, so don't forget to
        // specify ALIVE if you don't want that).
        IS_MISSING_LIFE: 32
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
     * Abilities for the units
     * Required properties:
     * id: Number - Unique identifier for the ability.
     * graphicIndex: Number - Index of the graphic that will be shown when this 
     *                        ability is used
     * type: game.AbilityType - Type of ability it is
     * allowedTargets: game.RandomUnitFlags - Valid targets of the ability
     * actionOnHit: game.ActionOnHit - Instructions on what to do if a target gets
     *                                 hit by this ability
     * damageformula: game.DamageFormula - Instructions on how to calculate damage 
     *                                     or heal amounts that will be done 
     * Optional properties:
     * relativeWeight: Number - Used to calculate the probability of using the ability
     * particleSystemOptions: Object - see ParticleSystem.js for full details.
     * 
     * @type {Object}
     */
    window.game.Ability = {
        ATTACK: {
            id: 0,
            graphicIndex: game.Graphic.HORIZONTAL_NEEDLE,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        SKULL_THROW: {
            id: 1,
            graphicIndex: game.Graphic.HORIZONTAL_NEEDLE,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        SPIT_WEB: {
            id: 2,
            graphicIndex: game.Graphic.HORIZONTAL_NEEDLE,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        SCORPION_STING: {
            id: 3,
            graphicIndex: game.Graphic.HORIZONTAL_NEEDLE,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        SNAKE_VENOM: {
            id: 4,
            graphicIndex: game.Graphic.HORIZONTAL_NEEDLE,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        BRANCH_WHIP: {
            id: 5,
            graphicIndex: game.Graphic.HORIZONTAL_NEEDLE,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        BOULDER_DROP: {
            id: 6,
            graphicIndex: game.Graphic.SMALL_PURPLE_BUBBLE,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF,
            particleSystemOptions: 
            {
                particleGradients: [game.PURPLE_GRADIENT]
            }
        },

        FLAME_THROWER: {
            id: 7,
            graphicIndex: game.Graphic.HORIZONTAL_NEEDLE,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        THROWING_KNIVES: {
            id: 8,
            graphicIndex: game.Graphic.HORIZONTAL_NEEDLE,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        FIREBALL: {
            id: 9,
            graphicIndex: game.Graphic.HORIZONTAL_NEEDLE,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        BEARD_THROW: {
            id: 10,
            graphicIndex: game.Graphic.HORIZONTAL_NEEDLE,
            type: game.AbilityType.ATTACK,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        REVIVE: {
            id: 11,
            graphicIndex: game.Graphic.SMALL_YELLOW_STAR,
            type: game.AbilityType.REVIVE,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.ALLY | game.RandomUnitFlags.DEAD,
            actionOnHit: game.ActionOnHit.REVIVE,
            damageFormula: game.DamageFormula.REVIVE
        },

        SUMMON: {
            id: 12,
            graphicIndex: 1, // Blank graphic. Summon is special-cased to not have a projectile anyway.
            type: game.AbilityType.SUMMON,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.FOE | game.RandomUnitFlags.ALIVE,
            actionOnHit: game.ActionOnHit.DO_DAMAGE,
            damageFormula: game.DamageFormula.ATK_MINUS_DEF
        },

        HEAL: {
            id: 13,
            type: game.AbilityType.HEAL,
            graphicIndex: game.Graphic.MEDIUM_BLUE_CIRCLE,
            relativeWeight: 1000,
            allowedTargets: game.RandomUnitFlags.ALLY | game.RandomUnitFlags.ALIVE | game.RandomUnitFlags.IS_MISSING_LIFE,
            actionOnHit: game.ActionOnHit.HEAL,
            damageFormula: game.DamageFormula.GET_HALF_OF_MISSING_LIFE
        }

    };

    /**
     * This function ensures certain aspects of the abilities that were just
     * defined, e.g. that you didn't duplicate IDs. It is called immediately
     * after it is defined (it's an IIFE).
     */
    ( function verifyAllAbilityData() {
        // These are ability IDs that we've already encountered. We use this to
        // see if we've defined duplicates.
        var abilityIDs = [];

        // This function is only used for this IIFE, so I'll keep it in a
        // variable here.
        var displayUndefinedAbilityError = function(ability, undefinedAttribute) {
            if ( ability[undefinedAttribute] === undefined ) {
                console.log('ERROR: Ability "' + ability.name  + '" has "' + undefinedAttribute + '" undefined.');
            }
        };

        // These MUST be present in each ability.
        var necessaryProperties = ['type', 'graphicIndex', 'allowedTargets', 'actionOnHit', 'damageFormula'];

        for ( var key in game.Ability ) {
            var ability = game.Ability[key];
            var id = ability.id;

            // ID is necessary
            if ( id === undefined ) {
                game.util.debugDisplayText('Fatal error: there is an ability missing an ID!', 'abil id missing');
            }

            // Names aren't necessary or even expected, but we'll give them
            // names based on the key's name so that it's easier to debug
            // ability logic.
            if ( ability.name === undefined ) {
                if ( key.length > 1 ) {
                    // ATTACK --> Attack
                    game.Ability[key].name = key[0] + key.substring(1).toLowerCase();
                } else {
                    game.Ability[key].name = key;
                }
            }

            // Make sure they have all of the necessary properties.
            for (var i = 0; i < necessaryProperties.length; i++) {
                displayUndefinedAbilityError(ability, necessaryProperties[i]);
            };

            if ( abilityIDs.indexOf(id) != -1 ) {
                // Get the first ability with that ID
                console.log('Fatal error! You duplicated ability id #' + id);
                game.util.debugDisplayText('Check console log - duplicate ability ID detected.', 'abil dupe');
            }

            abilityIDs.push(id);
        }
    }());

	/**
	 * Ability manager. Basically, this object contains a lot of utility functions 
	 * for abilities.
	 * @type {Object}
	 */
	window.game.AbilityManager = {

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

                game.util.copyPropsIfUndefined(abilityData, abilitiesList[i]);
                game.util.useDefaultIfUndefined(abilitiesList[i], 'relativeWeight', 1000);
	            game.util.useDefaultIfUndefined(abilitiesList[i], 'particleSystemOptions', {});
	        }
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
            var ability = game.util.getItemInContainerByProperty(game.Ability, 'id', abilityID);
            if ( ability !== null ) return ability;

            console.log('Error - ' + abilityID + ' is not a valid ability ID.');
            if ( typeof(abilityID) !== 'number' ) {
                // If you hit this, it's likely that you passed in the entire
                // abilityData instead of just the ID.
                console.log('The above error happened because abilityID isn\'t even a number.');
            }

	        return null;
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
	     * Removes all abilities of the ability type that's passed in. This will 
	     * modify the contents of the list that's passed in.
	     * @param  {game.AbilityType} abilityType - Specifies the type of abilities 
	     * that need to be removed from the list.
	     * @param  {Array:game.Ability} abilitiesList - List of the abilities to 
	     * remove the abilities from
	     */
	    removeAbilitiesOfType: function(abilityType, abilitiesList) {
            for (var i = 0; i < abilitiesList.length; i++) {
                if ( abilitiesList[i].type == abilityType ) {
                    abilitiesList.splice(i, 1);
                    i--;
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
	};
}());