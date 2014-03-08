var updateCoordTimerID;
var TILESIZE = 24;

// This is global so that clicking the rectangle won't have to compute anything
// to re-form this text.
var text = '';

var $rectangleDiv;
var $coordsDiv;
var $envImg;

var currentMousePos = {
    x: -1,
    y: -1
};

$(document).ready(function() {
    init();
});

function init() {
    // Keep track of where the mouse is hovering since JQuery can't query the
    // mouse position.
    $(document).mousemove(function(event) {
        currentMousePos.x = event.pageX;
        currentMousePos.y = event.pageY;
    });

    $rectangleDiv = $('#rectangleDiv');
    $coordsDiv = $('#coordsDiv');
    $envImg = $('#envImg');

    $rectangleDiv.width(TILESIZE + 'px');
    $rectangleDiv.height(TILESIZE + 'px');

    $rectangleDiv.click(function(event){
        event.preventDefault();
        $('body').append('<div>' + text + '</div>');
    });
    
    clearInterval(updateCoordTimerID);
    updateCoordTimerID = setInterval(updateMouseCoords, 15);
};

function updateMouseCoords() {
    var offset = $envImg.offset();
    var width = $envImg.width();
    var height = $envImg.height();
    var numCols = width / TILESIZE;

    var relativeX = currentMousePos.x - offset.left;
    var relativeY = currentMousePos.y - offset.top;

    if ( relativeX < 0 || relativeX >= width || relativeY < 0 || relativeY >= height ) {
        return;
    }

    var tileX = Math.floor(relativeX / TILESIZE);
    var tileY = Math.floor(relativeY / TILESIZE);
    var tileIndex = tileY * numCols + tileX;

    text = '(' + tileX + ', ' + tileY + ') == ' + tileIndex;

    $coordsDiv.text(text);
    $coordsDiv.offset({
        left: currentMousePos.x + TILESIZE,
        top: currentMousePos.y + TILESIZE,
    });
    $rectangleDiv.offset({
        left: + offset.left + tileX * TILESIZE,
        top: offset.top + tileY * TILESIZE,
    });

}
