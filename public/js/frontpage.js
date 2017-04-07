
/* global $ */
                   
/* ---------------- DOCUMENT.READY ---------------- */


$(document).ready(function() {
    
    // Adjust border separating sidebar from main content
    adjustBorder();
    adjustEventBoxImageHeight();

    // Add Listener for image height
    $(window).on('resize', function() {
        adjustBorder();
        adjustEventBoxImageHeight();
    });    
    
});


/* --------------- HELPER FUNCTIONS --------------- */


// When the screen is large (bootstrap: 1200px +), ensure there is a border
// between sidebar and contentArea. By default, the border is drawn on the left
// of the contentArea. This method checks if the sidebar is longer than the contentArea.
// If so, removes the border from contentArea, and draws it to the right of sidebar.
function adjustBorder() {
    if($('.mediaQueryTesterML').css('float') == "right") {
        var sidebarH = $('.sidebar').height();
        var contentH = $('.contentArea').height();
        if(sidebarH > contentH) {
            $('.sidebar').css("border-right", "3px solid midnightblue");
            $('.contentArea').css("border-left", "none");
        }
    } else {
        $('.sidebar').css("border-right", "none"); // No border when screen is medium or less
    }
}

// If the image in event box is adjacent to the text, make sure its the same height as the 
// text. Otherwise, keep its height at 200px.
function adjustEventBoxImageHeight() {
    if($('.mediaQueryTesterSXS').css('float') == "right") {
        $('.eventBoxImg').height($('.eventBoxContentText').height());
        $('.emptyImage').height($('.eventBoxContentText').height());
    } else {
        $('.eventBoxImg').height("200px");
        $('.emptyImage').height("200px");
    }
}