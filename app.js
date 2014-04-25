var x2js = new X2JS();

function parseXML(xmlText) {
    var jsonObj = x2js.xml_str2json( xmlText );
    return jsonObj; 
}

function loadRSS(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://script.google.com/a/macros/mcpher.com/s/AKfycbzGgpLEWS0rKSBqXG5PcvJ7Fpe02fvGqiCqq54SVQmBJSpy_6s/exec?url=" + encodeURIComponent(url), true);
    xhr.responseType = 'json';

    xhr.onload = function() {
        //var parser = new DOMParser();
        //var doc = parser.parseFromString(xhr.response.results, "text/xml");

        callback(xhr.response.results);
    };

    xhr.onerror = function() {
        alert('Woops, there was an error making the request.');
    };

    xhr.send();

}

function update(){
    loadRSS("http://www.felicious.se/RSS/blog", function(xmlDoc){
        var feed = parseXML(xmlDoc);
        console.log(feed);
        var blog = feed.rss.channel.item;
        // le hax, we insert all the posts before the sentinel
        var sentinel = document.getElementById("ggsentinel");
        var container = document.getElementById("container");

        blog.forEach(function(entry) {
            // create the class attributes
            var cardClass = document.createAttribute("class");
            cardClass.nodeValue = "mobile-prefix-5 mobile-grid-90 mobile-suffix-5 prefix-5 grid-90 card";
            var contentClass = document.createAttribute("class");
            contentClass.nodeValue = "mobile-prefix-5 mobile-grid-90 prefix-5 grid-90 card-content";
            var imgClass = document.createAttribute("class");
            imgClass.nodeValue = "mobile-prefix-5 mobile-grid-90 prefix-5 grid-90 card-img visible-img";


            var card = document.createElement("div");
            var content = document.createElement("div");
            var title = document.createElement("h1");
            var images = document.createElement("div");

            title.appendChild(document.createTextNode(entry.title.toString()));
            // attempt to split on the image tag
            var data = entry.encoded.__cdata.split("<img");
            var imgSrc, image, srcAtt;
            // if we have an image
            if (data[1]) {
                // extract the src attribute
                imgSrc = data[1].split(" ")[1];
                // remove the preceding src=", and the last "
                imgSrc = imgSrc.substr(5, imgSrc.length-6)

                srcAtt = document.createAttribute("src");
                srcAtt.nodeValue = imgSrc;
                image = document.createElement("img");
                image.setAttributeNode(imgClass);
                image.setAttributeNode(srcAtt);
            }
            // set the text of the blogpost
            content.innerHTML = data[0];
            content.setAttributeNode(contentClass);

            card.appendChild(title)
            if (image) {
                card.appendChild(image);
            }
            card.appendChild(content);
            card.setAttributeNode(cardClass);
            container.insertBefore(card, sentinel);
        });
    });
}

document.onload = update();
