/**
 * Copyright (c) 2014 handelsbolaget shai. All rights reserved.
 */

var fullText = [],
    postId = 0,
    postFetchCount = 5,
    canUpdate = true,
    inView = true,
    $window = $(window),
    $scroller,
    currentItems = [];

/* Test if scroll element is inside view or not. */
function insideView() {
   var docViewTop = $window.scrollTop(),
       docViewBottom = docViewTop + window.innerHeight,
       elemTop = $scroller.offset().top,
       elemBottom = elemTop + $scroller.height();

   return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
             && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
}

/* Request a RSS feed via Google's Feed API.
 * Feed API the RSS feed as a JSON object.
 */
function loadRSS(url, callback) {
    var gurl="httpx://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q="+url+"&num=" + postFetchCount;

    $.getJSON(gurl, function(data) {
        if (data.responseData.feed) {
            callback(data.responseData.feed)
        }
    })
    .fail(function() {
        var message = "Sorry, couldn't fetch news feed. Please check your network connection and try again."

        var iframe = document.createElement("IFRAME");
        iframe.setAttribute("src", 'data:text/plain,');
        document.documentElement.appendChild(iframe);
        window.frames[0].window.alert(message);
        iframe.parentNode.removeChild(iframe);

    })
}

/* Compare two dates and return 0, 1 or -1 depending on their
 * natural ordering. 0 if equal, 1 if later, -1 if earlier
 */
function compareDates(date1, date2) {
    if (typeof date1 == "string")
        date1 = Date.parse(date1)

    if (typeof date2 == "string")
        date2 = Date.parse(date2)

    // compare amount of milliseconds that differ the two times
    var diff = date1 - date2

    if (diff < 0)
        return -1
    else if (diff > 0)
        return 1
    else
        return 0
}

/* Show full text of a given post.
 * Only IDs belonging to a post with a snippet can be used.
 */
function showText(id){
    $("#text-" + id).html(fullText[id]);
    $("#overlay-" + id).hide();
}

/* Parse image data from an entry if it exists and return a DOM element.
 */
function createImage(data) {
    var imgSrc = data.split(" ")[1];

    // remove the preceding src=", and the last "
    imgSrc = imgSrc.substr(5, imgSrc.length-6)

    var image = $("<img>");
    image.attr("src", imgSrc);

    return $("<div>").addClass('card-image').append(image);
}

/* Create and return the DOM element that represents
 * the title of a blog entry.
 */
function createTitle(title) {
    return $("<h1>")
        .html(title);
}

/* Create and return the DOM element that contains
 * the text of a blog entry.
 */
function createContent(txt, id) {
    return $("<p>")
        .html(txt)
        .attr("id", "text-" + id);
}

/* Create a semi-transparant texture overlay that is
 * clickable, and upon click will call showText(<id>)
 */
function createOverlay(id){
    var overlay = $("<div>")
        .attr("id", "overlay-" + id)
        .addClass("image-overlay");

    var link = $("<a>")
        .attr("href", "javascript:showText('" + id +"');");

    var imgOverlay = $("<img>")
        .attr("src", "trans.gif")
        .attr("width", "100%").attr("height", "100%");

    link.append(imgOverlay);
    overlay.append(link);

    return overlay;
}

/* Append a number of blog posts (items) to a given
 * jquery document node.
 */
function renderBlogItems (container, blog) {
    for (var i = 0; i < blog.length; i++) {
        var entry = blog[i];

        // attempt to split on the image tag
        var data = entry.content.split("<img");

        var card = $("<div>").addClass("card");
        var body = $("<div>").addClass("body1");

        var content = createContent(data[0], postId);

        // start building the card
        card.append(createTitle(entry.title));

        if (data[1])
            card.append(createImage(data[1]));

        body.append(content);
        card.append(body);

        // If we have a short version (snippet) of the full text, use it!
        if (entry.contentSnippet) {
            fullText[postId] = data[0];
            content.html(entry.contentSnippet);
            body.append(createOverlay(postId));
        }

        currentItems.push(entry);
        container.append(card);
        postId++;
    }

    inView = insideView();
}

/* Load new blog posts. This method only adds blog entries
 * that is outside the current time range.
 *
 * num is the amount of new entries to try and get
 */
function update(num){
    canUpdate = false;
    if (num) postFetchCount += num;

    loadRSS("http://www.felicious.se/RSS/blog", function(feed){
        $.totalStorage('cached-blog', feed.entries);

        if (currentItems.length > 0) {
            // pre-parse dates, only add blog entries if date is outside this range
            var firstDate = Date.parse(currentItems[0].publishedDate.substr(5, 20));
            var lastDate = Date.parse(currentItems[currentItems.length - 1].publishedDate.substr(5, 20));

            var before = [],
                after = [];

            for (var i = 0; i < feed.entries.length; i++) {
                var entry = feed.entries[i];

                var date = Date.parse(entry.publishedDate.substr(5, 20));
                var cmp = compareDates(firstDate, date);

                switch (cmp) {
                    case 0: break; // same date
                    case 1: // firstDate is later, i.e entry is in the 'past'
                        if (compareDates(lastDate, date) === 1)
                            after.push(entry);
                        break;
                    case -1: // firstDate is earlier, i.e entry is a new post
                        before.push(entry);
                        break;
                }
            }

            renderBlogItems($("#new-items-node"), before);
            renderBlogItems($("#cached-items-node"), after);
        } else {
            renderBlogItems($("#new-items-node"), feed.entries);
        }

        canUpdate = true;
    });
}

/* Infinite Scroll */
$(window).scroll(function () {
    if (canUpdate) {
        var res = insideView();

        if (res && !inView)
            update(5);

        inView = res;
    }
});

/* Render cached blog posts immediately, and fetch new ones. */
$(document).ready(function(){
    $scroller = $("#scroll");
    if ($.totalStorage('cached-blog')) {
        renderBlogItems($("#cached-items-node"), $.totalStorage('cached-blog'));
    }
    update();
});
