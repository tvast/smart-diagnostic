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
    var InputTag = (function (_super) {
        __extends(InputTag, _super);
        function InputTag(options) {
            var _this = _super.call(this, options) || this;
            if (_this.type == "text") {
            }
            else if (_this.type == "email") {
            }
            else if (_this.type == "tel") {
            }
            else if (_this.type == "checkbox") {
            }
            else if (_this.type == "radio") {
            }
            else if (_this.type == "password") {
            }
            else if (_this.type == "file") {
                // check InputFileTag.ts
            }
            return _this;
        }
        InputTag.prototype.findAndSetQuestions = function () {
            _super.prototype.findAndSetQuestions.call(this);
            // special use cases for <input> tag add here...
        };
        InputTag.prototype.findAndSetLabel = function () {
            _super.prototype.findAndSetLabel.call(this);
            if (!this._label) {
                // special use cases for <input> tag add here...
            }
        };
        InputTag.prototype.setTagValueAndIsValid = function (value) {
            if (this.type == "checkbox") {
                // checkbox is always true..
                return true;
            }
            else {
                return _super.prototype.setTagValueAndIsValid.call(this, value);
            }
        };
        InputTag.prototype.dealloc = function () {
            _super.prototype.dealloc.call(this);
        };
        return InputTag;
    }(cf.Tag));
    cf.InputTag = InputTag;
})(cf || (cf = {}));
