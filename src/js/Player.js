( function() {

    /**
     * There is only one Player, and it keeps track of coins for now.
     */
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
         * castles on the screen, but they all share this life. Therefore, the
         * player should try to protect all castles.
         * @type {Number}
         */
        castleLife: 4,

        /**
         * This draws the castle life to the screen
         * @param  {Object} ctx - the canvas context
         * @return {undefined}
         */
        drawCastleLife: function(ctx) {
            game.util.debugDisplayText('Castle life: ' + this.castleLife, 'castle life');

            if ( game.castleFlashScreenTimer > 0 ) {
                ctx.save();
                ctx.fillStyle = 'rgba(255,255,255, 1)';
                ctx.fillRect(0, 0, screenWidth, screenHeight);
                ctx.restore();
            }
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
            var x = screenWidth / 2 - width / 2;
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
