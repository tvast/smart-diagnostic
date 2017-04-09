// namespace
var cf;
(function (cf) {
    // interface
    // class
    var Helpers = (function () {
        function Helpers() {
        }
        Helpers.lerp = function (norm, min, max) {
            return (max - min) * norm + min;
        };
        Helpers.norm = function (value, min, max) {
            return (value - min) / (max - min);
        };
        Helpers.getXYFromMouseTouchEvent = function (event) {
            var touches = null;
            if (event.originalEvent)
                touches = event.originalEvent.touches || event.originalEvent.changedTouches;
            else if (event.changedTouches)
                touches = event.changedTouches;
            if (touches) {
                return { x: touches[0].pageX, y: touches[0].pageY, touches: touches[0] };
            }
            else {
                return { x: event.pageX, y: event.pageY, touches: null };
            }
        };
        Helpers.getInnerTextOfElement = function (element) {
            var tmp = document.createElement("DIV");
            tmp.innerHTML = element.innerHTML;
            // return 
            var text = tmp.textContent || tmp.innerText || "";
            // text = String(text).replace('\t','');
            text = String(text).replace(/^\s+|\s+$/g, '');
            return text;
        };
        Helpers.getMouseEvent = function (eventString) {
            var mappings = [];
            mappings["click"] = "ontouchstart" in window ? "touchstart" : "click";
            mappings["mousedown"] = "ontouchstart" in window ? "touchstart" : "mousedown";
            mappings["mouseup"] = "ontouchstart" in window ? "touchend" : "mouseup";
            mappings["mousemove"] = "ontouchstart" in window ? "touchmove" : "mousemove";
            return mappings[eventString];
        };
        Helpers.setEmojiLib = function (lib, scriptSrc) {
            if (lib === void 0) { lib = "emojify"; }
            if (scriptSrc === void 0) { scriptSrc = "//cdnjs.cloudflare.com/ajax/libs/emojify.js/1.1.0/js/emojify.min.js"; }
            var head = document.head || document.getElementsByTagName("head")[0];
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.onload = function () {
                // we use https://github.com/Ranks/emojify.js as a standard
                Helpers.emojilib = window[lib];
                if (Helpers.emojilib) {
                    Helpers.emojilib.setConfig({
                        img_dir: "https://cdnjs.cloudflare.com/ajax/libs/emojify.js/1.1.0/images/basic/",
                    });
                }
            };
            script.setAttribute("src", scriptSrc);
            head.appendChild(script);
        };
        Helpers.emojify = function (str) {
            if (Helpers.emojilib) {
                str = Helpers.emojilib.replace(str);
            }
            return str;
        };
        Helpers.setTransform = function (el, transformString) {
            el.style["-webkit-transform"] = transformString;
            el.style["-moz-transform"] = transformString;
            el.style["-ms-transform"] = transformString;
            el.style["transform"] = transformString;
        };
        return Helpers;
    }());
    Helpers.caniuse = {
        fileReader: function () {
            if (window.File && window.FileReader && window.FileList && window.Blob)
                return true;
            return false;
        }
    };
    Helpers.emojilib = null;
    cf.Helpers = Helpers;
})(cf || (cf = {}));
