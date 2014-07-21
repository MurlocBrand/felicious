/**
 * Copyright (c) 2014 handelsbolaget shai. All rights reserved.
 */

var fullText = [];
var postId = 0;
var postFetchCount = 5;
var canUpdate = true;

var DUMMY_CONTENT = [{"title":"Feedback","link":"http://www.felicious.se/2014/04/03/feedback-21204238","author":"","publishedDate":"Thu, 03 Apr 2014 14:33:13 -0700","contentSnippet":"Feedback från några av våra kunder!\n\n\"Att deras service är på hög nivå! Man känner sig välkommen till max!!\"\n16 mars ...","content":"<p>Feedback från några av våra kunder!<br>\n<br>\n\"Att deras service är på hög nivå! Man känner sig välkommen till max!!\"<br>\n16 mars 2014<br>\n<br>\n\"Annamari är duktig och klipper bra, lättskött frisyr\"<br>\n15 mars 2014<br>\n<br>\nTack - tror jag hittat min nya frisör - supernöjd! :)<br>\n20 mars 2014<br>\n<br>\n\"Felicia lyckades fånga rätt färg och en klippning som jag blev mycket nöjd med. Trots att jag inte hade klart för mig vad jag ville. Trolleri!!! Dessutom fick jag koppla av - utan en massa prat! \"<br>\n23 mars 2014<br>\n<br>\nVärt ett besök!<br>\n31 mars 2014<br>\n<br>\nTack snälla för alla fina ord! Jag och Annamari är glada och stolta att kunna göra våra kunder nöjda.<br>\n </p>\n<p><img src=\"http://h24-original.s3.amazonaws.com/45120/14777648-eRjSa.jpg?name=.jpg\" alt=\"\" width=\"866\" height=\"936\"></p>","categories":[]},{"title":"Vår på Felicious","link":"http://www.felicious.se/2014/03/31/v%C3%A5r-p%C3%A5-felicious-21154384","author":"","publishedDate":"Mon, 31 Mar 2014 13:13:41 -0700","contentSnippet":"Vilket h&auml;rligt v&auml;der vi haft och har framf&ouml;r oss! Det m&auml;rks att pulsen i centrum h&ouml;js! \nFelicious ...","content":"<p>Vilket härligt väder vi haft och har framför oss! Det märks att pulsen i centrum höjs! </p>\n<p>Felicious välkomnar gamla som nya kunder att klippa och färga för att liva upp det trötta vinter håret! Vi hjälper gärna till med nya förslag och förändring. </p>\n<p>Den 27 mars var Felicious med på Noa Noa&#39;s vår visning där vi ansvarade för hår uppsättningar/styling! Härlig kväll och mer kommer!</p>\n<p>Hoppas vi ses snart! Tänk på att boka tid lite i förväg då det är många som redan bokat tider! </p>\n<p></p>\n<p></p>\n<p></p>","categories":[]},{"title":"Jul på Felicious","link":"http://www.felicious.se/2013/11/29/jul-p%C3%A5-felicious-19455646","author":"","publishedDate":"Fri, 29 Nov 2013 11:27:20 -0800","contentSnippet":"Nu &auml;r julen kommen p&aring; Felicious! \nBoka tid redan i helgen f&ouml;r klipp / f&auml;rg behandling inf&ouml;r jul / ...","content":"<p>Nu är julen kommen på Felicious! </p>\n<p>Boka tid redan i helgen för klipp / färg behandling inför jul / nyår! </p>\n<p>Trevlig helg! </p>\n<p></p>","categories":[]},{"title":"Nyårs Uppsättning","link":"http://www.felicious.se/2013/11/21/ny%C3%A5rs-upps%C3%A4ttning-19351381","author":"","publishedDate":"Thu, 21 Nov 2013 03:46:10 -0800","contentSnippet":"Det börjar närma sig December och Julens månad.\n\nVi har en hel del härliga erbjudande med bra rabatter på produkter för både ...","content":"Det börjar närma sig December och Julens månad.<br>\n<br>\nVi har en hel del härliga erbjudande med bra rabatter på produkter för både kvinnor och män.<br>\n<br>\nVi har öppet även Nyårsafton för uppsättningar, pris 650 kr.<br>\n<br>\nFinns några tider kvar så passa på och ring in för att boka du med!<p><img src=\"http://h24-original.s3.amazonaws.com/45120/13502373-1SWR8.jpg?name=.jpg\" alt=\"\" width=\"960\" height=\"638\"></p>","categories":[]}];
var DUMMY_ENTRY = {"title":"Ska du på bal i vår?","link":"http://www.felicious.se/2014/04/03/ska-du-p%C3%A5-bal-i-v%C3%A5r--21204461","author":"","publishedDate":"Thu, 03 Apr 2014 14:56:17 -0700","contentSnippet":"Felicious hjälper dig med uppsättning till balen så du kan känna dig avkopplad.\nVi har stor erfarenhet av både bal och ...","content":"<p>Felicious hjälper dig med uppsättning till balen så du kan känna dig avkopplad.<br>\nVi har stor erfarenhet av både bal och bröllopsuppsättningar.<br>\n<br>\nHär är bilder från senaste baluppsättningar som vi gjort.<br>\n<br>\nPris: 595 kr<br>\n </p>\n<p><img src=\"http://h24-original.s3.amazonaws.com/45120/14777743-UQsZF.jpg?name=.jpg\" alt=\"\" width=\"960\" height=\"960\"></p>","categories":[]};

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
    date1 = parseDate(date1.substr(5, 20));
    date2 = parseDate(date2.substr(5, 20));

    // compare amount of seconds that differ the two times
    var time1 = date1.sec + date1.min * 60 + date1.hour * 3600
                + date1.day * 24 * 3600 + date1.month * 30.5 * 24 * 3600
                + date1.year * 12 * 30.5 * 24 * 3600;

     var time2 = date2.sec + date2.min * 60 + date2.hour * 3600
                + date2.day * 24 * 3600 + date2.month * 30.5 * 24 * 3600
                + date2.year * 12 * 30.5 * 24 * 3600;

    return time1 - time2;
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
    $.totalStorage.deleteItem('cached-blog');

    $.totalStorage('cached-blog', DUMMY_CONTENT);

    if ($.totalStorage('cached-blog')) {
        renderBlogItems($("#cached-items-node"), $.totalStorage('cached-blog'));
    }

    //postFetchCount += 20;
    // update();
});
