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
         * @type {Number}
         */
        castleLife: game.FULL_CASTLE_LIFE,

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
            if ( game.keyPressedToDisplayLifeBars ) {

                var castleTiles = game.currentMap.getAllTiles(game.TileFlags.CASTLE);
                for (var i = 0; i < castleTiles.length; i++) {
                    var castleTile = castleTiles[i];
                    
                    var w = game.TILESIZE;
                    var h = 10;
                    var x = castleTile.x * game.TILESIZE;
                    var y = (castleTile.y * game.TILESIZE) + game.TILESIZE - h;
                    var percentLife = Math.min(1, Math.max(0, game.Player.castleLife / game.FULL_CASTLE_LIFE));

                    game.graphicsUtil.drawBar(ctx, x,y,w,h, percentLife, {barR:200, borderR:255});
                };
            }
            ctx.restore();
        },

        /**
         * This draws the number of coins you have on the screen.
         * @param  {Object} ctx - the canvas context
         * @return {undefined}
         */
        drawCoinTotal: function(ctx) {
            ctx.save();
            ctx.font = '12px Futura, Helvetica, sans-serif';
            var text = 'Coins: ' + this.coins;
            var width = ctx.measureText(text).width;
            var x = game.canvasWidth / 2 - width / 2;
            var y = 5;

            if ( this.coins >= 0 ) {
                ctx.fillStyle = '#0b0';
            } else {
                ctx.fillStyle = '#b00';
            }

            ctx.textBaseline = 'top';
            ctx.fillText(text, x, y);
            ctx.restore();

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

        /**
         * Modifies your coin total and updates UIs that might care.
         * @param  {Number} amount - the amount of coins to add (negative ==
         * losing/spending coins).
         * @return {undefined}
         */
        modifyCoins: function(amount) {
            this.coins += amount;

            game.UnitPlacementUI.playerCoinsChanged();
            game.ShopUI.playerCoinsChanged();
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
            }
        },

        /**
         * Regenerates coins and updates the timer for flashing the screen when
         * a castle gets hit by an enemy.
         * @param  {Number} delta - time in ms since this function was last
         * called
         * @return {undefined}
         */
        update: function(delta) {
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
