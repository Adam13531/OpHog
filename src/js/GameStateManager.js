( function() {

    /**
     * Possible game states. The game is always in exactly one of these. To
     * transition between them, use the setState function.
     */
    window.game.GameStates = {
        NORMAL_GAMEPLAY: 'normal gameplay',
        WIN_SCREEN: 'win screen',
        LOSE_SCREEN: 'lose screen'
    };

    /**
     * This is responsible for the game's state, e.g. when you win or lose,
     * certain things must be done.
     */
    window.game.GameStateManager = {
        /**
         * The current state.
         * @type {game.GameStates}
         */
        currentState: game.GameStates.NORMAL_GAMEPLAY,

        /**
         * Very simple function. Read the body.
         */
        isNormalGameplay: function() {
            return this.currentState == game.GameStates.NORMAL_GAMEPLAY;
        },

        /**
         * Very simple function. Read the body.
         */
        inWinState: function() {
            return this.currentState == game.GameStates.WIN_SCREEN;
        },

        /**
         * Very simple function. Read the body.
         */
        inLoseState: function() {
            return this.currentState == game.GameStates.LOSE_SCREEN;
        },

        /**
         * Simple function to set the current state to NORMAL_GAMEPLAY.
         * @return {undefined}
         */
        returnToNormalGameplay: function() {
            this.setState(game.GameStates.NORMAL_GAMEPLAY);
        },

        /**
         * Simple function to set the current state to LOSE_SCREEN.
         * @return {undefined}
         */
        enterLoseState: function() {
            this.setState(game.GameStates.LOSE_SCREEN);
        },

        /**
         * Simple function to set the current state to WIN_SCREEN.
         * @return {undefined}
         */
        enterWinState: function() {
            this.setState(game.GameStates.WIN_SCREEN);
        },

        /**
         * These are functions that should be called when you either win or
         * lose.
         * @return {undefined}
         */
        commonWinLoseFunctions: function () {
            game.BattleManager.removeAllBattles();
            game.UnitManager.removeAllUnitsFromMap();
            game.InventoryUI.exitUseMode(true);
            $('#buyingScreenContainer').dialog('close');
        },

        /**
         * This will remove any map-specific entities and generate a new map.
         * @return {undefined}
         */
        switchToNewMap: function() {
            game.BattleManager.removeAllBattles();
            game.UnitManager.removeAllUnitsFromMap();
            game.GeneratorManager.removeAllGenerators();
            game.CollectibleManager.removeAllCollectibles();

            game.TilesetManager.init();
            game.MapGenerator.init();
            currentMap = game.MapGenerator.generateRandomMap(50,25, 1);
            currentMap.addBossUnit();

            // Initialize the camera so that the zoom and pan values aren't out
            // of bounds.
            game.Camera.initialize();
        },

        /**
         * Sets the state of the game.
         * @param  {game.GameStates} newState - the new state
         * @return {undefined}
         */
        setState: function(newState) {
            if ( this.currentState == newState ) {
                console.log('GameStateManager error: you\'re trying to ' +
                    'transition to the state you\'re already in: ' + newState);
                return;
            }

            // Lose state --> normal gameplay
            // 
            // Need to restore the boss since it was removed and reset the castle
            // life.
            if ( this.inLoseState() && newState == game.GameStates.NORMAL_GAMEPLAY ) {
                currentMap.addBossUnit();
                game.Player.castleLife = game.FULL_CASTLE_LIFE;
            }

            // Lose state --> win state (INVALID)
            // 
            // The following happens right now because entering the LOSE state
            // will remove the boss, and removing the boss will win you the map,
            // so we reject this state transition.
            if ( this.inLoseState() && newState == game.GameStates.WIN_SCREEN ) {
                return;
            }

            // Win state --> lose state (INVALID)
            //
            // This shouldn't be possible. If you've already won, then nothing
            // should trigger a loss.
            if ( this.inWinState() && newState == game.GameStates.LOSE_SCREEN ) {
                debugger;
                return;
            }

            // Win state --> normal
            if ( this.inWinState() && newState == game.GameStates.NORMAL_GAMEPLAY ) {
                this.switchToNewMap();
            }

            // Normal state --> lose
            if ( this.isNormalGameplay() && newState == game.GameStates.LOSE_SCREEN ) {
                this.commonWinLoseFunctions();
                game.Player.modifyCoins(-1000);
            }

            // Normal state --> win
            if ( this.isNormalGameplay() && newState == game.GameStates.WIN_SCREEN ) {
                this.commonWinLoseFunctions();
                currentMap.clearAllFog();
            }

            this.currentState = newState;

            // Regardless of how we transitioned, setting the state of this
            // button shouldn't hurt.
            game.InventoryUI.setUseItemButtonState();
        },

        /**
         * Draws the state if appropriate.
         * @param  {Object} ctx - the canvas context
         * @return {undefined}
         */
        draw: function(ctx) {
            // There's nothing to draw when you're playing normally.
            if ( this.isNormalGameplay() ) {
                return;
            }

            ctx.font = '60px Futura, Helvetica, sans-serif';
            var inWinOrLoseState = (this.inWinState() || this.inLoseState());
            var text = null;

            if ( inWinOrLoseState ) {
                // "Frost" the screen so that you know you can't interact with
                // "anything.
                ctx.save();
                ctx.fillStyle = 'rgba(37,37,37,.5)';
                ctx.fillRect(0, 0, screenWidth, screenHeight);
                ctx.restore();
            }

            ctx.save();

            if ( this.inWinState() ) {
                text = 'You won! (press "G" for now)';
                ctx.fillStyle = '#0b0';
            }

            if ( this.inLoseState() ) {
                text = 'You lost! (press "G" for now)';
                ctx.fillStyle = '#b00';
            }

            if ( text != null ) {
                var width = ctx.measureText(text).width;
                var x = screenWidth / 2 - width / 2;
                var y = 100;

                ctx.textBaseline = 'top';
                ctx.fillText(text, x, y);
                ctx.restore();
            }
        }
    }
}());
