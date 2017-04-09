/// <reference path="Button.ts"/>
/// <reference path="../../logic/Helpers.ts"/>
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
    var UploadFileUI = (function (_super) {
        __extends(UploadFileUI, _super);
        function UploadFileUI(options) {
            var _this = _super.call(this, options) || this;
            _this.maxFileSize = 100000000000;
            _this.loading = false;
            _this.submitTimer = 0;
            _this._fileName = "";
            _this._readerResult = "";
            if (cf.Helpers.caniuse.fileReader()) {
                var maxFileSizeStr = _this.referenceTag.domElement.getAttribute("cf-max-size") || _this.referenceTag.domElement.getAttribute("max-size");
                if (maxFileSizeStr) {
                    var maxFileSize = parseInt(maxFileSizeStr, 10);
                    _this.maxFileSize = maxFileSize;
                }
                _this.progressBar = _this.el.getElementsByTagName("cf-upload-file-progress-bar")[0];
                _this.onDomElementChangeCallback = _this.onDomElementChange.bind(_this);
                _this.referenceTag.domElement.addEventListener("change", _this.onDomElementChangeCallback, false);
            }
            else {
                throw new Error("Conversational Form Error: No FileReader available for client.");
            }
            return _this;
        }
        Object.defineProperty(UploadFileUI.prototype, "value", {
            get: function () {
                return this.referenceTag.domElement.value; //;this.readerResult || this.fileName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UploadFileUI.prototype, "readerResult", {
            get: function () {
                return this._readerResult;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UploadFileUI.prototype, "files", {
            get: function () {
                return this._files;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UploadFileUI.prototype, "fileName", {
            get: function () {
                return this._fileName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UploadFileUI.prototype, "type", {
            get: function () {
                return "UploadFileUI";
            },
            enumerable: true,
            configurable: true
        });
        UploadFileUI.prototype.getFilesAsString = function () {
            // value is for the chat response -->
            var icon = document.createElement("span");
            icon.innerHTML = cf.Dictionary.get("icon-type-file") + this.fileName;
            return icon.outerHTML;
        };
        UploadFileUI.prototype.onDomElementChange = function (event) {
            var _this = this;
            console.log("...onDomElementChange");
            var reader = new FileReader();
            this._files = this.referenceTag.domElement.files;
            reader.onerror = function (event) {
                console.log("onerror", event);
            };
            reader.onprogress = function (event) {
                console.log("onprogress", event);
                _this.progressBar.style.width = ((event.loaded / event.total) * 100) + "%";
            };
            reader.onabort = function (event) {
                console.log("onabort", event);
            };
            reader.onloadstart = function (event) {
                // check for file size
                var file = _this.files[0];
                var fileSize = file ? file.size : _this.maxFileSize + 1; // if file is undefined then abort ...
                if (fileSize > _this.maxFileSize) {
                    reader.abort();
                    var dto = {
                        errorText: cf.Dictionary.get("input-placeholder-file-size-error")
                    };
                    cf.ConversationalForm.illustrateFlow(_this, "dispatch", cf.FlowEvents.USER_INPUT_INVALID, dto);
                    _this.eventTarget.dispatchEvent(new CustomEvent(cf.FlowEvents.USER_INPUT_INVALID, {
                        detail: dto
                    }));
                }
                else {
                    // good to go
                    _this._fileName = file.name;
                    _this.loading = true;
                    _this.animateIn();
                    // set text
                    var sizeConversion = Math.floor(Math.log(fileSize) / Math.log(1024));
                    var sizeChart = ["b", "kb", "mb", "gb"];
                    sizeConversion = Math.min(sizeChart.length - 1, sizeConversion);
                    var humanSizeString = Number((fileSize / Math.pow(1024, sizeConversion)).toFixed(2)) * 1 + " " + sizeChart[sizeConversion];
                    var text = file.name + " (" + humanSizeString + ")";
                    _this.el.getElementsByTagName("cf-upload-file-text")[0].innerHTML = text;
                    _this.eventTarget.dispatchEvent(new CustomEvent(cf.ControlElementEvents.PROGRESS_CHANGE, {
                        detail: cf.ControlElementProgressStates.BUSY
                    }));
                }
            };
            reader.onload = function (event) {
                _this._readerResult = event.target.result;
                _this.progressBar.classList.add("loaded");
                _this.submitTimer = setTimeout(function () {
                    _this.el.classList.remove("animate-in");
                    _this.onChoose(); // submit the file
                    _this.eventTarget.dispatchEvent(new CustomEvent(cf.ControlElementEvents.PROGRESS_CHANGE, {
                        detail: cf.ControlElementProgressStates.READY
                    }));
                }, 0);
            };
            reader.readAsDataURL(this.files[0]);
        };
        UploadFileUI.prototype.animateIn = function () {
            if (this.loading)
                _super.prototype.animateIn.call(this);
        };
        UploadFileUI.prototype.onClick = function (event) {
            // super.onClick(event);
        };
        UploadFileUI.prototype.triggerFileSelect = function () {
            // trigger file prompt
            this.referenceTag.domElement.click();
        };
        // override
        UploadFileUI.prototype.dealloc = function () {
            clearTimeout(this.submitTimer);
            this.progressBar = null;
            if (this.onDomElementChangeCallback) {
                this.referenceTag.domElement.removeEventListener("change", this.onDomElementChangeCallback, false);
                this.onDomElementChangeCallback = null;
            }
            _super.prototype.dealloc.call(this);
        };
        UploadFileUI.prototype.getTemplate = function () {
            var isChecked = this.referenceTag.value == "1" || this.referenceTag.domElement.hasAttribute("checked");
            return "<cf-upload-file-ui>\n\t\t\t\t<cf-upload-file-text></cf-upload-file-text>\n\t\t\t\t<cf-upload-file-progress>\n\t\t\t\t\t<cf-upload-file-progress-bar></cf-upload-file-progress-bar>\n\t\t\t\t</cf-upload-file-progress>\n\t\t\t</cf-upload-file-ui>\n\t\t\t";
        };
        return UploadFileUI;
    }(cf.Button));
    cf.UploadFileUI = UploadFileUI;
})(cf || (cf = {}));
