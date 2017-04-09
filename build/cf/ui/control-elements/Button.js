/// <reference path="ControlElement.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// namespace
var cf;
(function (cf) {
    // interface
    // class
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(options) {
            var _this = _super.call(this, options) || this;
            _this.clickCallback = _this.onClick.bind(_this);
            _this.el.addEventListener("click", _this.clickCallback, false);
            _this.mouseDownCallback = _this.onMouseDown.bind(_this);
            _this.el.addEventListener("mousedown", _this.mouseDownCallback, false);
            //image
            _this.checkForImage();
            return _this;
        }
        Object.defineProperty(Button.prototype, "type", {
            get: function () {
                return "Button";
            },
            enumerable: true,
            configurable: true
        });
        Button.prototype.hasImage = function () {
            return this.referenceTag.hasImage;
        };
        /**
        * @name checkForImage
        * checks if element has cf-image, if it has then change UI
        */
        Button.prototype.checkForImage = function () {
            var hasImage = this.hasImage();
            if (hasImage) {
                this.el.classList.add("has-image");
                this.imgEl = document.createElement("img");
                this.imageLoadedCallback = this.onImageLoaded.bind(this);
                this.imgEl.classList.add("cf-image");
                this.imgEl.addEventListener("load", this.imageLoadedCallback, false);
                this.imgEl.src = this.referenceTag.domElement.getAttribute("cf-image");
                this.el.insertBefore(this.imgEl, this.el.children[0]);
            }
        };
        Button.prototype.onImageLoaded = function () {
            this.imgEl.classList.add("loaded");
            this.eventTarget.dispatchEvent(new CustomEvent(cf.ControlElementEvents.ON_LOADED, {}));
        };
        Button.prototype.onMouseDown = function (event) {
            event.preventDefault();
        };
        Button.prototype.onClick = function (event) {
            this.onChoose();
        };
        Button.prototype.dealloc = function () {
            this.el.removeEventListener("click", this.clickCallback, false);
            this.clickCallback = null;
            if (this.imageLoadedCallback) {
                this.imgEl.removeEventListener("load", this.imageLoadedCallback, false);
                this.imageLoadedCallback = null;
            }
            this.el.removeEventListener("mousedown", this.mouseDownCallback, false);
            this.mouseDownCallback = null;
            _super.prototype.dealloc.call(this);
        };
        // override
        Button.prototype.getTemplate = function () {
            return "<cf-button class=\"cf-button\">\n\t\t\t\t" + this.referenceTag.label + "\n\t\t\t</cf-button>\n\t\t\t";
        };
        return Button;
    }(cf.ControlElement));
    cf.Button = Button;
})(cf || (cf = {}));
