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
     * Graphics modes.
     * @type {Object}
     */
    window.game.GraphicsSettings = {
        LOW:'low',
        HIGH:'high'
    };

    window.game.canvasWidth = null;
    window.game.canvasHeight = null;
    window.game.graphicsSetting = game.GraphicsSettings.HIGH;

    /**
     * Draws a bar, e.g. a life bar or experience bar.
     * @param  {Object} ctx         - the canvas context
     * @param  {Number} x           - the x coordinate in world coordinates
     * @param  {Number} y           - the y coordinate in world coordinates
     * @param  {Number} w           - width of the bar
     * @param  {Number} h           - height of the bar
     * @param  {Number} percentFill - the percent to fill the bar in the range [0,1]
     * @param  {Object} options     - all other drawing options. You don't have to specify any of these, in which case defaults will be used.
     *             {Number} barR - the "red" value of the "fill bar". Default is 0.
     *             {Number} barG - see above
     *             {Number} barB - see above
     *             {Number} borderR - the "red" value of the border. Default is 0.
     *             {Number} borderG - see above
     *             {Number} borderB - see above
     *             {String} text    - The text to draw on the bar. The default is to turn percentFill into a string. 
     */
    window.game.graphicsUtil.drawBar = function(ctx, x, y, w, h, percentFill, options) {
        var percentFill = Math.min(1, Math.max(0, percentFill));

        // Set default values
        if ( options === undefined ) options = {};
        var barR = (options.barR === undefined ? 0 : options.barR);
        var barG = (options.barG === undefined ? 0 : options.barG);
        var barB = (options.barB === undefined ? 0 : options.barR);
        var borderR = (options.borderR === undefined ? 0 : options.borderR);
        var borderG = (options.borderG === undefined ? 0 : options.borderG);
        var borderB = (options.borderB === undefined ? 0 : options.borderR);
        var text = (options.text === undefined ? game.util.formatPercentString(percentFill, 0) + '%' : options.text);

        ctx.save();

        // Draw a rectangle as the background
        ctx.fillStyle = 'rgba(0, 0, 0, .75)';
        ctx.fillRect(x,y,w,h);

        // Draw a rectangle to show how much life you have
        ctx.fillStyle = 'rgba('+barR+','+barG+','+barB+',.75)';
        ctx.fillRect(x,y,w * percentFill, h);

        // Draw a border
        ctx.strokeStyle = 'rgba('+borderR+','+borderG+','+borderB+',.75)';
        ctx.strokeRect(x,y,w, h);

        // Draw the percentage
        ctx.font = '10px Futura, Helvetica, sans-serif';
        var width = ctx.measureText(text).width;

        ctx.textBaseline = 'top';
        ctx.fillStyle = '#fff';
        ctx.fillText(text, x + w / 2 - width / 2, y - 3);

        ctx.restore();
    };

    window.game.graphicsUtil.isHighGraphicsMode = function() {
        return game.graphicsSetting == game.GraphicsSettings.HIGH;
    };

    window.game.graphicsUtil.drawLine = function(ctx,x1,y1,x2,y2) {
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
    };

    /**
     * Changes graphics modes (e.g. low/high).
     * @param {game.GraphicsSettings} graphicsSetting - the new mode
     */
    window.game.graphicsUtil.setGraphicsSettings = function(graphicsSetting) {
        var $lowGraphicsButton = $('#graphicsLow');
        var $highGraphicsButton = $('#graphicsHigh');
        game.graphicsSetting = graphicsSetting;
        var instantaneousDialogs = false;

        switch(game.graphicsSetting) {
            case game.GraphicsSettings.LOW:
                // Check the right radio buttons
                $lowGraphicsButton.prop('checked', true);
                $highGraphicsButton.prop('checked', false);

                // Disable particles
                game.ParticleManager.setEnabled(false);

                // Set min zoom to something bigger so that less things need to
                // be drawn.
                game.Camera.setMinZoom(3);

                // Make dialogs show up instantaneously.
                instantaneousDialogs = true;

                break;
            case game.GraphicsSettings.HIGH:
                $lowGraphicsButton.prop('checked', false);
                $highGraphicsButton.prop('checked', true);
                game.ParticleManager.setEnabled(true);
                game.Camera.setMinZoom(.3);
                break;
        };

        game.DialogManager.setAllDialogFadeInOutTime(instantaneousDialogs);

        // Refresh the radio buttons so that they reflect their new 'checked'
        // state.
        $lowGraphicsButton.button('refresh');
        $highGraphicsButton.button('refresh');
    };

}());
