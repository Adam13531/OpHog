( function() {

    /**
     * All audio descriptors.
     * @type {Object}
     */
    window.game.Audio = {
        NEW_3: new game.AudioDescriptor(game.MUSIC_PATH,'new3',false,true,false,true),
        HIT_1: new game.AudioDescriptor(game.SOUND_PATH,'hit1',true,true,true,false),
        EXPLODE_1: new game.AudioDescriptor(game.SOUND_PATH,'explode1',true,true,true,false),
        EXPLODE_2: new game.AudioDescriptor(game.SOUND_PATH,'explode2',true,true,true,false),
        PICKUP_1: new game.AudioDescriptor(game.SOUND_PATH,'pickup1',true,true,true,false),
        BLIP_1: new game.AudioDescriptor(game.SOUND_PATH,'blip1',true,true,true,false),
        POWERUP_1: new game.AudioDescriptor(game.SOUND_PATH,'powerup1',true,true,true,false),
        POWERUP_2: new game.AudioDescriptor(game.SOUND_PATH,'powerup2',true,true,true,false),
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
         * ID of the sound that SoundManager assigned. Every game loop, each
         * entry in the arrays is decremented. You can't play an audio file when
         * there are too many entries in the array corresponding to the audio's
         * descriptor.
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
         * The volume of sounds that play (range: [0,100]);
         * @type {Number}
         */
        soundVolume: game.DEFAULT_SOUND_VOLUME,

        /**
         * The volume of music that plays (range: [0,100]);
         * @type {Number}
         */
        musicVolume: game.DEFAULT_MUSIC_VOLUME,

        /**
         * Initialize SoundManager2.
         */
        initialize: function() {
            soundManager.setup({
                url: game.resourcePath + '/soundmanager2_swf/',
                flashVersion: 9, // optional: shiny features (default = 8)
                debugMode: false, // don't print to console

                // optional: ignore Flash where possible, use 100% HTML5 mode
                // preferFlash: false,
                onready: function() {
                // Ready to use; soundManager.createSound() etc. can now be called.
                // 
                    game.AudioManager.loadSounds();
                }
            });
        },

        /**
         * Load the sounds into SoundManager2.
         */
        loadSounds: function() {
            for(key in game.Audio) {
                var audioDescriptor = game.Audio[key];

                // We don't specify an ID, so SoundManager will automatically
                // create one.
                var sound = soundManager.createSound({
                     url: audioDescriptor.getFullPath(game.MP3_EXT),
                     autoLoad: true,
                     autoPlay: false,
                });

                // Get the ID that SoundManager created and associate it to our
                // descriptor.
                audioDescriptor.soundManagerID = sound.id;
            }
        },

        /**
         * @return {Boolean} true if audio can be played, false if you disabled
         * sounds.
         */
        canPlayAudio: function() {
            return this.audioEnabled;
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
         * Sets the audio volume for sounds
         * @param {Number} volume - New volume amount
         */
        setSoundVolume: function(volume) {
            this.soundVolume = volume;
            $('#soundSlider').slider('option','value',this.soundVolume);
            game.util.setSliderColor($('#soundSlider'));
        },

        /**
         * Sets the audio volume for music
         * @param {Number} volume - New volume amount
         */
        setMusicVolume: function(volume) {
            this.musicVolume = volume;
            $('#musicSlider').slider('option','value',this.musicVolume);
            game.util.setSliderColor($('#musicSlider'));
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

            var soundManagerID = audioDescriptor.soundManagerID;

            // Add an entry to the history if it isn't already there.
            if ( this.playHistory[soundManagerID] === undefined ) {
                this.playHistory[soundManagerID] = [];
            }

            // Make sure you haven't recently played this sound too many times.
            var audioPlayHistory = this.playHistory[soundManagerID];
            if ( audioPlayHistory.length >= game.NUM_AUDIO_PLAYS_BEFORE_SKIP ) {
                this.numberOfSkippedAudios++;
                // console.log('Skipped audio: ' + this.numberOfSkippedAudios + ' ' + soundManagerID);
                return;
            }

            // The entry we add represents a frame count. After that many
            // frames, we'll remove the entry.
            audioPlayHistory.push(game.FRAMES_BEFORE_AUDIO_SKIP_DISABLED);

            var playVolume = audioDescriptor.isMusic ? this.musicVolume : this.soundVolume;
            soundManager.play(soundManagerID, {volume:playVolume});
        }

    };
}()); 