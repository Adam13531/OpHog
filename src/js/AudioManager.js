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

    /**
     * All audio descriptors.
     * @type {Object}
     */
    window.game.Audio = {
        NEW_3: new game.AudioDescriptor(game.MUSIC_PATH,'new3',false,true,false,true),
        HIT_1: new game.AudioDescriptor(game.SOUND_PATH,'hit1',false,true,false,false),
        EXPLODE_1: new game.AudioDescriptor(game.SOUND_PATH,'explode1',false,true,false,false),
        EXPLODE_2: new game.AudioDescriptor(game.SOUND_PATH,'explode2',false,true,false,false),
        PICKUP_1: new game.AudioDescriptor(game.SOUND_PATH,'pickup1',false,true,false,false),
        BLIP_1: new game.AudioDescriptor(game.SOUND_PATH,'blip1',false,true,false,false),
        POWERUP_1: new game.AudioDescriptor(game.SOUND_PATH,'powerup1',false,true,false,false),
        POWERUP_2: new game.AudioDescriptor(game.SOUND_PATH,'powerup2',false,true,false,false),
        EXPLODE_3: new game.AudioDescriptor(game.SOUND_PATH,'explode3',false,true,false,false),
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
        audioEnabled: game.AUDIO_DEFAULT_ENABLED,

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
         * When a music file plays, it is given this ID, then the ID is
         * incremented, so this is unique for music files.
         * @type {Number}
         */
        nextMusicId: 1,

        /**
         * We keep track of which MUSIC (not sound) files are playing so that we
         * can adjust the volume of them when we slide the bar or disable/enable
         * audio. We don't do the same for sounds since they should be
         * short-lived.
         * @type {Array}
         */
        musicPlaying: [],

        /**
         * This is true after SoundManager2 calls onready.
         * @type {Boolean}
         */
        finishedInitializingSoundManager: false,

        /**
         * JQuery objects for the sliders.
         * @type {Object}
         */
        $soundSlider: null,
        $musicSlider: null,

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
                    // Ready to use; soundManager.createSound() etc. can now be
                    // called.
                    game.AudioManager.loadSounds();
                    game.AudioManager.finishedInitializingSoundManager = true;
                }
            });

            this.$soundSlider = $('#soundSlider');
            this.$musicSlider = $('#musicSlider');
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
            return this.audioEnabled && this.finishedInitializingSoundManager;
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

            // Refresh the radio buttons so that they reflect their new
            // 'checked' state.
            $audioOffButton.button('refresh');
            $audioOnButton.button('refresh');

            // Mute/unmute the music that was playing.
            if ( !enabled ) {
                this.changeVolumeOfPlayingMusic(0);
            } else {
                this.changeVolumeOfPlayingMusic(this.musicVolume);
            }

            // Set the appropriate colors for the sliders.
            game.util.setSliderColor(this.$soundSlider, this.audioEnabled);
            game.util.setSliderColor(this.$musicSlider, this.audioEnabled);
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
         * @param {Boolean} enableAudioToo - if true, this will enable audio.
         * This should be true when the user initiates this action so that
         * sliding the bar will unmute all audio.
         */
        setSoundVolume: function(volume, enableAudioToo) {
            if ( enableAudioToo === true ) {
                this.setAudioEnabled(true);
            }

            this.soundVolume = volume;
            this.$soundSlider.slider('option','value',this.soundVolume);
            game.util.setSliderColor(this.$soundSlider, this.audioEnabled);
        },

        /**
         * Sets the audio volume for music
         * @param {Number} volume - New volume amount
         * @param {Boolean} enableAudioToo - if true, this will enable audio.
         * This should be true when the user initiates this action so that
         * sliding the bar will unmute all audio.
         */
        setMusicVolume: function(volume, enableAudioToo) {
            if ( enableAudioToo === true ) {
                this.setAudioEnabled(true);
            }

            this.musicVolume = volume;
            this.$musicSlider.slider('option','value',this.musicVolume);
            game.util.setSliderColor(this.$musicSlider, this.audioEnabled);

            this.changeVolumeOfPlayingMusic(volume);
        },

        changeVolumeOfPlayingMusic: function(volume) {
            for (var i = 0; i < this.musicPlaying.length; i++) {
                this.musicPlaying[i].setVolume(volume);
            };
        },

        /**
         * When music is finished playing, this will remove it from the list
         * where we keep track of it.
         */
        finishedPlayingMusic: function() {
            for (var i = 0; i < this.musicPlaying.length; i++) {
                if ( this.musicPlaying[i].musicId == this.musicId ) {
                    this.musicPlaying.splice(i, 1);
                    return;
                }
            };
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
            var onFinishFunction = audioDescriptor.isMusic ? this.finishedPlayingMusic : undefined;
            var soundManagerObject = soundManager.play(soundManagerID, {volume:playVolume, onfinish:onFinishFunction});

            // If it was music, then we need to keep track of it.
            if ( audioDescriptor.isMusic ) {
                soundManagerObject.musicId = this.nextMusicId;
                this.nextMusicId++;
                this.musicPlaying.push(soundManagerObject);
            }
        }

    };
}()); 