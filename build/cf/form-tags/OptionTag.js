/// <reference path="Tag.ts"/>
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
    var OptionTag = (function (_super) {
        __extends(OptionTag, _super);
        function OptionTag() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(OptionTag.prototype, "type", {
            get: function () {
                return "option";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OptionTag.prototype, "label", {
            get: function () {
                return cf.Helpers.getInnerTextOfElement(this.domElement);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(OptionTag.prototype, "selected", {
            get: function () {
                return this.domElement.selected;
            },
            set: function (value) {
                if (value)
                    this.domElement.setAttribute("selected", "selected");
                else
                    this.domElement.removeAttribute("selected");
            },
            enumerable: true,
            configurable: true
        });
        OptionTag.prototype.setTagValueAndIsValid = function (value) {
            var isValid = true;
            // OBS: No need to set any validation og value for this tag type ..
            // .. it is atm. only used to create pseudo elements in the OptionsList
            return isValid;
        };
        return OptionTag;
    }(cf.Tag));
    cf.OptionTag = OptionTag;
})(cf || (cf = {}));
