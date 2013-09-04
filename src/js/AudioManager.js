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