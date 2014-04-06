/*
 * OpHog - https://github.com/Adam13531/OpHog
 * Copyright (C) 2014  Adam Damiano
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
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
        MOVING_TO_NORMAL_MAP: 'moving to normal map',
        READING_A_BOOK: 'on overworld reading a book',
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
         * reaches zero, it will reset the timer and save the game. This exists
         * so that buying units on the overworld is saved in your game.
         * @type {Number}
         */
        autoSaveOnOverworldCountdown: game.SAVE_GAME_ON_OVERWORLD_INTERVAL,

        /**
         * Number of ms spent in the current state.
         * @type {Number}
         */
        timeSpentInCurrentState: 0,

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
        isReadingABook: function() {
            return this.currentState == game.GameStates.READING_A_BOOK;
        },

        /**
         * Returns true if buying a unit should place it on the overworld map.
         */
        inStateToPlaceUnitsOnOverworld: function() {
            return this.inOverworldMap() || this.isReadingABook();
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
        enterReadingABookState: function() {
            this.setState(game.GameStates.READING_A_BOOK);
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
            game.playerInventoryUI.exitUseMode(true);

            // Leave everything on the screen after a minigame
            if ( this.inMinigameWinState() || 
                 this.inMinigameLoseState() ) {
                return;
            }

            game.BattleManager.removeAllBattles();
            game.UnitManager.removeAllUnitsFromMap();
            $('#buyingScreenContainer').dialog('close');
        },

        /**
         * Gets the cost of retrying a map.
         */
        getRetryCost: function() {
            if ( game.currentMap == game.overworldMap ) return;
            
            var minigameData = game.currentMap.nodeOfMap.minigame;
            var baseDiamonds = minigameData.baseDiamonds;
            var diamondsPerLevel = minigameData.diamondsPerLevel;

            // The cost is the same as the reward for the middle minigame tier.
            // That way it's roughly balanced for each map.
            return baseDiamonds + diamondsPerLevel * Math.floor(game.NUM_MINIGAME_DIFFICULTIES / 2);
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
                    var cost = gameStateManager.getRetryCost();
                    if ( !game.Player.hasThisManyDiamonds(cost) ) return;
                    game.Player.modifyDiamonds(-cost);
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
         * Call this whenever your diamond total changes.
         */
        playerDiamondsChanged: function() {
            this.setRetryButtonState();
        },

        /**
         * Disables/enables the retry button based on how many diamonds you
         * have.
         */
        setRetryButtonState: function() {
            var $retryButton = $('#retryButton');
            var cost = this.getRetryCost();
            if ( !game.Player.hasThisManyDiamonds(cost) ) {
                $retryButton.button('disable');
            } else {
                $retryButton.button('enable');
            }
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

            var cost = this.getRetryCost();
            $retryButton.html('<span class="ui-button-text">Retry for ' + cost + ' ' +
            	game.util.makeTransparentImgTag('icon-sprite diamond-icon'));
            this.setRetryButtonState();

            // To get the same height as the retry button, put a hidden diamond
            // icon in the button. This is a hack, but it works.
            $goToOverworldButton.html('<span class="ui-button-text">Go to overworld' +
            	game.util.makeTransparentImgTag('icon-sprite diamond-icon', 'hideTheDiamond'));
            $('#hideTheDiamond').hide();

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

            // Particles are in world coordinates and should be removed so that
            // they don't show in unusual locations.
            game.ParticleManager.removeAllParticleSystems();

            // It doesn't make sense for text to stay around either, but
            // especially so because most text is based on world coordinates.
            game.TextManager.removeAllTextObjects();

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
            var width = nodeOfMap.dimensions[0] * game.PUZZLE_PIECE_SIZE;
            var height = nodeOfMap.dimensions[1] * game.PUZZLE_PIECE_SIZE;
            game.currentMap = game.MapGenerator.generateRandomMap(width, height, nodeOfMap);
            game.Player.resetCastleLife(nodeOfMap.castleLife);
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

            // Overworld --> reading a book
            if ( this.inOverworldMap() && newState == game.GameStates.READING_A_BOOK ) return true;

            // Reading a book --> overworld
            if ( this.isReadingABook() && newState == game.GameStates.OVERWORLD ) return true;

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
         * Sets the state of the Forfeit button, which is the only "normal" way
         * to leave a map when you have no way of winning/losing.
         */
        setForfeitButtonState: function() {
            $('#forfeit').button(this.isNormalGameplay() ? 'enable' : 'disable');
        },

        /**
         * Sets the state of the game.
         * @param  {game.GameStates} newState - the new state
         */
        setState: function(newState) {
            if ( !this.isValidStateTransition(newState) ) {
                return;
            }

            if ( this.previousState != this.currentState ) {
                this.timeSpentInCurrentState = 0;
            }

            this.previousState = this.currentState;
            this.currentState = newState;

            // Regardless of how we transitioned, setting the state of these
            // buttons shouldn't hurt.
            game.playerInventoryUI.setUseItemButtonState();
            this.setForfeitButtonState();

            // Same thing with these buttons
            this.hideTransitionButtons();

            // Lose state --> normal gameplay
            // 
            // Need to restore the boss since it was removed and reset the castle
            // life.
            if ( this.previousState == game.GameStates.NORMAL_LOSE_SCREEN && this.isNormalGameplay() ) {
                // Note that most of this is also done in the map's initialize
                // function, so if we add more code here, we should refactor
                // that.
                game.currentMap.setStartingCoins();
                game.currentMap.addBossUnit();
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
                game.Player.setCoins(0);
                this.showTransitionButtons(true, true);
                game.AudioManager.playAudio(game.Audio.EXPLODE_2);
            }

            // Normal state --> win
            if ( this.previousState == game.GameStates.NORMAL_GAMEPLAY && this.inWinState() ) {
                this.commonWinLoseFunctions();
                game.Player.resetCastleLife();
                game.currentMap.clearAllFog();

                game.OverworldMapData.mapWasBeaten(game.currentMap.nodeOfMap.id);

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

            // Overworld --> reading a book
            if ( this.previousState == game.GameStates.OVERWORLD && this.isReadingABook() ) {
                // The BookManager handled this already.
            }

            // Reading a book --> overworld
            if ( this.previousState == game.GameStates.READING_A_BOOK && this.inOverworldMap() ) {
                // The BookManager handled this already.
            }
        },

        /**
         * Updates the GameStateManager.
         * @param  {Number} delta - time in ms since this function was last called
         */
        update: function(delta) {
            this.timeSpentInCurrentState += delta;
            var numSecondsInState = Math.floor(this.timeSpentInCurrentState / 1000.0);

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

                // If you're spending too long on the overworld, then you likely
                // don't know what to do, so give some guidance to the player.
                // 
                // Don't stop the message until they've beaten the first world.
                if ( (numSecondsInState == 2 || (numSecondsInState > 0 && (numSecondsInState % 20) == 0)) && !game.OverworldMapData.mapsBeaten[0] ) {
                    var textX = game.canvasWidth / 2 - 200;
                    var textY = game.canvasHeight / 2 - 100;
                    var textBox = new game.TextBox(textX, textY, 'New to OpHog? Tap the book at the upper left for some information!', 400);
                    game.TextManager.textBoxes.push(textBox);
                }
            } else if ( this.isNormalGameplay() ) {

                if ( !game.OverworldMapData.mapsBeaten[0] ) {
                    // Upon first entering a normal map, show a message about
                    // placing units (they're guaranteed to have one at this
                    // point). Keep showing the message until the player dips
                    // below the starting coin amount.
                    // 
                    // If they ever rise ABOVE the starting coin amount again,
                    // then the message will still spam them, but that's a small
                    // price to pay for now.
                    if ( (numSecondsInState == 2 || (numSecondsInState > 0 && (numSecondsInState % 5) == 0) && game.Player.coins >= game.currentMap.nodeOfMap.startingCoins ) ) {
                        var textX = game.canvasWidth / 2 - 200;
                        var textY = game.canvasHeight / 2 - 100;
                        var textBox = new game.TextBox(textX, textY, 'Place units using the buttons at the bottom left - don\'t let enemies reach your castles!', 400);
                        game.TextManager.textBoxes.push(textBox);
                    }
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

            var frostTheScreen = inWinState || inLoseState || this.isReadingABook();

            if ( frostTheScreen ) {
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
