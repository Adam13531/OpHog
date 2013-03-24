( function() {

    // There's only one particle system manager, so we'll define everything in a
    // single object.
    window.game.ParticleManager = {
        /**
         * Array of particle systems that this manages.
         * @type {Array<ParticleSystem>}
         */
        systems: new Array(),

        // If you disable the particle manager, then two things will happen:
        // 1. All existing systems will be removed
        // 2. No new systems can be added
        // 
        // That means you can still call update and draw, but those functions
        // will essentially do nothing.
        enabled: true,

        toggleEnabled: function() {
            if ( this.enabled ) {
                // Get rid of existing systems
                this.systems = [];
            }

            this.enabled = !this.enabled;
        },

        addSystem: function(system) {
            if ( !this.enabled ) return;
            this.systems.push(system);
        },

        draw: function(ctx) {
            for (var i = 0; i < this.systems.length; i++) {
                this.systems[i].draw(ctx);
            };
        },

        update: function(delta) {
            // Remove dead systems first
            for (var i = 0; i < this.systems.length; i++) {
                if ( !this.systems[i].isLiving() ) {
                    this.systems.splice(i, 1);
                    i--;
                    continue;
                }

                this.systems[i].update(delta);
            };
        }
    };
}()); 