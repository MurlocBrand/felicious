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
    });
    //console.log(rss);
}

document.onload = update();