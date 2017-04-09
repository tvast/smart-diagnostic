/// <reference path="BasicElement.ts"/>
/// <reference path="control-elements/ControlElements.ts"/>
/// <reference path="../logic/FlowManager.ts"/>
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
    cf.UserInputEvents = {
        SUBMIT: "cf-input-user-input-submit",
        KEY_CHANGE: "cf-input-key-change",
        CONTROL_ELEMENTS_ADDED: "cf-input-control-elements-added",
        HEIGHT_CHANGE: "cf-input-height-change",
    };
    // class
    var UserInput = (function (_super) {
        __extends(UserInput, _super);
        function UserInput(options) {
            var _this = _super.call(this, options) || this;
            _this.errorTimer = 0;
            _this.initialInputHeight = 0;
            _this.shiftIsDown = false;
            _this._disabled = false;
            //acts as a fallb ack for ex. shadow dom implementation
            _this._active = false;
            _this.cfReference = options.cfReference;
            _this.eventTarget = options.eventTarget;
            _this.inputElement = _this.el.getElementsByTagName("textarea")[0];
            _this.onInputFocusCallback = _this.onInputFocus.bind(_this);
            _this.onInputBlurCallback = _this.onInputBlur.bind(_this);
            _this.inputElement.addEventListener('focus', _this.onInputFocusCallback, false);
            _this.inputElement.addEventListener('blur', _this.onInputBlurCallback, false);
            //<cf-input-control-elements> is defined in the ChatList.ts
            _this.controlElements = new cf.ControlElements({
                el: _this.el.getElementsByTagName("cf-input-control-elements")[0],
                infoEl: _this.el.getElementsByTagName("cf-info")[0],
                eventTarget: _this.eventTarget
            });
            // setup event listeners
            _this.windowFocusCallback = _this.windowFocus.bind(_this);
            window.addEventListener('focus', _this.windowFocusCallback, false);
            _this.keyUpCallback = _this.onKeyUp.bind(_this);
            document.addEventListener("keyup", _this.keyUpCallback, false);
            _this.keyDownCallback = _this.onKeyDown.bind(_this);
            document.addEventListener("keydown", _this.keyDownCallback, false);
            _this.flowUpdateCallback = _this.onFlowUpdate.bind(_this);
            _this.eventTarget.addEventListener(cf.FlowEvents.FLOW_UPDATE, _this.flowUpdateCallback, false);
            _this.onOriginalTagChangedCallback = _this.onOriginalTagChanged.bind(_this);
            _this.eventTarget.addEventListener(cf.TagEvents.ORIGINAL_ELEMENT_CHANGED, _this.onOriginalTagChangedCallback, false);
            _this.inputInvalidCallback = _this.inputInvalid.bind(_this);
            _this.eventTarget.addEventListener(cf.FlowEvents.USER_INPUT_INVALID, _this.inputInvalidCallback, false);
            _this.onControlElementSubmitCallback = _this.onControlElementSubmit.bind(_this);
            _this.eventTarget.addEventListener(cf.ControlElementEvents.SUBMIT_VALUE, _this.onControlElementSubmitCallback, false);
            _this.onControlElementProgressChangeCallback = _this.onControlElementProgressChange.bind(_this);
            _this.eventTarget.addEventListener(cf.ControlElementEvents.PROGRESS_CHANGE, _this.onControlElementProgressChangeCallback, false);
            _this.submitButton = _this.el.getElementsByTagName("cf-input-button")[0];
            _this.onSubmitButtonClickCallback = _this.onSubmitButtonClick.bind(_this);
            _this.submitButton.addEventListener("click", _this.onSubmitButtonClickCallback, false);
            return _this;
        }
        Object.defineProperty(UserInput.prototype, "active", {
            get: function () {
                return this.inputElement === document.activeElement || this._active;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UserInput.prototype, "visible", {
            set: function (value) {
                if (!this.el.classList.contains("animate-in") && value)
                    this.el.classList.add("animate-in");
                else if (this.el.classList.contains("animate-in") && !value)
                    this.el.classList.remove("animate-in");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UserInput.prototype, "currentTag", {
            get: function () {
                return this._currentTag;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UserInput.prototype, "disabled", {
            set: function (value) {
                var hasChanged = this._disabled != value;
                if (hasChanged) {
                    this._disabled = value;
                    if (value) {
                        this.el.setAttribute("disabled", "disabled");
                        this.inputElement.blur();
                    }
                    else {
                        this.setFocusOnInput();
                        this.el.removeAttribute("disabled");
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        UserInput.prototype.getInputValue = function () {
            var str = this.inputElement.value;
            // Build-in way to handle XSS issues ->
            var div = document.createElement('div');
            div.appendChild(document.createTextNode(str));
            return div.innerHTML;
        };
        UserInput.prototype.getFlowDTO = function () {
            var value; // = this.inputElement.value;
            // check for values on control elements as they should overwrite the input value.
            if (this.controlElements && this.controlElements.active) {
                value = this.controlElements.getDTO();
            }
            else {
                value = {
                    text: this.getInputValue()
                };
            }
            value.input = this;
            return value;
        };
        UserInput.prototype.reset = function () {
            if (this.controlElements) {
                this.controlElements.clearTagsAndReset();
            }
        };
        UserInput.prototype.onFlowStopped = function () {
            if (this.controlElements)
                this.controlElements.clearTagsAndReset();
            this.disabled = true;
        };
        /**
        * @name onOriginalTagChanged
        * on domElement from a Tag value changed..
        */
        UserInput.prototype.onOriginalTagChanged = function (event) {
            if (this.currentTag == event.detail.tag) {
                this.onInputChange();
            }
            if (this.controlElements && this.controlElements.active) {
                this.controlElements.updateStateOnElementsFromTag(event.detail.tag);
            }
        };
        UserInput.prototype.onInputChange = function () {
            if (!this.active && !this.controlElements.active)
                return;
            // safari likes to jump around with the scrollHeight value, let's keep it in check with an initial height.
            var oldHeight = Math.max(this.initialInputHeight, parseInt(this.inputElement.style.height, 10));
            this.inputElement.style.height = "0px";
            this.inputElement.style.height = (this.inputElement.scrollHeight === 0 ? oldHeight : this.inputElement.scrollHeight) + "px";
            cf.ConversationalForm.illustrateFlow(this, "dispatch", cf.UserInputEvents.HEIGHT_CHANGE);
            this.eventTarget.dispatchEvent(new CustomEvent(cf.UserInputEvents.HEIGHT_CHANGE, {
                detail: this.inputElement.scrollHeight
            }));
        };
        UserInput.prototype.inputInvalid = function (event) {
            var _this = this;
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
            var dto = event.detail;
            this.inputElement.setAttribute("data-value", this.inputElement.value);
            this.inputElement.value = "";
            this.el.setAttribute("error", "");
            this.disabled = true;
            // cf-error
            this.inputElement.setAttribute("placeholder", dto.errorText || this._currentTag.errorMessage);
            clearTimeout(this.errorTimer);
            this.errorTimer = setTimeout(function () {
                _this.disabled = false;
                _this.el.removeAttribute("error");
                _this.inputElement.value = _this.inputElement.getAttribute("data-value");
                _this.inputElement.setAttribute("data-value", "");
                _this.setPlaceholder();
                _this.setFocusOnInput();
                if (_this.controlElements)
                    _this.controlElements.resetAfterErrorMessage();
            }, UserInput.ERROR_TIME);
        };
        UserInput.prototype.setPlaceholder = function () {
            if (this._currentTag) {
                if (this._currentTag.inputPlaceholder) {
                    this.inputElement.setAttribute("placeholder", this._currentTag.inputPlaceholder);
                }
                else {
                    this.inputElement.setAttribute("placeholder", this._currentTag.type == "group" ? cf.Dictionary.get("group-placeholder") : cf.Dictionary.get("input-placeholder"));
                }
            }
            else {
                this.inputElement.setAttribute("placeholder", cf.Dictionary.get("group-placeholder"));
            }
        };
        UserInput.prototype.checkForCorrectInputTag = function () {
            // handle password natively
            var currentType = this.inputElement.getAttribute("type");
            var isCurrentInputTypeTextAreaButNewTagPassword = this._currentTag.type == "password" && currentType != "password";
            var isCurrentInputTypeInputButNewTagNotPassword = this._currentTag.type != "password" && currentType == "password";
            // remove focus and blur events, because we want to create a new element
            if (this.inputElement && (isCurrentInputTypeTextAreaButNewTagPassword || isCurrentInputTypeInputButNewTagNotPassword)) {
                this.inputElement.removeEventListener('focus', this.onInputFocusCallback, false);
                this.inputElement.removeEventListener('blur', this.onInputBlurCallback, false);
            }
            if (isCurrentInputTypeTextAreaButNewTagPassword) {
                // change to input
                var input_1 = document.createElement("input");
                Array.prototype.slice.call(this.inputElement.attributes).forEach(function (item) {
                    input_1.setAttribute(item.name, item.value);
                });
                input_1.setAttribute("autocomplete", "new-password");
                this.inputElement.parentNode.replaceChild(input_1, this.inputElement);
                this.inputElement = input_1;
            }
            else if (isCurrentInputTypeInputButNewTagNotPassword) {
                // change to textarea
                var textarea_1 = document.createElement("textarea");
                Array.prototype.slice.call(this.inputElement.attributes).forEach(function (item) {
                    textarea_1.setAttribute(item.name, item.value);
                });
                this.inputElement.parentNode.replaceChild(textarea_1, this.inputElement);
                this.inputElement = textarea_1;
            }
            // add focus and blur events to newly created input element
            if (this.inputElement && (isCurrentInputTypeTextAreaButNewTagPassword || isCurrentInputTypeInputButNewTagNotPassword)) {
                this.inputElement.addEventListener('focus', this.onInputFocusCallback, false);
                this.inputElement.addEventListener('blur', this.onInputBlurCallback, false);
            }
            if (this.initialInputHeight == 0) {
                // initial height not set
                this.initialInputHeight = this.inputElement.offsetHeight;
            }
        };
        UserInput.prototype.onFlowUpdate = function (event) {
            var _this = this;
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
            // animate input field in
            this.visible = true;
            this._currentTag = event.detail.tag;
            this.el.setAttribute("tag-type", this._currentTag.type);
            // replace textarea and visa versa
            this.checkForCorrectInputTag();
            // set input field to type password if the dom input field is that, covering up the input
            this.inputElement.setAttribute("type", this._currentTag.type == "password" ? "password" : "input");
            clearTimeout(this.errorTimer);
            this.el.removeAttribute("error");
            this.inputElement.setAttribute("data-value", "");
            this.inputElement.value = "";
            this.setPlaceholder();
            this.resetValue();
            if (!UserInput.preventAutoFocus)
                this.setFocusOnInput();
            this.controlElements.reset();
            if (this._currentTag.type == "group") {
                this.buildControlElements(this._currentTag.elements);
            }
            else {
                this.buildControlElements([this._currentTag]);
            }
            if (this._currentTag.type == "text" || this._currentTag.type == "email") {
                this.inputElement.value = this._currentTag.defaultValue.toString();
            }
            setTimeout(function () {
                _this.disabled = false;
                _this.onInputChange();
            }, 150);
        };
        UserInput.prototype.onControlElementProgressChange = function (event) {
            var status = event.detail;
            this.disabled = status == cf.ControlElementProgressStates.BUSY;
        };
        UserInput.prototype.buildControlElements = function (tags) {
            this.controlElements.buildTags(tags);
        };
        UserInput.prototype.onControlElementSubmit = function (event) {
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
            // when ex a RadioButton is clicked..
            var controlElement = event.detail;
            this.controlElements.updateStateOnElements(controlElement);
            this.doSubmit();
        };
        UserInput.prototype.onSubmitButtonClick = function (event) {
            this.onEnterOrSubmitButtonSubmit(event);
        };
        UserInput.prototype.isMetaKeyPressed = function (event) {
            // if any meta keys, then ignore, getModifierState, but safari does not support..
            if (event.metaKey || [91, 93].indexOf(event.keyCode) !== -1)
                return;
        };
        UserInput.prototype.onKeyDown = function (event) {
            if (!this.active && !this.controlElements.focus)
                return;
            if (this.isMetaKeyPressed(event))
                return;
            // if any meta keys, then ignore
            if (event.keyCode == cf.Dictionary.keyCodes["shift"])
                this.shiftIsDown = true;
            // prevent textarea line breaks
            if (event.keyCode == cf.Dictionary.keyCodes["enter"] && !event.shiftKey) {
                event.preventDefault();
            }
        };
        UserInput.prototype.onKeyUp = function (event) {
            if (!this.active && !this.controlElements.focus)
                return;
            if (this.isMetaKeyPressed(event))
                return;
            if (event.keyCode == cf.Dictionary.keyCodes["shift"]) {
                this.shiftIsDown = false;
            }
            else if (event.keyCode == cf.Dictionary.keyCodes["up"]) {
                event.preventDefault();
                if (this.active && !this.controlElements.focus)
                    this.controlElements.focusFrom("bottom");
            }
            else if (event.keyCode == cf.Dictionary.keyCodes["down"]) {
                event.preventDefault();
                if (this.active && !this.controlElements.focus)
                    this.controlElements.focusFrom("top");
            }
            else if (event.keyCode == cf.Dictionary.keyCodes["tab"]) {
                // tab key pressed, check if node is child of CF, if then then reset focus to input element
                var doesKeyTargetExistInCF = false;
                var node = event.target.parentNode;
                while (node != null) {
                    if (node === this.cfReference.el) {
                        doesKeyTargetExistInCF = true;
                        break;
                    }
                    node = node.parentNode;
                }
                // prevent normal behaviour, we are not here to take part, we are here to take over!
                if (!doesKeyTargetExistInCF) {
                    event.preventDefault();
                    if (!this.controlElements.active)
                        this.setFocusOnInput();
                }
            }
            if (this.el.hasAttribute("disabled"))
                return;
            var value = this.getFlowDTO();
            if ((event.keyCode == cf.Dictionary.keyCodes["enter"] && !event.shiftKey) || event.keyCode == cf.Dictionary.keyCodes["space"]) {
                if (event.keyCode == cf.Dictionary.keyCodes["enter"] && this.active) {
                    event.preventDefault();
                    this.onEnterOrSubmitButtonSubmit();
                }
                else {
                    // either click on submit button or do something with control elements
                    if (event.keyCode == cf.Dictionary.keyCodes["enter"] || event.keyCode == cf.Dictionary.keyCodes["space"]) {
                        event.preventDefault();
                        var tagType = this._currentTag.type == "group" ? this._currentTag.getGroupTagType() : this._currentTag.type;
                        if (tagType == "select" || tagType == "checkbox") {
                            var mutiTag = this._currentTag;
                            // if select or checkbox then check for multi select item
                            if (tagType == "checkbox" || mutiTag.multipleChoice) {
                                if (this.active && event.keyCode == cf.Dictionary.keyCodes["enter"]) {
                                    // click on UserInput submit button, only ENTER allowed
                                    this.submitButton.click();
                                }
                                else {
                                    // let UI know that we changed the key
                                    this.dispatchKeyChange(value, event.keyCode);
                                    if (!this.active) {
                                        // after ui has been selected we RESET the input/filter
                                        this.resetValue();
                                        this.setFocusOnInput();
                                        this.dispatchKeyChange(value, event.keyCode);
                                    }
                                }
                            }
                            else {
                                this.dispatchKeyChange(value, event.keyCode);
                            }
                        }
                        else {
                            if (this._currentTag.type == "group") {
                                // let the controlements handle action
                                this.dispatchKeyChange(value, event.keyCode);
                            }
                        }
                    }
                    else if (event.keyCode == cf.Dictionary.keyCodes["space"] && document.activeElement) {
                        this.dispatchKeyChange(value, event.keyCode);
                    }
                }
            }
            else if (event.keyCode != cf.Dictionary.keyCodes["shift"] && event.keyCode != cf.Dictionary.keyCodes["tab"]) {
                this.dispatchKeyChange(value, event.keyCode);
            }
            this.onInputChange();
        };
        UserInput.prototype.dispatchKeyChange = function (dto, keyCode) {
            cf.ConversationalForm.illustrateFlow(this, "dispatch", cf.UserInputEvents.KEY_CHANGE, dto);
            this.eventTarget.dispatchEvent(new CustomEvent(cf.UserInputEvents.KEY_CHANGE, {
                detail: {
                    dto: dto,
                    keyCode: keyCode,
                    inputFieldActive: this.active
                }
            }));
        };
        UserInput.prototype.windowFocus = function (event) {
            if (!UserInput.preventAutoFocus)
                this.setFocusOnInput();
        };
        UserInput.prototype.onInputBlur = function (event) {
            this._active = false;
        };
        UserInput.prototype.onInputFocus = function (event) {
            this._active = true;
            this.onInputChange();
        };
        UserInput.prototype.setFocusOnInput = function () {
            this.inputElement.focus();
        };
        UserInput.prototype.onEnterOrSubmitButtonSubmit = function (event) {
            if (event === void 0) { event = null; }
            if (this.active && this.controlElements.highlighted) {
                // active input field and focus on control elements happens when a control element is highlighted
                this.controlElements.clickOnHighlighted();
            }
            else {
                if (!this._currentTag) {
                    // happens when a form is empty, so just play along and submit response to chatlist..
                    this.eventTarget.cf.addUserChatResponse(this.inputElement.value);
                }
                else {
                    // we need to check if current tag is file
                    if (this._currentTag.type == "file" && event) {
                        // trigger <input type="file" but only when it's from clicking button
                        this.controlElements.getElement(0).triggerFileSelect();
                    }
                    else {
                        // for groups, we expect that there is always a default value set
                        this.doSubmit();
                    }
                }
            }
        };
        UserInput.prototype.doSubmit = function () {
            var dto = this.getFlowDTO();
            this.disabled = true;
            this.el.removeAttribute("error");
            this.inputElement.setAttribute("data-value", "");
            cf.ConversationalForm.illustrateFlow(this, "dispatch", cf.UserInputEvents.SUBMIT, dto);
            this.eventTarget.dispatchEvent(new CustomEvent(cf.UserInputEvents.SUBMIT, {
                detail: dto
            }));
        };
        UserInput.prototype.resetValue = function () {
            this.inputElement.value = "";
            this.onInputChange();
        };
        UserInput.prototype.dealloc = function () {
            this.inputElement.removeEventListener('blur', this.onInputBlurCallback, false);
            this.onInputBlurCallback = null;
            this.inputElement.removeEventListener('focus', this.onInputFocusCallback, false);
            this.onInputFocusCallback = null;
            window.removeEventListener('focus', this.windowFocusCallback, false);
            this.windowFocusCallback = null;
            document.removeEventListener("keydown", this.keyDownCallback, false);
            this.keyDownCallback = null;
            document.removeEventListener("keyup", this.keyUpCallback, false);
            this.keyUpCallback = null;
            this.eventTarget.removeEventListener(cf.FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
            this.flowUpdateCallback = null;
            this.eventTarget.removeEventListener(cf.FlowEvents.USER_INPUT_INVALID, this.inputInvalidCallback, false);
            this.inputInvalidCallback = null;
            this.eventTarget.removeEventListener(cf.ControlElementEvents.SUBMIT_VALUE, this.onControlElementSubmitCallback, false);
            this.onControlElementSubmitCallback = null;
            this.submitButton = this.el.getElementsByClassName("cf-input-button")[0];
            this.submitButton.removeEventListener("click", this.onSubmitButtonClickCallback, false);
            this.onSubmitButtonClickCallback = null;
            _super.prototype.dealloc.call(this);
        };
        // override
        UserInput.prototype.getTemplate = function () {
            return "<cf-input>\n\t\t\t\t<cf-info></cf-info>\n\t\t\t\t<cf-input-control-elements>\n\t\t\t\t\t<cf-list-button direction=\"prev\">\n\t\t\t\t\t</cf-list-button>\n\t\t\t\t\t<cf-list-button direction=\"next\">\n\t\t\t\t\t</cf-list-button>\n\t\t\t\t\t<cf-list>\n\t\t\t\t\t</cf-list>\n\t\t\t\t</cf-input-control-elements>\n\n\t\t\t\t<cf-input-button class=\"cf-input-button\">\n\t\t\t\t\t<div class=\"cf-icon-progress\"></div>\n\t\t\t\t\t<div class=\"cf-icon-attachment\"></div>\n\t\t\t\t</cf-input-button>\n\t\t\t\t\n\t\t\t\t<textarea type='input' tabindex=\"1\" rows=\"1\"></textarea>\n\n\t\t\t</cf-input>\n\t\t\t";
        };
        return UserInput;
    }(cf.BasicElement));
    UserInput.preventAutoFocus = false;
    UserInput.ERROR_TIME = 2000;
    cf.UserInput = UserInput;
})(cf || (cf = {}));
