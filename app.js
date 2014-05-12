var fullText = [];
var postId = 0;
var postFetchCount = 20;

function loadRSS(url, callback) {
    $.jGFeed(url,
        function(feeds){
            // Check for errors
            if(!feeds){
                // there was an error
                return false;
            }

            callback(feeds);
        }, 
    postFetchCount);
}

function showText(id){
    $("#text-" + id).html(fullText[id]);
    $("#overlay-" + id).hide();
}

function renderBlogItems (container, blog) {
    for (var i = 0; i < blog.length; i++) {
        var entry = blog[i];

        console.log(entry);

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
}

function update(){
    loadRSS("http://www.felicious.se/RSS/blog", function(feed){
        var currentItems = $.totalStorage('cached-blog');
        $.totalStorage('cached-blog', feed.entries);
        
        if (currentItems) {
            for (var i = 0; i < currentItems.length; i++) {
                feed.entries.pop();    
            }
        }
        
        renderBlogItems($("#new-items-node"), feed.entries);
    });
}

$(document).ready(function(){
    if ($.totalStorage('cached-blog')) {
        renderBlogItems($("#cached-items-node"), $.totalStorage('cached-blog'));
    }
    
    update();
});
