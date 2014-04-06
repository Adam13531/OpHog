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

    // There's only one particle system manager, so we'll define everything in a
    // single object.
    window.game.ParticleManager = {
        /**
         * Array of particle systems that this manages.
         * @type {Array:ParticleSystem}
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
            this.setEnabled(!this.enabled);
        },

        removeAllParticleSystems: function() {
            this.systems = [];
        },

        setEnabled: function(enabled) {
            if ( !enabled ) {
                this.removeAllParticleSystems();
            }

            this.enabled = enabled;
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