/**
 * Copyright (c) 2014 handelsbolaget shai. All rights reserved.
 */

var fullText = [],
    postId = 0,
    postFetchCount = 5,
    canUpdate = true,
    inView = true,
    $window = $(window),
    $scroller;

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
    var gurl="http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q="+url+"&num=" + postFetchCount;

    $.getJSON(gurl, function(data) {
        if (data.responseData.feed) {
            callback(data.responseData.feed)
        }
    });
}

/* Return {3|4|2014|14|33|13} from "03 Apr 2014 14:33:13" */
function parseDate(value) {
    var months = {
        "Jan" : 1,  "Feb" : 2,  "Mar" : 3,
        "Apr" : 4,  "May" : 5,  "Jun" : 6,
        "Jul" : 7,  "Aug" : 8,  "Sep" : 9,
        "Oct" : 10, "Nov" : 11, "Dec" : 12 
    }

    // parse float to remove preceeding 0
    return {
        "day" : parseFloat(value.substr(0, 2)),
        "month" : months[value.substr(3, 3)],
        "year" : value.substr(7, 4),

        "hour" : parseFloat(value.substr(12, 2)),
        "min" : parseFloat(value.substr(15, 2)),
        "sec" : parseFloat(value.substr(18, 2))
    }
}

/* Compare two dates and return 0, 1 or -1 depending on their
 * natural ordering. 0 if equal, 1 if later, -1 if earlier
 */
function compareDates(date1, date2) {
    if (typeof date1 == "string")
        date1 = parseDate(date1.substr(5, 20));

    if (typeof date2 == "string")
        date2 = parseDate(date2.substr(5, 20));

    // compare amount of seconds that differ the two times
    var time1 = date1.sec + date1.min * 60 + date1.hour * 3600
                + date1.day * 24 * 3600 + date1.month * 30.5 * 24 * 3600
                + date1.year * 12 * 30.5 * 24 * 3600;

     var time2 = date2.sec + date2.min * 60 + date2.hour * 3600
                + date2.day * 24 * 3600 + date2.month * 30.5 * 24 * 3600
                + date2.year * 12 * 30.5 * 24 * 3600;

    var diff = time1 - time2;

    if (diff < 0) return -1;
    else if (diff > 0) return 1;
    else return 0;
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

    var image = $("<div>").addClass("card-image");
    image.css("background-image", "url('" + imgSrc + "')");

    return image;
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
        var currentItems = $.totalStorage('cached-blog');
        $.totalStorage('cached-blog', feed.entries);

        if (currentItems) {
            // pre-parse dates, only add blog entries if date is outside this range
            var firstDate = parseDate(currentItems[0].publishedDate.substr(5, 20));
            var lastDate = parseDate(currentItems[currentItems.length - 1].publishedDate.substr(5, 20));

            var before = [],
                after = [];

            for (var i = 0; i < feed.entries.length; i++) {
                var entry = feed.entries[i];

                var date = parseDate(entry.publishedDate.substr(5, 20));
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
