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
     */
    window.game.AudioDescriptor = function AudioDescriptor(directory, fileName, oggExists, mp3Exists, aacExists) {
        this.directory = directory;
        this.fileName = fileName;
        this.oggExists = oggExists;
        this.mp3Exists = mp3Exists;
        this.aacExists = aacExists;

        // This is the ID assigned to this descriptor by SoundManager2.
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
