( function() {

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
        ctx.font = '12px Futura, Helvetica, sans-serif';
        var width = ctx.measureText(text).width;

        ctx.textBaseline = 'top';
        ctx.fillStyle = '#fff';
        ctx.fillText(text, x + w / 2 - width / 2, y - 2);

        ctx.restore();
    };

}());
