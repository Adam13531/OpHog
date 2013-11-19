( function() {

    /**
     * Possible game states. The game is always in exactly one of these. To
     * transition between them, use the setState function.
     */
    window.game.GameStates = {
        NORMAL_GAMEPLAY: 'normal gameplay',
        NORMAL_WIN_SCREEN: 'win screen',
        NORMAL_LOSE_SCREEN: 'lose screen',
        MINIGAME_GAMEPLAY: 'minigame gameplay',
        MINIGAME_WIN_SCREEN: 'minigame win screen',
        MINIGAME_LOSE_SCREEN: 'minigame lose screen',
        OVERWORLD: 'overworld',
        MOVING_TO_NORMAL_MAP: 'moving to normal map'
    };

    /**
     * This is the overworld map. When you're in the OVERWORLD state, game.currentMap
     * will be set to this. We keep a reference to this around so that we don't
     * need to recompute the world map every time we switch back to it, but also
     * because we need to save/load it correctly.
     * @type {game.Map}
     */
    window.game.overworldMap = null;

    /**
     * This is responsible for the game's state, e.g. when you win or lose,
     * certain things must be done.
     */
    window.game.GameStateManager = {
        /**
         * The current state.
         * @type {game.GameStates}
         */
        currentState: game.GameStates.OVERWORLD,

        /**
         * The last state we were in.
         * @type {game.GameStates}
         */
        previousState: null,

        /**
         * This counts down when you're in the OVERWORLD state, and when it
         * reaches zero, it will reset the timer and save the game. That way,
         * you don't collect a ton of coins on the overworld only to have them
         * disappear because you didn't leave the overworld and come back (to
         * cause the game to save).
         * @type {Number}
         */
        autoSaveOnOverworldCountdown: game.SAVE_GAME_ON_OVERWORLD_INTERVAL,

        /**
         * These functions simply return true/false if you're in the specified
         * state.
         */
        isNormalGameplay: function() {
            return this.currentState == game.GameStates.NORMAL_GAMEPLAY;
        },
        isMinigameGameplay: function() {
            return this.currentState == game.GameStates.MINIGAME_GAMEPLAY;
        },
        inMinigameWinState: function() {
            return this.currentState == game.GameStates.MINIGAME_WIN_SCREEN;
        },
        inMinigameLoseState: function() {
            return this.currentState == game.GameStates.MINIGAME_LOSE_SCREEN;
        },
        inWinState: function() {
            return this.currentState == game.GameStates.NORMAL_WIN_SCREEN;
        },
        inLoseState: function() {
            return this.currentState == game.GameStates.NORMAL_LOSE_SCREEN;
        },
        inOverworldMap: function() {
            return this.currentState == game.GameStates.OVERWORLD;
        },
        isMovingToNormalMap: function() {
            return this.currentState == game.GameStates.MOVING_TO_NORMAL_MAP;
        },

        /**
         * These functions simply attempt to set the state (I say "attempt"
         * because some state transitions are invalid). setState is responsible
         * for any state-transition-specific logic.
         */
        returnToNormalGameplay: function() {
            this.setState(game.GameStates.NORMAL_GAMEPLAY);
        },
        enterLoseState: function() {
            this.setState(game.GameStates.NORMAL_LOSE_SCREEN);
        },
        enterWinState: function() {
            this.setState(game.GameStates.NORMAL_WIN_SCREEN);
        },
        enterMinigameGameplay: function() {
            this.setState(game.GameStates.MINIGAME_GAMEPLAY);
        },
        enterMinigameLoseState: function() {
            this.setState(game.GameStates.MINIGAME_LOSE_SCREEN);
        },
        enterMinigameWinState: function() {
            this.setState(game.GameStates.MINIGAME_WIN_SCREEN);
        },
        enterOverworldState: function() {
            this.setState(game.GameStates.OVERWORLD);
        },
        transitionToNormalMap: function() {
            this.setState(game.GameStates.MOVING_TO_NORMAL_MAP);
        },

        /**
         * This is a debug-only function that will transition directly from the
         * overworld to a normal map without needing to click anything.
         */
        debugTransitionFromOverworldToNormalMap: function() {
            this.transitionToNormalMap();
            this.returnToNormalGameplay();
        },

        /**
         * These are functions that should be called when you either win or
         * lose.
         */
        commonWinLoseFunctions: function () {
            game.BattleManager.removeAllBattles();
            game.UnitManager.removeAllUnitsFromMap();
            game.playerInventoryUI.exitUseMode(true);
            $('#buyingScreenContainer').dialog('close');
        },

        /**
         * Sets up the transition buttons, which are the "retry" and "go to
         * overworld" buttons.
         */
        setupTransitionButtons: function() {
            var $retryButton = $('#retryButton');
            var $goToOverworldButton = $('#goToOverworldButton');
            var buttons = [$retryButton, $goToOverworldButton];

            // Perform some actions on both buttons
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].button();
                buttons[i].css({
                    'padding': '6px'
                });
            };

            $retryButton.text('Retry');
            $goToOverworldButton.text('Return to overworld');

            $retryButton.click(function(gameStateManager) {
                return function() {
                    gameStateManager.returnToNormalGameplay();
                }
            }(this));
                
            $goToOverworldButton.click(function(gameStateManager) {
                return function() {
                    gameStateManager.enterOverworldState();
                }
            }(this));
                
            this.hideTransitionButtons();
        },

        /**
         * Hides the transition buttons.
         */
        hideTransitionButtons: function() {
            $('#retryButton').hide();
            $('#goToOverworldButton').hide();
        },

        /**
         * Positions and shows the transition buttons.
         *
         * The buttons will always be positioned in the center of the canvas.
         * @param {Boolean} showRetry - if true, show the 'retry' button.
         * @param {Boolean} showOverworld - if true, show the 'go to overworld'
         * button.
         */
        showTransitionButtons: function(showRetry, showOverworld) {
            var centerX = game.canvasWidth / 2;
            var centerY = game.canvasHeight / 2;
            var padding = 5;

            var $goToOverworldButton = $('#goToOverworldButton');
            var $retryButton = $('#retryButton');

            var retryWidth = parseInt($retryButton.css('width'));
            var goToOverworldWidth = parseInt($goToOverworldButton.css('width'));
            var height = parseInt($goToOverworldButton.css('height'));

            var top = centerY - height / 2;

            // Set both buttons' left coordinates to be the center of the
            // screen. This way, if we don't change them below, they'll be
            // positioned correctly.
            var retryLeft = centerX - retryWidth / 2;
            var overworldLeft = centerX - goToOverworldWidth / 2;

            // If they're both showing, then we need to take both widths into
            // account for positioning them.
            if ( showRetry && showOverworld ) {
                var totalWidth = retryWidth + padding + goToOverworldWidth;
                retryLeft = centerX - totalWidth / 2;
                overworldLeft = retryLeft + retryWidth + padding;
            }

            $retryButton.css({
                'position': 'absolute',
                'left': retryLeft + 'px',
                'top': top + 'px'
            });

            $goToOverworldButton.css({
                'position': 'absolute',
                'left': overworldLeft + 'px',
                'top': top + 'px'
            });

            if ( showOverworld ) {
                $goToOverworldButton.show();
            }

            if ( showRetry ) {
                $retryButton.show();
            }
        },

        /**
         * Switches to the overworld map.
         */
        switchToOverworldMap: function() {
            game.BattleManager.removeAllBattles();
            game.UnitManager.removeAllUnitsFromMap();
            game.GeneratorManager.removeAllGenerators();
            game.CollectibleManager.removeAllCollectibles();

            game.TilesetManager.init();

            // If true, we will save the game at the end of this function.
            var saveTheGame = true;
            if ( game.overworldMap == null ) {
                game.OverworldMapData.initializeOverworldMap();

                // We're just initializing the game (the overworldMap was null),
                // so we don't want to save the game or we'll overwrite
                // everything.
                saveTheGame = false;
            }

            game.currentMap = game.overworldMap;

            game.Camera.initialize();
            game.Minimap.initialize();

            // Place all of your units at the last map node you clicked.
            var tileOfLastMap = game.currentMap.getTileOfLastMap();

            // Restore the camera's zoom and pan properties to be what they were
            // when you were last looking at the overworld.
            game.Camera.instantlySetZoom(game.currentMap.lastCameraZoom);
            game.Camera.panInstantlyTo(game.currentMap.lastCameraX, game.currentMap.lastCameraY, true);
            
            // Give them the movement AI that will make them wander
            game.UnitManager.placeAllPlayerUnits(tileOfLastMap.x, tileOfLastMap.y, game.MovementAI.WANDER_UNFOGGY_WALKABLE);

            if ( saveTheGame ) {
                game.GameDataManager.saveGame();
                
                // Reset the autosave timer since we just saved
                this.autoSaveOnOverworldCountdown = game.SAVE_GAME_ON_OVERWORLD_INTERVAL;
            }
        },

        /**
         * This will remove any map-specific entities and generate a new map.
         */
        switchToNewMap: function() {
            game.BattleManager.removeAllBattles();
            game.UnitManager.removeAllUnitsFromMap();
            game.GeneratorManager.removeAllGenerators();
            game.CollectibleManager.removeAllCollectibles();

            game.TilesetManager.init();
            game.MapGenerator.init();

            // We're looking at the overworld map right now, so save the camera
            // coordinates
            game.overworldMap.setLastCameraProperties(game.Camera.getCenterX(), game.Camera.getCenterY(), game.Camera.getCurrentZoom());

            var nodeOfMap = game.OverworldMapData.getOverworldNodeOfLastMap();
            game.currentMap = game.MapGenerator.generateRandomMap(50, 25, nodeOfMap);
            game.UnitPlacementUI.initializeSpawnPoint();

            game.Minimap.initialize();
            // Initialize the camera so that the zoom and pan values aren't out
            // of bounds.
            game.Camera.initialize();

            // Make sure you're not beneath level 1 zoom
            if ( game.Camera.getCurrentZoom() < 1 ) {
                game.Camera.instantlySetZoom(1);
            }

            // Pan to the upper left so that they can at least see one of the
            // spawn points.
            game.Camera.panInstantlyTo(0, 0, false);
        },

        /**
         * Returns true if transitioning into the new state is valid.
         * @param  {game.GameStates} newState - the new state
         * @return {Boolean}          true if valid
         */
        isValidStateTransition: function(newState) {
            
            // You can't transition to the state that you're already in.
            if ( this.currentState == newState ) {
                return false;
            }

            // Normal gameplay --> minigame gameplay (INVALID)
            // 
            // This has to go through the win state.
            if ( this.isNormalGameplay() && newState == game.GameStates.MINIGAME_GAMEPLAY ) {
                return false;
            }

            // Lose state --> win state (INVALID)
            // 
            // The following happens right now because entering the LOSE state
            // will remove the boss, and removing the boss will win you the map,
            // so we reject this state transition.
            if ( this.inLoseState() && newState == game.GameStates.NORMAL_WIN_SCREEN ) {
                return false;
            }

            // Win state --> lose state (INVALID)
            //
            // This shouldn't be possible. If you've already won, then nothing
            // should trigger a loss.
            if ( this.inWinState() && newState == game.GameStates.NORMAL_LOSE_SCREEN ) {
                debugger;
                return false;
            }

            // Null --> overworld Allow this only because you may save the game
            // while you're on the overworld, and then when you load it, it will
            // force this transition.
            if ( this.currentState == null && newState == game.GameStates.OVERWORLD ) return true;

            // Lose state --> normal gameplay
            if ( this.inLoseState() && newState == game.GameStates.NORMAL_GAMEPLAY ) return true;

            // Lose state --> overworld
            if ( this.inLoseState() && newState == game.GameStates.OVERWORLD ) return true;

            // Win state --> overworld
            if ( this.inWinState() && newState == game.GameStates.OVERWORLD ) return true;

            // Normal state --> lose
            if ( this.isNormalGameplay() && newState == game.GameStates.NORMAL_LOSE_SCREEN ) return true;

            // Normal state --> win
            if ( this.isNormalGameplay() && newState == game.GameStates.NORMAL_WIN_SCREEN ) return true;

            // Normal win state --> minigame gameplay
            if ( this.inWinState() && newState == game.GameStates.MINIGAME_GAMEPLAY ) return true;

            // Minigame gameplay --> minigame lose
            if ( this.isMinigameGameplay() && newState == game.GameStates.MINIGAME_LOSE_SCREEN ) return true;

            // Minigame gameplay --> minigame win
            if ( this.isMinigameGameplay() && newState == game.GameStates.MINIGAME_WIN_SCREEN ) return true;

            // Minigame lose --> overworld map
            if ( this.inMinigameLoseState() && newState == game.GameStates.OVERWORLD ) return true;

            // Minigame win --> overworld map
            if ( this.inMinigameWinState() && newState == game.GameStates.OVERWORLD ) return true;
            
            // Overworld --> moving to normal map
            if ( this.inOverworldMap() && newState == game.GameStates.MOVING_TO_NORMAL_MAP ) return true;

            // Moving to normal map --> normal gameplay
            if ( this.isMovingToNormalMap() && newState == game.GameStates.NORMAL_GAMEPLAY ) return true;

            // Moving to normal map --> overworld
            // 
            // This is only to account for a problem where you could reveal part
            // of a map, but you can't path to it and then you need to revert
            // the game state.
            if ( this.isMovingToNormalMap() && newState == game.GameStates.OVERWORLD ) return true;

            console.log('State transition unknown: ' + this.currentState + ' --> ' + newState);
            return false;
        },

        /**
         * Sets the state of the game.
         * @param  {game.GameStates} newState - the new state
         */
        setState: function(newState) {
            if ( !this.isValidStateTransition(newState) ) {
                return;
            }

            this.previousState = this.currentState;
            this.currentState = newState;

            // Regardless of how we transitioned, setting the state of this
            // button shouldn't hurt.
            game.playerInventoryUI.setUseItemButtonState();

            // Same thing with these buttons
            this.hideTransitionButtons();

            // Lose state --> normal gameplay
            // 
            // Need to restore the boss since it was removed and reset the castle
            // life.
            if ( this.previousState == game.GameStates.NORMAL_LOSE_SCREEN && this.isNormalGameplay() ) {
                // Note that placing the boss and NPCs is also done in the map's
                // initialize function, so if we add more code here, we should
                // refactor that.
                game.currentMap.addBossUnit();
                game.currentMap.placeNPCs();
                game.Player.resetCastleLife();
            }

            // Win state --> overworld
            if ( this.previousState == game.GameStates.NORMAL_WIN_SCREEN && this.inOverworldMap() ) {
                game.MinigameUI.hide();
                this.switchToOverworldMap();
            }

            // Lose state --> overworld
            if ( this.previousState == game.GameStates.NORMAL_LOSE_SCREEN && this.inOverworldMap() ) {
                game.Player.resetCastleLife();
                this.switchToOverworldMap();
            }

            // Normal state --> lose
            if ( this.previousState == game.GameStates.NORMAL_GAMEPLAY && this.inLoseState() ) {
                this.commonWinLoseFunctions();
                game.Player.modifyCoins(-1000);
                this.showTransitionButtons(true, true);
                game.AudioManager.playAudio(game.Audio.EXPLODE_2);
            }

            // Normal state --> win
            if ( this.previousState == game.GameStates.NORMAL_GAMEPLAY && this.inWinState() ) {
                this.commonWinLoseFunctions();
                game.Player.resetCastleLife();
                game.currentMap.clearAllFog();

                // Clear fog on the overworld map too
                game.OverworldMapData.clearFog();

                game.MinigameUI.populateUI();
                game.MinigameUI.show();
                game.AudioManager.playAudio(game.Audio.POWERUP_2);
            }

            // Minigame gameplay --> minigame lose
            if ( this.previousState == game.GameStates.MINIGAME_GAMEPLAY && this.inMinigameLoseState() ) {
                this.commonWinLoseFunctions();
                var textObj = new game.TextObj(game.canvasWidth / 2, game.canvasHeight / 2, 'You lost the minigame', true, '#f00', false);
                game.TextManager.addTextObj(textObj);
                this.showTransitionButtons(false, true);
                game.AudioManager.playAudio(game.Audio.EXPLODE_2);
            }

            // Minigame gameplay --> minigame win
            if ( this.previousState == game.GameStates.MINIGAME_GAMEPLAY && this.inMinigameWinState() ) {
                this.commonWinLoseFunctions();
                var textObj = new game.TextObj(game.canvasWidth / 2, game.canvasHeight / 2, 'You won the minigame', true, '#0f0', false);
                game.TextManager.addTextObj(textObj);
                this.showTransitionButtons(false, true);
                game.AudioManager.playAudio(game.Audio.POWERUP_2);
            }

            // Minigame lose --> overworld map
            if ( this.previousState == game.GameStates.MINIGAME_LOSE_SCREEN && this.inOverworldMap() ) {
                this.switchToOverworldMap();
            }

            // Minigame win --> overworld map
            if ( this.previousState == game.GameStates.MINIGAME_WIN_SCREEN && this.inOverworldMap() ) {
                this.switchToOverworldMap();
            }

            // Moving to normal map --> normal gameplay
            if ( this.previousState == game.GameStates.MOVING_TO_NORMAL_MAP && this.isNormalGameplay()) {
                this.switchToNewMap();
            }

            // Overworld --> moving to normal map
            if ( this.previousState == game.GameStates.OVERWORLD && this.isMovingToNormalMap() ) {
                // Make all units move to the tile you tapped
                game.UnitManager.makeAllPlayerUnitsMoveToTile(game.overworldMap.tileOfLastMap);
            }
        },

        /**
         * Updates the GameStateManager.
         * @param  {Number} delta - time in ms since this function was last called
         */
        update: function(delta) {
            // If you're transitioning from the overworld to the normal map,
            // then check to see if all of your units made it to their
            // destinations.
            if ( this.isMovingToNormalMap() ) {
                if ( game.UnitManager.areAllUnitsAtTheirDestinations() ) {
                    this.returnToNormalGameplay();
                }
            } else if ( this.inWinState() ) {
                // The minigame UI shouldn't be closeable, but if they somehow
                // found a way to close it, then pop it up again.
                game.MinigameUI.showIfHidden();
            } else if ( this.inOverworldMap() ) {
                this.autoSaveOnOverworldCountdown -= delta;
                if ( this.autoSaveOnOverworldCountdown <= 0 ) {
                    this.autoSaveOnOverworldCountdown = game.SAVE_GAME_ON_OVERWORLD_INTERVAL;
                    game.GameDataManager.saveGame();
                }
            }
        },

        /**
         * Draws the state if appropriate.
         * @param  {Object} ctx - the canvas context
         */
        draw: function(ctx) {
            // There's nothing to draw when you're playing normally.
            if ( this.isNormalGameplay() ) {
                return;
            }

            var inWinState = (this.inWinState() || this.inMinigameWinState());
            var inLoseState = (this.inLoseState() || this.inMinigameLoseState());

            if ( inWinState || inLoseState ) {
                // "Frost" the screen so that you know you can't interact with
                // "anything.
                ctx.save();
                ctx.fillStyle = 'rgba(37,37,37,.5)';
                ctx.fillRect(0, 0, game.canvasWidth, game.canvasHeight);
                ctx.restore();
            }

            var color;
            var text = null;
            if ( inWinState ) {
                text = 'You won!';
                color = '#0b0';
            }

            if ( inLoseState ) {
                text = 'You lost!';
                color = '#b00';
            }

            if ( text != null ) {
                var x = game.canvasWidth / 2;
                var y = game.canvasHeight / 2 - 120;
                var fontSize = 60;

                game.TextManager.drawTextImmediate(ctx, text, x, y, {screenCoords:true, fontSize:60, color:color});
            }
        }
    }
}());
