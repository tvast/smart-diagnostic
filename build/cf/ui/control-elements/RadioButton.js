/// <reference path="Button.ts"/>
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
    var RadioButton = (function (_super) {
        __extends(RadioButton, _super);
        function RadioButton() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(RadioButton.prototype, "type", {
            get: function () {
                return "RadioButton";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RadioButton.prototype, "checked", {
            get: function () {
                var _checked = this.el.hasAttribute("checked") && this.el.getAttribute("checked") == "checked";
                return _checked;
            },
            set: function (value) {
                if (!value) {
                    this.el.removeAttribute("checked");
                }
                else {
                    this.el.setAttribute("checked", "checked");
                }
            },
            enumerable: true,
            configurable: true
        });
        RadioButton.prototype.onClick = function (event) {
            this.checked = !this.checked;
            _super.prototype.onClick.call(this, event);
        };
        // override
        RadioButton.prototype.getTemplate = function () {
            var isChecked = this.referenceTag.domElement.checked || this.referenceTag.domElement.hasAttribute("checked");
            return "<cf-radio-button class=\"cf-button\" checked=" + (isChecked ? "checked" : "") + ">\n\t\t\t\t<div>\n\t\t\t\t\t<cf-radio></cf-radio>\n\t\t\t\t\t" + this.referenceTag.label + "\n\t\t\t\t</div>\n\t\t\t</cf-radio-button>\n\t\t\t";
        };
        return RadioButton;
    }(cf.Button));
    cf.RadioButton = RadioButton;
})(cf || (cf = {}));
