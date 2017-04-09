class Wikihelper {

    constructor() {
        this.cacheDom();
        this.initListeners();
    }

    cacheDom() {
        this.cachedDom = document.querySelector("#content");
        return this.cachedDom;
    }

    initListeners() {
        // listener for link hovers
        let display = this.displayInfoBox.bind(this);
        let cachedDom = this.cachedDom;
        let prevSrcElement;
        cachedDom.addEventListener("mouseover", function(e) {
            if(e.srcElement.nodeName == "A" && e.srcElement.title) {
                let ele = e.srcElement;
                prevSrcElement = ele;
                if(ele.attributes.href) {
                    let link = ele.attributes.href.value;
                    let pattern = "/wiki/";
                    let index = link.substring(link.indexOf(pattern)+pattern.length);
                    display(index, e.clientX, e.clientY);
                }
            }
            if(prevSrcElement) {
                if(prevSrcElement.offsetLeft < e.clientX || prevSrcElement.offsetTop < e.clientY) {
                    let eles = document.querySelectorAll(".wikiHelper-box");
                    for( let e of eles ) {
                        if(e) {
                            document.body.removeChild(e);
                        }
                    }
                }
            }
        });
    }

    displayInfoBox(index, x, y) {
        let createBox = this.createBoxElement.bind(this);
        this.getWikiApiData(index, function(data) {
            if(data.text) {
                let text = String(data.text).substring(0, 400) + "...";
                let box = createBox(data.title, text);
                box.style.top = String(y + window.scrollY + 40) + "px";
                box.style.left = String(x + window.scrollX) + "px";
                document.body.appendChild(box);
            }
        });
    }

    getWikiApiData(q, callback) {
        let parse = this.parseWikiApiData.bind(this);
        let API_URL = 'https://'+window.location.host+'/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=' + q;
        $.ajax({
          url: API_URL,
          type: 'GET',
          success: function(data) {
              if(data.query) {
                  let parsedData = parse(data);
                  callback(parsedData);
              }
          },
       });
    }

    parseWikiApiData(data) {
        let page = Object.keys(data.query.pages)[0];
        let info = data.query.pages[page];
        return ({
            title: info.title,
            text: info.extract
        });
    }

    createBoxElement(title, text) {
        let box = document.createElement("div");
        box.className = "wikiHelper-box";
        box.innerHTML = '\
        <div class="wikiHelper-container">\
            <span class="wikiHelper-title">'+title+'</span>\
            <span class="wikiHelper-text">'+text+'</span>\
        </div>\
        ';
        return box;
    }

}

new Wikihelper();
console.log("[Wiki Helper] Loaded.");
