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
     * A descriptor for an audio file. You manually pass in which files exist so
     * that the user isn't hitting our webserver the first time they try to play
     * audio of a certain variety.
     * @param {String} directory - the directory containing the file with no
     * trailing slash, e.g. "../res/music"
     * @param {String} fileName  - JUST the filename (no extension), e.g.
     * "song", not "res/music/song.mp3".
     * @param {Boolean} oggExists - true if you have "fileName.ogg" in
     * 'directory'
     * @param {Boolean} mp3Exists - true if you have "fileName.mp3" in
     * 'directory'
     * @param {Boolean} aacExists - true if you have "fileName.mp4" (or whatever
     * the AAC extension is that we're using) in 'directory'
     * @param {Boolean} isMusic - true if this audio is meant to be music, not
     * sound. This will affect playback 
     */
    window.game.AudioDescriptor = function AudioDescriptor(directory, fileName, oggExists, mp3Exists, aacExists, isMusic) {
        this.directory = directory;
        this.fileName = fileName;
        this.oggExists = oggExists;
        this.mp3Exists = mp3Exists;
        this.aacExists = aacExists;
        this.isMusic = isMusic;

        // This is the ID assigned to this descriptor by SoundManager2. The
        // AudioManager only ever makes one of each AudioDescriptor, so this
        // doesn't differ between instances of each audio.
        this.soundManagerID = null;

        /**
         * This is null if you specified that this audio has more than one
         * extension, e.g. both ogg and mp3. If you only have one though, then
         * this is non-null and represents the extension.
         * @type {Boolean}
         */
        this.oneExtension = null;

        var numExtensions = 0;
        if ( this.oggExists ) {
            numExtensions++;
            this.oneExtension = game.OGG_EXT;
        }

        if ( this.mp3Exists ) {
            numExtensions++;
            this.oneExtension = game.MP3_EXT;
        }

        if ( this.aacExists ) {
            numExtensions++;
            this.oneExtension = game.AAC_EXT;
        }

        if ( this.numExtensions == 0 ) {
            game.util.debugDisplayText('Warning: you made an AudioDescriptor with filename: ' + 
                filename + ' but you didn\'t specify which format it exists in.', 'no audio format' + fileName);
        } else if ( this.numExtensions == 1 ) {
            this.onlyHasOneExtension = true;
        } else {
            this.oneExtension = null;
        }
    };

    /**
     * @param  {String}  extension - an extension with no period, e.g. "ogg"
     * @return {Boolean} true if this audio file exists in the specified
     * extension.
     */
    window.game.AudioDescriptor.prototype.hasExtension = function(extension) {
        return ( extension == game.OGG_EXT && this.oggExists ) || ( extension == game.MP3_EXT && this.mp3Exists ) || ( extension == game.AAC_EXT && this.aacExists );
    };

    /**
     * @param  {String} extension - an extension with no period, e.g. "ogg". See
     * game.OGG_EXT, game.MP3_EXT, etc.
     * @return {String} - the full path to the audio file, e.g.
     * "../res/music/song.mp3".
     */
    window.game.AudioDescriptor.prototype.getFullPath = function(extension) {
        return this.directory + '/' + this.fileName + '.' + extension;
    };

}());
