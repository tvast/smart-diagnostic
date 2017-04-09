/// <reference path="../data/Dictionary.ts"/>
/// <reference path="InputTag.ts"/>
/// <reference path="ButtonTag.ts"/>
/// <reference path="SelectTag.ts"/>
/// <reference path="OptionTag.ts"/>
/// <reference path="../ConversationalForm.ts"/>
/// <reference path="../logic/EventDispatcher.ts"/>
// basic tag from form logic
// types:
// radio
// text
// email
// tel
// password
// checkbox
// radio
// select
// button
// namespace
var cf;
(function (cf) {
    cf.TagEvents = {
        ORIGINAL_ELEMENT_CHANGED: "cf-tag-dom-element-changed"
    };
    // class
    var Tag = (function () {
        function Tag(options) {
            this.domElement = options.domElement;
            this.changeCallback = this.onDomElementChange.bind(this);
            this.domElement.addEventListener("change", this.changeCallback, false);
            // remove tabIndex from the dom element.. danger zone... should we or should we not...
            this.domElement.tabIndex = -1;
            // questions array
            if (options.questions)
                this.questions = options.questions;
            // custom tag validation
            if (this.domElement.getAttribute("cf-validation")) {
                // set it through an attribute, danger land with eval
                this.validationCallback = eval(this.domElement.getAttribute("cf-validation"));
            }
            // reg ex pattern is set on the Tag, so use it in our validation
            if (this.domElement.getAttribute("pattern"))
                this.pattern = new RegExp(this.domElement.getAttribute("pattern"));
            // if(this.type == "email" && !this.pattern){
            // 	// set a standard e-mail pattern for email type input
            // 	this.pattern = new RegExp("^[^@]+@[^@]+\.[^@]+$");
            // }
            if (this.type != "group" && cf.ConversationalForm.illustrateAppFlow) {
                console.log('Conversational Form > Tag registered:', this.type, this);
            }
            this.refresh();
        }
        Object.defineProperty(Tag.prototype, "type", {
            get: function () {
                return this.domElement.getAttribute("type") || this.domElement.tagName.toLowerCase();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "name", {
            get: function () {
                return this.domElement.getAttribute("name");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "inputPlaceholder", {
            get: function () {
                return this._inputPlaceholder;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "label", {
            get: function () {
                if (!this._label)
                    this.findAndSetLabel();
                if (this._label)
                    return this._label;
                return cf.Dictionary.getRobotResponse(this.type);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "value", {
            get: function () {
                return this.domElement.value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "hasImage", {
            get: function () {
                return this.domElement.hasAttribute("cf-image");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "disabled", {
            get: function () {
                return this.domElement.getAttribute("disabled") != undefined && this.domElement.getAttribute("disabled") != null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "required", {
            get: function () {
                return !!this.domElement.getAttribute("required") || this.domElement.getAttribute("required") == "";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "question", {
            get: function () {
                // if questions are empty, then fall back to dictionary, every time
                if (!this.questions || this.questions.length == 0)
                    return cf.Dictionary.getRobotResponse(this.type);
                else
                    return this.questions[Math.floor(Math.random() * this.questions.length)];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "eventTarget", {
            set: function (value) {
                this._eventTarget = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "errorMessage", {
            get: function () {
                if (!this.errorMessages) {
                    // custom tag error messages
                    if (this.domElement.getAttribute("cf-error")) {
                        this.errorMessages = this.domElement.getAttribute("cf-error").split("|");
                    }
                    else if (this.domElement.parentNode && this.domElement.parentNode.getAttribute("cf-error")) {
                        this.errorMessages = this.domElement.parentNode.getAttribute("cf-error").split("|");
                    }
                    else if (this.required) {
                        this.errorMessages = [cf.Dictionary.get("input-placeholder-required")];
                    }
                    else {
                        if (this.type == "file")
                            this.errorMessages = [cf.Dictionary.get("input-placeholder-file-error")];
                        else {
                            this.errorMessages = [cf.Dictionary.get("input-placeholder-error")];
                        }
                    }
                }
                return this.errorMessages[Math.floor(Math.random() * this.errorMessages.length)];
            },
            enumerable: true,
            configurable: true
        });
        Tag.prototype.dealloc = function () {
            this.domElement.removeEventListener("change", this.changeCallback, false);
            this.changeCallback = null;
            this.domElement = null;
            this.defaultValue = null;
            this.errorMessages = null;
            this.pattern = null;
            this._label = null;
            this.validationCallback = null;
            this.questions = null;
        };
        Tag.isTagValid = function (element) {
            if (element.getAttribute("type") === "hidden")
                return false;
            if (element.getAttribute("type") === "submit")
                return false;
            // ignore buttons, we submit the form automatially
            if (element.getAttribute("type") == "button")
                return false;
            if (element.style.display === "none")
                return false;
            if (element.style.visibility === "hidden")
                return false;
            var innerText = cf.Helpers.getInnerTextOfElement(element);
            if (element.tagName.toLowerCase() == "option" && (innerText == "" || innerText == " ")) {
                return false;
            }
            if (element.tagName.toLowerCase() == "select" || element.tagName.toLowerCase() == "option")
                return true;
            else {
                return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
            }
        };
        Tag.createTag = function (element) {
            if (Tag.isTagValid(element)) {
                // ignore hidden tags
                var tag = void 0;
                if (element.tagName.toLowerCase() == "input") {
                    tag = new cf.InputTag({
                        domElement: element
                    });
                }
                else if (element.tagName.toLowerCase() == "textarea") {
                    tag = new cf.InputTag({
                        domElement: element
                    });
                }
                else if (element.tagName.toLowerCase() == "select") {
                    tag = new cf.SelectTag({
                        domElement: element
                    });
                }
                else if (element.tagName.toLowerCase() == "button") {
                    tag = new cf.ButtonTag({
                        domElement: element
                    });
                }
                else if (element.tagName.toLowerCase() == "option") {
                    tag = new cf.OptionTag({
                        domElement: element
                    });
                }
                return tag;
            }
            else {
                // console.warn("Tag is not valid!: "+ element);
                return null;
            }
        };
        Tag.prototype.refresh = function () {
            // default value of Tag, check every refresh
            this.defaultValue = this.domElement.value;
            this.questions = null;
            this.findAndSetQuestions();
        };
        Tag.prototype.setTagValueAndIsValid = function (dto) {
            // this sets the value of the tag in the DOM
            // validation
            var isValid = true;
            var valueText = dto.text;
            if (this.pattern) {
                isValid = this.pattern.test(valueText);
            }
            if (valueText == "" && this.required) {
                isValid = false;
            }
            var min = parseInt(this.domElement.getAttribute("min"), 10) || -1;
            var max = parseInt(this.domElement.getAttribute("max"), 10) || -1;
            if (min != -1 && valueText.length < min) {
                isValid = false;
            }
            if (max != -1 && valueText.length > max) {
                isValid = false;
            }
            if (isValid) {
                // we cannot set the dom element value when type is file
                if (this.type != "file")
                    this.domElement.value = valueText;
            }
            else {
                // throw new Error("cf-: value:string is not valid. Value: "+value);
            }
            return isValid;
        };
        Tag.prototype.findAndSetQuestions = function () {
            if (this.questions)
                return;
            // <label tag with label:for attribute to el:id
            // check for label tag, we only go 2 steps backwards..
            // from standardize markup: http://www.w3schools.com/tags/tag_label.asp
            if (this.domElement.getAttribute("cf-questions")) {
                this.questions = this.domElement.getAttribute("cf-questions").split("|");
                if (this.domElement.getAttribute("cf-input-placeholder"))
                    this._inputPlaceholder = this.domElement.getAttribute("cf-input-placeholder");
            }
            else if (this.domElement.parentNode && this.domElement.parentNode.getAttribute("cf-questions")) {
                // for groups the parentNode can have the cf-questions..
                var parent_1 = this.domElement.parentNode;
                this.questions = parent_1.getAttribute("cf-questions").split("|");
                if (parent_1.getAttribute("cf-input-placeholder"))
                    this._inputPlaceholder = parent_1.getAttribute("cf-input-placeholder");
            }
            else {
                // questions not set, so find it in the DOM
                // try a broader search using for and id attributes
                var elId = this.domElement.getAttribute("id");
                var forLabel = document.querySelector("label[for='" + elId + "']");
                if (forLabel) {
                    this.questions = [cf.Helpers.getInnerTextOfElement(forLabel)];
                }
            }
            if (!this.questions && this.domElement.getAttribute("placeholder")) {
                // check for placeholder attr if questions are still undefined
                this.questions = [this.domElement.getAttribute("placeholder")];
            }
        };
        Tag.prototype.findAndSetLabel = function () {
            // find label..
            if (this.domElement.getAttribute("cf-label")) {
                this._label = this.domElement.getAttribute("cf-label");
            }
            else {
                var parentDomNode = this.domElement.parentNode;
                if (parentDomNode) {
                    // step backwards and check for label tag.
                    var labelTags = parentDomNode.getElementsByTagName("label");
                    if (labelTags.length == 0) {
                        // check for innerText
                        var innerText = cf.Helpers.getInnerTextOfElement(parentDomNode);
                        if (innerText && innerText.length > 0)
                            labelTags = [parentDomNode];
                    }
                    if (labelTags.length > 0 && labelTags[0])
                        this._label = cf.Helpers.getInnerTextOfElement(labelTags[0]);
                }
            }
        };
        /**
        * @name onDomElementChange
        * on dom element value change event, ex. w. browser autocomplete mode
        */
        Tag.prototype.onDomElementChange = function () {
            this._eventTarget.dispatchEvent(new CustomEvent(cf.TagEvents.ORIGINAL_ELEMENT_CHANGED, {
                detail: {
                    value: this.value,
                    tag: this
                }
            }));
        };
        return Tag;
    }());
    cf.Tag = Tag;
})(cf || (cf = {}));
