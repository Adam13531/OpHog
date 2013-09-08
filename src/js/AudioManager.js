( function() {

    /**
     * All audio descriptors.
     * @type {Object}
     */
    window.game.Audio = {
        NEW_3: new game.AudioDescriptor(game.MUSIC_PATH,'new3',false,true,false),
        HIT_1: new game.AudioDescriptor(game.SOUND_PATH,'hit1',true,true,true),
        EXPLODE_1: new game.AudioDescriptor(game.SOUND_PATH,'explode1',true,true,true),
        EXPLODE_2: new game.AudioDescriptor(game.SOUND_PATH,'explode2',true,true,true),
        PICKUP_1: new game.AudioDescriptor(game.SOUND_PATH,'pickup1',true,true,true),
        BLIP_1: new game.AudioDescriptor(game.SOUND_PATH,'blip1',true,true,true),
        POWERUP_1: new game.AudioDescriptor(game.SOUND_PATH,'powerup1',true,true,true),
        POWERUP_2: new game.AudioDescriptor(game.SOUND_PATH,'powerup2',true,true,true),
    };

    /**
     * An audio file can't play if it was already played this many times within
     * game.FRAMES_BEFORE_AUDIO_SKIP_DISABLED frames.
     *
     * For example, if this is set to 5 and
     * game.FRAMES_BEFORE_AUDIO_SKIP_DISABLED is set to 10, you can only play a
     * specific audio file 5 times in any given 10-frame period. This is to
     * prevent "sound spam", e.g. when a million projectiles cause explosions.
     *
     * Increasing this number will decrease audio skips.
     * @type {Number}
     */
    window.game.NUM_AUDIO_PLAYS_BEFORE_SKIP = 2;

    /**
     * See game.NUM_AUDIO_PLAYS_BEFORE_SKIP.
     *
     * Increasing this number will increase audio skips.
     * @type {Number}
     */
    window.game.FRAMES_BEFORE_AUDIO_SKIP_DISABLED = 3;


    /**
     * The audio manager is in charge of playing sound/music.
     */
    window.game.AudioManager = {

        /**
         * This is either 'probably', 'maybe', or '' depending on what the
         * browser says with regards to playing OGG files.
         * @type {String}
         */
        canPlayOgg: null,

        /**
         * See canPlayOgg.
         * @type {String}
         */
        canPlayMp3: null,

        /**
         * See canPlayOgg.
         * @type {String}
         */
        canPlayAac: null,

        /**
         * This is the extension that should be the smallest and play the most
         * accurately according to the browser. It's a case-sensitive string
         * like "ogg" or "mp3" (no periods).
         * @type {String}
         */
        preferredExtension: null,

        /**
         * If false, the user disabled audio.
         * @type {Boolean}
         */
        audioEnabled: false,

        /**
         * This is a dictionary whose keys are AudioDescriptors and whose values
         * are arrays of Numbers representing how many frames before the entry
         * in the array is removed (it's like a TTL).
         *
         * When audio is played, an entry is added to this dictionary with the
         * descriptor. Every game loop, each entry in the arrays is decremented.
         * You can't play an audio file when there are too many entries in the
         * array corresponding to the audio's descriptor.
         *
         * For more information, see game.NUM_AUDIO_PLAYS_BEFORE_SKIP.
         * @type {Object}
         */
        playHistory: {},

        /**
         * Every time audio is skipped, this number is incremented.
         *
         * This is simply for metrics. The user doesn't care about this, but we
         * would want to know whether the sound-skipping is actually helping at
         * all.
         *
         * For more information, see 'playHistory'.
         * @type {Number}
         */
        numberOfSkippedAudios: 0,

        /**
         * Initializes the AudioManager.
         */
        initialize: function() {
            this.canPlayOgg = (new Audio()).canPlayType("audio/ogg");
            this.canPlayMp3 = (new Audio()).canPlayType("audio/mp3");
            this.canPlayAac = (new Audio()).canPlayType("audio/mpeg");

            // It's ideal to go in order of size here since the quality is
            // probably about the same. OGG and AAC seem to be about the same
            // size, then MP3 seems to be higher, so we choose MP3 last.
            this.preferredExtension = null;

            if ( this.canPlayOgg == game.PROBABLY ) {
                this.preferredExtension = game.OGG_EXT;
            } else if ( this.canPlayAac == game.PROBABLY ) {
                this.preferredExtension = game.AAC_EXT;
            } else if ( this.canPlayMp3 == game.PROBABLY ) {
                this.preferredExtension = game.MP3_EXT;
            } else if ( this.canPlayOgg == game.MAYBE ) {
                this.preferredExtension = game.OGG_EXT;
            } else if ( this.canPlayAac == game.MAYBE ) {
                this.preferredExtension = game.AAC_EXT;
            } else if ( this.canPlayMp3 == game.MAYBE ) {
                this.preferredExtension = game.MP3_EXT;
            }
        },

        /**
         * @return {Boolean} true if audio can be played, false if your browser
         * sucks or you disabled sounds.
         */
        canPlayAudio: function() {
            return this.audioEnabled && this.preferredExtension != null;
        },

        /**
         * Turns audio on or off.
         * @param {Boolean} enabled - if true, turns it on.
         */
        setAudioEnabled: function(enabled) {
            this.audioEnabled = enabled;

            var $audioOffButton = $('#audioOff');
            var $audioOnButton = $('#audioOn');

            $audioOffButton.prop('checked', !this.audioEnabled);
            $audioOnButton.prop('checked', this.audioEnabled);

            // Refresh the radio buttons so that they reflect their new 'checked'
            // state.
            $audioOffButton.button('refresh');
            $audioOnButton.button('refresh');
        },

        /**
         * Updates the audio manager's playback history so that audio can be
         * correctly skipped when appropriate.
         * @param  {Number} delta - time since last update (in ms). This isn't
         * used right now, which actually means that there could be a slight bug
         * in the future where you play some audio, pause the game, then later
         * unpause and try to play more audio. Because we're counting frames,
         * this may be disallowed despite that the new audio wouldn't be
         * "spamming" you.
         */
        update: function(delta) {
            // Go through each play history and decrement the counters
            for ( key in this.playHistory ) {
                var plays = this.playHistory[key];
                for (var i = 0; i < plays.length; i++) {
                    if ( plays[i]-- <= 0 ) {
                        plays.splice(i,1);
                        i--;
                    }
                };

                if ( plays.length == 0 ) {
                    delete this.playHistory[key];
                }
            }
        },

        /**
         * Attempts to play audio.
         * @param  {AudioDescriptor} audioDescriptor - the audio to play
         */
        playAudio: function(audioDescriptor) {
            if ( !this.canPlayAudio() ) {
                return;
            }

            // Make sure the audio is valid
            if ( audioDescriptor === undefined ) {
                console.log('You passed in an undefined audioDescriptor');
                return;
            }

            // Add an entry to the history if it isn't already there.
            if ( this.playHistory[audioDescriptor] === undefined ) {
                this.playHistory[audioDescriptor] = [];
            }

            // Make sure you haven't recently played this sound too many times.
            var audioPlayHistory = this.playHistory[audioDescriptor];
            if ( audioPlayHistory.length >= game.NUM_AUDIO_PLAYS_BEFORE_SKIP ) {
                this.numberOfSkippedAudios++;
                return;
            }

            // The entry we add represents a frame count. After that many
            // frames, we'll remove the entry.
            audioPlayHistory.push(game.FRAMES_BEFORE_AUDIO_SKIP_DISABLED);

            var extensionToUse = null;

            if ( audioDescriptor.oneExtension != null ) {
                // If we only have one type of file for the audio, play that.
                extensionToUse = audioDescriptor.oneExtension;
            } else if ( audioDescriptor.hasExtension(this.preferredExtension) ){
                // If our preferred extension exists, play that.
                extensionToUse = this.preferredExtension;
            } else {
                // Fall back to just picking SOMETHING we can play.
                if ( this.canPlayOgg && audioDescriptor.hasExtension(game.OGG_EXT) ) {
                    extensionToUse = game.OGG_EXT;
                } else if ( this.canPlayMp3 && audioDescriptor.hasExtension(game.MP3_EXT) ) {
                    extensionToUse = game.MP3_EXT;
                } else if ( this.canPlayAac && audioDescriptor.hasExtension(game.AAC_EXT) ) {
                    extensionToUse = game.AAC_EXT;
                } else {
                    console.log('Fatal audio error: no extension match found for ' + audioDescriptor.fileName);
                }
            }

            // Play the audio
            var fullPath = audioDescriptor.getFullPath(extensionToUse);
            // console.log('playing ' + fullPath)
            var audio = new Audio(fullPath);
            audio.play();
        }

    };
}()); 