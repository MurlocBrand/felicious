/**
 * Copyright (c) 2014 handelsbolaget shai. All rights reserved.
 */

var fullText = [];
var postId = 0;
var postFetchCount = 5;
var canUpdate = true;

/* Request a RSS feed via Google's Feed API. 
 * Feed API the RSS feed as a JSON object. 
 */
function loadRSS(url, callback) {
    var gurl="http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q="+url+"&num=" + postFetchCount;
    canUpdate = false;

    $.getJSON(gurl, function(data) {
        if (data.responseData.feed) {
            callback(data.responseData.feed)
        }
    });
}

/* Show full text of a given post. 
 * Only IDs belonging to a post with a snippet can be used. 
 */
function showText(id){
    $("#text-" + id).html(fullText[id]);
    $("#overlay-" + id).hide();
}

/* Append a number of blog posts (items) to a given
 * jquery document node. 
 */
function renderBlogItems (container, blog) {
    for (var i = 0; i < blog.length; i++) {
        var entry = blog[i];

        var card = $("<div>").addClass("card");
        var title = $("<h1>");
        var content = $("<p>");
        var body = $("<div>").addClass("body1");

        title.html(entry.title);

        // attempt to split on the image tag
        var data = entry.content.split("<img");
        var imgSrc, image, srcAtt;

        // if we have an image
        if (data[1]) {
            // extract the src attribute
            imgSrc = data[1].split(" ")[1];

            // remove the preceding src=", and the last "
            imgSrc = imgSrc.substr(5, imgSrc.length-6)

            image = $("<div>").addClass("card-image");
            image.css("background-image", "url('" + imgSrc + "')");
        }

        // set the text of the blogpost
        content.html(data[0]);
        content.attr("id", "text-" + postId);

        card.append(title);
        if (image) {
            card.append(image);
        }

        body.append(content);
        card.append(body);
        
        // If we have a short version (snippet) of the full text, use it!
        if (entry.contentSnippet) {
            var overlay = $("<div>");
            overlay.attr("id", "overlay-" + postId);
            overlay.addClass("image-overlay");

            var link = $("<a>");
            link.attr("href", "javascript:showText('" + postId +"');");

            var imgOverlay = $("<img>");
            imgOverlay.attr("src", "trans.gif");
            imgOverlay.attr("width", "100%").attr("height", "100%");

            link.append(imgOverlay);
            overlay.append(link);

            fullText[postId] = data[0];

            content.html(entry.contentSnippet);
            body.append(overlay);
        }
        container.append(card);

        postId++;
    }

    canUpdate = true;
}

/* Load new blog posts. This method should avoid
 * adding already existing blog posts, not 100% sure.
 */
function update(){
    loadRSS("http://www.felicious.se/RSS/blog", function(feed){
        var currentItems = $.totalStorage('cached-blog');
        $.totalStorage('cached-blog', feed.entries);
        console.log("got:", feed.entries);
        
        if (currentItems) {
            for (var i = 0; i < currentItems.length; i++) {
                console.log("removing", feed.entries[feed.entries.length - 1]);
                feed.entries.pop();    
            }
        }
        
        renderBlogItems($("#new-items-node"), feed.entries);
    });
}

/* Render cached blog posts immediately, and fetch new ones. */
$(window).scroll(function () {
    var wintop = $(window).scrollTop();
    var container = $("#container").height();
    var docheight = $(window).height();

    console.log(wintop, container, docheight, wintop / container);


    var  scrolltrigger = 0.95;

    /*if  ((wintop/(docheight-winheight)) > scrolltrigger && canUpdate) {
        console.log("fetching new posts...: " + (wintop/(docheight-winheight)));
        postFetchCount += 2;
        update();
    }*/
});

$(document).ready(function(){
    //$.totalStorage.deleteItem('cached-blog');

    if ($.totalStorage('cached-blog')) {
        renderBlogItems($("#cached-items-node"), $.totalStorage('cached-blog'));
    }
    //postFetchCount += 20;
    update();
});
