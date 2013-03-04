( function() {

    // There's only one particle system manager, so we'll define everything in a
    // single object.
    window.game.ParticleManager = {
        systems: new Array(),

        addSystem: function(system) {
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