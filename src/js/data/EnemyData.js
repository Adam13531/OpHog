( function() {

    // Enemy IDs are hard-coded instead of doing something like "id:
    // getNextAvailableID()" so that they don't change based on location in the
    // code, and also so that they don't change across game versions.
    // 
    // Required properties:
    //  id - Number - the enemy's ID
    //  width - Number - the width, in tiles, of the enemy
    //  height - Number - the height, in tiles, of the enemy
    //  name - String - the name of the enemy
    //  graphicIndexes - Array:Number - see Unit
    //  chanceToDropItem - Number - the chance to drop any item
    //  atk - Object containing the below:
    //      start - Number - the starting value for this stat
    //      minGrowth - Number - when this unit levels, this is the minimum value that will be added to the stat
    //      maxGrowth - Number - when this unit levels, this is the maximum value that will be added to the stat
    //  def - see atk
    //  life - see atk
    //  itemsDropped - Array:Object. The Object contains the following:
    //      id - Number - the ID of the item that can be dropped
    //      relativeWeight - Number - the relative weight of the item
    window.game.EnemyType = {
        ORC: {
            id: 0,
            width: 1,
            height: 1,
            name:'Orc',
            graphicIndexes:[138],
            chanceToDropItem: .1,

            atk: {
                start: 10,
                minGrowth: 1,
                maxGrowth: 1
            },
            def: {
                start: 10,
                minGrowth: 1,
                maxGrowth: 1
            },
            life: {
                start: 50,
                minGrowth: 5,
                maxGrowth: 10
            },
            
            itemsDropped: [
                {id: game.ItemType.STAT_GEM.id, relativeWeight: 1},
                {id: game.ItemType.SHIELD.id, relativeWeight: 1},
            ]
        },

        SPIDER: {
            id: 1,
            width: 1,
            height: 1,
            name:'Spider',
            graphicIndexes:[200],
            chanceToDropItem: .1,

            atk: {
                start: 10,
                minGrowth: 1,
                maxGrowth: 1
            },
            def: {
                start: 10,
                minGrowth: 1,
                maxGrowth: 1
            },
            life: {
                start: 50,
                minGrowth: 5,
                maxGrowth: 10
            },
            
            itemsDropped: [
                {id: game.ItemType.STAT_GEM.id, relativeWeight: 1},
                {id: game.ItemType.SHIELD.id, relativeWeight: 1},
            ]
        },

        SCORPION: {
            id: 2,
            width: 1,
            height: 1,
            name:'Scorpion',
            graphicIndexes:[198],
            chanceToDropItem: .1,

            atk: {
                start: 10,
                minGrowth: 1,
                maxGrowth: 1
            },
            def: {
                start: 10,
                minGrowth: 1,
                maxGrowth: 1
            },
            life: {
                start: 50,
                minGrowth: 5,
                maxGrowth: 10
            },
            
            itemsDropped: [
                {id: game.ItemType.STAT_GEM.id, relativeWeight: 1},
                {id: game.ItemType.SHIELD.id, relativeWeight: 1},
            ]
        },

        SNAKE: {
            id: 3,
            width: 1,
            height: 1,
            name:'Snake',
            graphicIndexes:[196],
            chanceToDropItem: .1,

            atk: {
                start: 10,
                minGrowth: 1,
                maxGrowth: 1
            },
            def: {
                start: 10,
                minGrowth: 1,
                maxGrowth: 1
            },
            life: {
                start: 50,
                minGrowth: 5,
                maxGrowth: 10
            },
            
            itemsDropped: [
                {id: game.ItemType.STAT_GEM.id, relativeWeight: 1},
                {id: game.ItemType.SHIELD.id, relativeWeight: 1},
            ]
        }
    };

    /**
     * Gets enemy data based on the ID passed in. 'level' is used to level up
     * the enemy a certain number of times before returning the data.
     *
     * Final stats get stored in finalAtk, finalDef, and finalLife.
     * @param {Number} enemyID - the ID of the enemy
     * @param {Number} level   - the level to produce the enemy at
     */
    window.game.GetEnemyDataFromID = function(enemyID, level) {
        var enemyData = null;
        for ( var key in game.EnemyType ) {
            var enemyDataTemplate = game.EnemyType[key];
            if ( enemyDataTemplate.id == enemyID ) {
                enemyData = enemyDataTemplate;

                // Store in different variables in case the caller still wants
                // to know the starting value or growth amounts.
                enemyData.finalAtk = enemyData.atk.start;
                enemyData.finalDef = enemyData.def.start;
                enemyData.finalLife = enemyData.life.start;

                // Level up the enemy as many times as needed
                for (var i = 0; i < level - 1; i++) {
                    enemyData.finalAtk += game.util.randomInteger(enemyData.atk.minGrowth, enemyData.atk.maxGrowth);
                    enemyData.finalDef += game.util.randomInteger(enemyData.def.minGrowth, enemyData.def.maxGrowth);
                    enemyData.finalLife += game.util.randomInteger(enemyData.life.minGrowth, enemyData.life.maxGrowth);
                };

                enemyData.level = level;

                break;
            }
        }

        if ( enemyData == null ) {
            console.log('Error - ' + enemyID + ' is not a valid enemy ID.');
        }

        return enemyData;
    };

    // Verify that you didn't duplicate any enemy IDs. This code is run
    // immediately after we define the other things in this file.
    var enemyIDs = [];
    for ( var key in game.EnemyType ) {
        var enemyType = game.EnemyType[key];
        var id = enemyType.id;
        if ( enemyIDs.indexOf(id) != -1 ) {
            // Get the first enemy with that ID
            var first = game.GetEnemyDataFromID(id, 1);
            console.log('Major error! You duplicated an enemy id (' + id + 
                '). Duplicates: ' + first.name + ' and ' + enemyType.name);
            debugger;
        }

        enemyIDs.push(id);
    }
    // This should be deleted when enemyIDs goes out of scope below, but we'll
    // manually delete it regardless.
    delete enemyIDs;

}());
