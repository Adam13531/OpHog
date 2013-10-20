( function() {

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
	     * Gets all the abilities of the ability type that's passed in. This returns 
	     * a new array, so the original abilities can't be modified at all
	     * @param  {game.AbilityType} abilityType - Specifies the type of abilities 
	     * that need to be retrieved
	     * @param  {Array:game.Ability} abilitiesList - List of abilities to search 
	     * through
	     * @return {Array:game.Ability} New list of the abilities that were found. 
	     * They are all the same type as the ability type that was passed in.
	     */
	    getAllAbilitiesOfType: function(abilityType, abilitiesList) {
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