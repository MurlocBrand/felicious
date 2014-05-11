var x2js = new X2JS();
var fullText = [];
var postId = 0;

function parseXML(xmlText) {
    return x2js.xml_str2json( xmlText ); 
}

function loadRSS(url, callback) {
    var jqxhr = $.get( "https://script.google.com/a/macros/mcpher.com/s/AKfycbzGgpLEWS0rKSBqXG5PcvJ7Fpe02fvGqiCqq54SVQmBJSpy_6s/exec?url=" + encodeURIComponent(url), function(data) {
        callback(data.results);
    })
    .fail(function() {
        alert( "error - couldn't get blog data. Make sure you have a working internet connection and restart the app." );
    })
}

function showText(id){
    $("#text-" + id).html(fullText[id]);
    $("#overlay-" + id).hide();
}

function renderBlogItems (container, blog) {
    blog.forEach(function(entry) {
        var card = $("<div>").addClass("card");
        var title = $("<h1>");
        var content = $("<p>");
        var body = $("<div>").addClass("body1");

        title.html(entry.title.__cdata);

        // attempt to split on the image tag
        var data = entry.encoded.__cdata.split("<img");
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
        if (data[0].length > 4 * 35) {
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

            content.html(data[0].substr(0, data[0].indexOf(" ", 120)));
            body.append(overlay);
        }
        container.append(card);

        postId++;
    });
}

function update(){
    loadRSS("http://www.felicious.se/RSS/blog", function(xmlDoc){
        var feed = parseXML(xmlDoc);
        var blog = feed.rss.channel.item;
        var currentItems = $.totalStorage('cached-blog');

        $.totalStorage('cached-blog', blog);
        
        if (currentItems) {
            for (var i = 0; i < currentItems.length; i++) {
                blog.pop();    
            }
        }
        
        renderBlogItems($("#new-items-node"), blog);
    });
}

$(document).ready(function(){

    if ($.totalStorage('cached-blog'))
        renderBlogItems($("#cached-items-node"), $.totalStorage('cached-blog'));
    
    update();
});
