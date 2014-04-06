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
     * When a castle gets hit, flash the screen over the course of this many
     * milliseconds.
     * @type {Number}
     */
    window.game.castleFlashScreenTimer = 0;

    window.game.Player = {
        /**
         * The number of coins you have.
         * @type {Number}
         */
        coins: 750,

        /**
         * The number of diamonds you have.
         * @type {Number}
         */
        diamonds: 50,

        /**
         * After your cooldown hits 0, this is the number that it will be set
         * to. This represents the number of seconds it takes for you to
         * regenerate coins.
         * @type {Number}   
         */
        coinRegenRate: 10,

        /**
         * This is the number of seconds until you regenerate coins.
         * @type {Number}
         */
        coinRegenCooldown: 10,

        /**
         * When coinRegenCooldown hits 0, this many coins will be added to your
         * total.
         * @type {Number}
         */
        coinRegenAmount: 5,

        /**
         * The amount of life that all castles share. There can be multiple
         * castles on the screen, but they all share this life.
         *
         * The value hard-coded below is never used. Map nodes set the max life
         * (see castleLifeMax) and then castleLife starts at the max.
         * @type {Number}
         */
        castleLife: 100,

        /**
         * The max of 'castleLife' (see 'castleLife').
         */
        castleLifeMax: 100,

        /**
         * The player's inventory
         * @type {game.PlayerInventory}
         */
        inventory: null,

        /**
         * This draws the castle life to the screen and flashes the screen if
         * a castle was recently hit
         * @param  {Object} ctx - the canvas context
         * @return {undefined}
         */
        drawCastleLife: function(ctx) {
            ctx.save();

            // Flash the screen if one of the castles was recently hit
            if ( game.castleFlashScreenTimer > 0 ) {
                var redValue = Math.max(255-game.castleFlashScreenTimer, 0);
                ctx.fillStyle = 'rgba(' + redValue + ', 0, 0, .3)';
                ctx.fillRect(0, 0, game.canvasWidth, game.canvasHeight);
            }
            // Switch from screen coordinates to camera coordinates
            game.Camera.scaleAndTranslate(ctx);
            // Draw castle's life over them for the user to see
            if ( game.keyPressedToDisplayLifeBars || (game.displayLifeBarForPlayer & game.DisplayLifeBarFor.CASTLE) ) {

                var castleTiles = game.currentMap.getAllTiles(game.TileFlags.CASTLE);
                for (var i = 0; i < castleTiles.length; i++) {
                    var castleTile = castleTiles[i];
                    
                    var w = game.TILESIZE;
                    var h = 7;
                    var x = castleTile.x * game.TILESIZE;
                    var y = (castleTile.y * game.TILESIZE) + game.TILESIZE - h;
                    var percentLife = Math.min(1, Math.max(0, this.castleLife / this.castleLifeMax));

                    game.graphicsUtil.drawBar(ctx, x,y,w,h, percentLife, {barR:200, borderR:255});
                };
            }
            ctx.restore();
        },

        /**
         * Sets castle life to full.
         * @param {Number} newMax - if defined, castleLifeMax is set to this
         * value before resetting the life to max.
         */
        resetCastleLife: function(newMax) {
            if ( newMax !== undefined ) this.castleLifeMax = newMax;
            this.castleLife = this.castleLifeMax;
        },

        /**
         * This draws the number of coins/diamonds you have on the screen.
         * @param  {Object} ctx - the canvas context
         */
        drawCurrencyTotal: function(ctx) {
            ctx.save();
            ctx.font = '12px Futura, Helvetica, sans-serif';
            var lookingAtOverworld = game.currentMap.isOverworldMap;
            var padding = 4;

            var text = ': ' + this.coins;
            var width = ctx.measureText(text).width + game.ICON_SPRITE_SIZE;
            var x = game.canvasWidth / 2 - width / 2;
            var y = 5;
            var rowHeight = 12 + padding; // 12 is the font size

            if ( this.coins >= 0 ) {
                ctx.fillStyle = '#0b0';
            } else {
                ctx.fillStyle = '#b00';
            }

            ctx.textBaseline = 'top';
            if ( lookingAtOverworld ) {
                y -= rowHeight;
            } else {
                iconSheet.drawSprite(ctx, game.Graphic.GOLD_COIN, x, y);
                ctx.fillText(text, x + game.ICON_SPRITE_SIZE, y);
            }

            text = ': ' + this.diamonds;
            width = ctx.measureText(text).width + game.ICON_SPRITE_SIZE;
            x = game.canvasWidth / 2 - width / 2;
            y += rowHeight;

            iconSheet.drawSprite(ctx, game.Graphic.BLUE_DIAMOND, x, y);
            ctx.fillStyle = '#0bb';
            ctx.fillText(text, x + game.ICON_SPRITE_SIZE, y);

            ctx.restore();

            if ( lookingAtOverworld ) return;

            // Draw a little meter to represent your coin regen cooldown
            ctx.save();
            var h = 1;
            var percentFilled = 1 - Math.min(1, Math.max(0, this.coinRegenCooldown / this.coinRegenRate));
            var alpha = .1 + .70 * percentFilled;
            var w = width * (percentFilled);
            ctx.fillStyle = 'rgba(0, 173, 0, ' + alpha + ')';
            ctx.fillRect(x,y-1,w,h);
            ctx.restore();
        },

        /**
         * This is a really simple function. It exists so that callers aren't
         * directly accessing game.Player.coins.
         * @param  {Number} numberOfCoins - the number of coins to see if you
         * have
         * @return {Boolean} - true if you have at least that many coins
         */
        hasThisMuchMoney: function(numberOfCoins) {
            return this.coins >= numberOfCoins;
        },

        hasThisManyDiamonds: function(numberOfDiamonds) {
            return this.diamonds >= numberOfDiamonds;
        },

        /**
         * Modifies your coin total and updates UIs that might care.
         * @param  {Number} amount - the amount of coins to add (negative ==
         * losing/spending coins).
         * @return {undefined}
         */
        modifyCoins: function(amount) {
            this.coins += amount;
        },

        setCoins: function(amount) {
            this.coins = amount;
        },

        /**
         * See modifyCoins.
         */
        modifyDiamonds: function(amount) {
            this.diamonds += amount;

            game.ShopUI.playerDiamondsChanged();
            game.GameStateManager.playerDiamondsChanged();
        },

        /**
         * Modifies your castle life and updates the UI.
         * @param  {Number} amount - the amount of life to add (negative ==
         * taking damage)
         */
        modifyCastleLife: function(amount) {
            this.castleLife += amount;

            if ( game.Player.castleLife <= 0 ) {
                game.GameStateManager.enterLoseState();
            } else if ( amount < 0 ) {
                game.castleFlashScreenTimer = 255;
                game.AudioManager.playAudio(game.Audio.EXPLODE_1);
            }
        },

        /**
         * Sets what you want to show lifebars for and makes the checkboxes in
         * the settings menu reflect your choices.
         *
         * For all of the parameters below, explicitly pass false if you want to
         * disable it, explicitly pass true if you want to enable it, and pass
         * undefined if you don't want to change the value.
         */
        setShowLifebars: function(showForPlayer, showForEnemy, showForCastle) {
            if ( showForPlayer === true ) game.displayLifeBarForPlayer |= game.DisplayLifeBarFor.PLAYER;
            if ( showForPlayer === false ) game.displayLifeBarForPlayer &= ~game.DisplayLifeBarFor.PLAYER;
            if ( showForEnemy === true ) game.displayLifeBarForPlayer |= game.DisplayLifeBarFor.ENEMY;
            if ( showForEnemy === false ) game.displayLifeBarForPlayer &= ~game.DisplayLifeBarFor.ENEMY;
            if ( showForCastle === true ) game.displayLifeBarForPlayer |= game.DisplayLifeBarFor.CASTLE;
            if ( showForCastle === false ) game.displayLifeBarForPlayer &= ~game.DisplayLifeBarFor.CASTLE;

            $('#showLifebarPlayer').prop('checked', ((game.displayLifeBarForPlayer & game.DisplayLifeBarFor.PLAYER) != 0));
            $('#showLifebarEnemy').prop('checked', ((game.displayLifeBarForPlayer & game.DisplayLifeBarFor.ENEMY) != 0));
            $('#showLifebarCastle').prop('checked', ((game.displayLifeBarForPlayer & game.DisplayLifeBarFor.CASTLE) != 0));
        },

        /**
         * Regenerates coins and updates the timer for flashing the screen when
         * a castle gets hit by an enemy.
         * @param  {Number} delta - time in ms since this function was last
         * called
         * @return {undefined}
         */
        update: function(delta) {
            // Coins don't regenerate while you're on the lose screen so that
            // you don't think you'll start with more coins than you really
            // have.
            if ( game.GameStateManager.inLoseState() ) return;

            var deltaAsSec = delta / 1000;
            this.coinRegenCooldown -= deltaAsSec;
            if ( this.coinRegenCooldown <= 0 ) {
                this.coinRegenCooldown += this.coinRegenRate;
                this.coins += this.coinRegenAmount;
            }

            if ( game.castleFlashScreenTimer > 0 ) {
                game.castleFlashScreenTimer -= delta;
            }
        }
    }
}());
