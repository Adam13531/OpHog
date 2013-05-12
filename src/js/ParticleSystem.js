( function() {
  
    /**
     * ParticleSystem class
     * @param {number} x - location of particle system in world coords
     * @param {number} y - location of particle system in world coords
     */
    window.game.ParticleSystem = function ParticleSystem(x, y) {
    	this.particles = Array();
    	this.x = x;
    	this.y = y;

        // This is just a hack to make the particles shoot out only once
        this.spawnedAll = false;
   	};

    /**
     * Updates each particle in the system. Also spawns/destroys them.
     * @param {number} delta - number of ms since the last time this was 
     *	called.
     */
   	window.game.ParticleSystem.prototype.update = function(delta) {
   		// Only allow approximately 3 particles.
        // I say "approximately" we may have spawned 2 already, then we get back
        // to this function and it bursts out another 5, making 7.
        if (this.particles.length < 3 && !this.spawnedAll)
        {
        	// Spawn somewhere between 1 and 5 particles.
        	var randBurst = Math.ceil(Math.random()*5);
        	for (var i = 0; i < randBurst; i++) {
        		this.particles.push(new game.Particle(this));
        	};
        }
        else
        {
            this.spawnedAll = true;
        }

        // Update/remove existing particles
   		for (var i = 0; i < this.particles.length; i++) {
   			this.particles[i].update(delta);
   			if (!this.particles[i].isLiving()) {
   				this.particles.splice(i, 1);
		        i--;
		      }
   		};

    };

    window.game.ParticleSystem.prototype.isLiving = function() {
        return !(this.spawnedAll && this.particles.length == 0);
    };

    /**
     * Draws the system and all of its particles.
     * @param {Object} ctx - the canvas context
     */
   	window.game.ParticleSystem.prototype.draw = function(ctx) {
   		for (var i = 0; i < this.particles.length; i++) {
   			this.particles[i].draw(ctx);
   		};
    };

}());