( function() {
  
    /**
     * ParticleSystem class
     * @param {number} x - location of particle system in world coords
     * @param {number} y - location of particle system in world coords
     * @param {Object} options - any extra options for this particle system.
     * This is optional. For details, see setOptionsBasedProperties.
     * constructor.
     */
    window.game.ParticleSystem = function ParticleSystem(x, y, options) {

        this.setOptionsBasedProperties(options);

    	this.particles = Array();
    	this.x = x;
    	this.y = y;

        this.cooldown = 0;
   	};

    /**
     * Sets all proprties from 'options' or uses the defaults. It's necessary to
     * call this function, but passing anything in is optional.
     *
     * To see which options you can set, just look below.
     */
    window.game.ParticleSystem.prototype.setOptionsBasedProperties = function(options) {
        if ( options === undefined ) options = {};

        // Everything below is an array of two integers representing a possible
        // range.
        var numParticlesPerBurst = (options.numParticlesPerBurst === undefined ? [2,5] : options.numParticlesPerBurst);
        var numBursts = (options.numBursts === undefined ? [1,3] : options.numBursts);
        var cooldownBetweenBursts = (options.cooldownBetweenBursts === undefined ? [50,50] : options.cooldownBetweenBursts);
        var particleSize = (options.particleSize === undefined ? [3,5] : options.particleSize);
        var particleTTL = (options.particleTTL === undefined ? [400,1200] : options.particleTTL);
        var particleSpeed = (options.particleSpeed === undefined ? [270,300] : options.particleSpeed);

        // This is an {Array:game.Gradient}.
        var particleGradients = (options.particleGradients === undefined ? [game.BLUE_GRADIENT] : options.particleGradients);

        this.numParticlesPerBurst = numParticlesPerBurst;
        this.numBurstsRemaining = game.util.randomIntegerInRange(numBursts);
        this.cooldownBetweenBursts = cooldownBetweenBursts;
        this.particleSize = particleSize;
        this.particleTTL = particleTTL;
        this.particleGradients = particleGradients;
        this.particleSpeed = particleSpeed;
    };

    /**
     * Updates each particle in the system. Also spawns/destroys them.
     * @param {number} delta - number of ms since the last time this was 
     *  called.
     */
    window.game.ParticleSystem.prototype.update = function(delta) {
        this.updateSpawnedParticles(delta);

        this.cooldown -= delta;
        if ( this.cooldown <= 0 && this.numBurstsRemaining > 0) {
            this.spawnParticles();
        }
    };

    // Update/remove existing particles
   	window.game.ParticleSystem.prototype.updateSpawnedParticles = function(delta) {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].update(delta);
            if (!this.particles[i].isLiving()) {
                this.particles.splice(i, 1);
                i--;
              }
        };
    };

    /**
     * Spawns one burst of particles.
     */
    window.game.ParticleSystem.prototype.spawnParticles = function() {
        this.numBurstsRemaining--;
        this.cooldown = game.util.randomIntegerInRange(this.cooldownBetweenBursts);
        var particlesToSpawn = game.util.randomIntegerInRange(this.numParticlesPerBurst);

        for (var i = 0; i < particlesToSpawn; i++) {
            this.particles.push(new game.Particle(this));
        };
    };

    window.game.ParticleSystem.prototype.isLiving = function() {
        return !(this.numBurstsRemaining == 0 && this.particles.length == 0);
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