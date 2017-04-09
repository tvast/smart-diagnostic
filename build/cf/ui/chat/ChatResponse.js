/// <reference path="../BasicElement.ts"/>
/// <reference path="../../logic/Helpers.ts"/>
/// <reference path="../../ConversationalForm.ts"/>
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
    cf.ChatResponseEvents = {
        USER_ANSWER_CLICKED: "cf-on-user-answer-clicked",
    };
    // class
    var ChatResponse = (function (_super) {
        __extends(ChatResponse, _super);
        function ChatResponse(options) {
            var _this = _super.call(this, options) || this;
            _this._tag = options.tag;
            _this.textEl = _this.el.getElementsByTagName("text")[0];
            return _this;
        }
        Object.defineProperty(ChatResponse.prototype, "tag", {
            get: function () {
                return this._tag;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ChatResponse.prototype, "disabled", {
            get: function () {
                return this.el.classList.contains("disabled");
            },
            set: function (value) {
                this.el.classList.toggle("disabled", value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ChatResponse.prototype, "visible", {
            set: function (value) {
                if (value) {
                    this.el.classList.add("show");
                }
                else {
                    this.el.classList.remove("show");
                }
            },
            enumerable: true,
            configurable: true
        });
        ChatResponse.prototype.setValue = function (dto) {
            if (dto === void 0) { dto = null; }
            if (!this.visible) {
                this.visible = true;
            }
            var isThinking = this.textEl.hasAttribute("thinking");
            if (!dto) {
                this.setToThinking();
            }
            else {
                this.response = dto.text;
                var processedResponse = this.processResponseAndSetText();
                if (this.responseLink && !this.isRobotReponse) {
                    // call robot and update for binding values ->
                    this.responseLink.processResponseAndSetText();
                }
                // check for if response type is file upload...
                if (dto && dto.controlElements && dto.controlElements[0]) {
                    switch (dto.controlElements[0].type) {
                        case "UploadFileUI":
                            this.textEl.classList.add("file-icon");
                            break;
                    }
                }
                if (!this.isRobotReponse && !this.onClickCallback) {
                    this.onClickCallback = this.onClick.bind(this);
                    this.el.addEventListener(cf.Helpers.getMouseEvent("click"), this.onClickCallback, false);
                }
            }
        };
        ChatResponse.prototype.hide = function () {
            this.el.classList.remove("show");
            this.disabled = true;
        };
        ChatResponse.prototype.show = function () {
            this.el.classList.add("show");
            this.disabled = false;
            if (!this.response) {
                this.setToThinking();
            }
            else {
                this.checkForEditMode();
            }
        };
        ChatResponse.prototype.updateThumbnail = function (src) {
            this.image = src;
            var thumbEl = this.el.getElementsByTagName("thumb")[0];
            thumbEl.style.backgroundImage = "url(" + this.image + ")";
        };
        ChatResponse.prototype.setLinkToOtherReponse = function (response) {
            // link reponse to another one, keeping the update circle complete.
            this.responseLink = response;
        };
        ChatResponse.prototype.processResponseAndSetText = function () {
            var _this = this;
            var innerResponse = this.response;
            if (this._tag && this._tag.type == "password" && !this.isRobotReponse) {
                var newStr = "";
                for (var i = 0; i < innerResponse.length; i++) {
                    newStr += "*";
                }
                innerResponse = newStr;
            }
            else {
                innerResponse = cf.Helpers.emojify(innerResponse);
            }
            if (this.responseLink && this.isRobotReponse) {
                // if robot, then check linked response for binding values
                // one way data binding values:
                innerResponse = innerResponse.split("{previous-answer}").join(this.responseLink.parsedResponse);
                // add more..
                // innerResponse = innerResponse.split("{...}").join(this.responseLink.parsedResponse);
            }
            // check if response contains an image as answer
            var responseContains = innerResponse.indexOf("contains-image") != -1;
            if (responseContains)
                this.textEl.classList.add("contains-image");
            // now set it
            this.textEl.innerHTML = innerResponse;
            this.parsedResponse = innerResponse;
            // bounce
            this.textEl.removeAttribute("thinking");
            this.textEl.removeAttribute("value-added");
            setTimeout(function () {
                _this.textEl.setAttribute("value-added", "");
            }, 0);
            this.checkForEditMode();
            return innerResponse;
        };
        ChatResponse.prototype.checkForEditMode = function () {
            if (!this.isRobotReponse && !this.textEl.hasAttribute("thinking")) {
                this.el.classList.add("can-edit");
                this.disabled = false;
            }
        };
        ChatResponse.prototype.setToThinking = function () {
            this.textEl.innerHTML = ChatResponse.THINKING_MARKUP;
            this.el.classList.remove("can-edit");
            this.textEl.setAttribute("thinking", "");
        };
        /**
        * @name onClickCallback
        * click handler for el
        */
        ChatResponse.prototype.onClick = function (event) {
            this.setToThinking();
            cf.ConversationalForm.illustrateFlow(this, "dispatch", cf.ChatResponseEvents.USER_ANSWER_CLICKED, event);
            this.eventTarget.dispatchEvent(new CustomEvent(cf.ChatResponseEvents.USER_ANSWER_CLICKED, {
                detail: this._tag
            }));
        };
        ChatResponse.prototype.setData = function (options) {
            var _this = this;
            this.image = options.image;
            this.response = "";
            this.isRobotReponse = options.isRobotReponse;
            _super.prototype.setData.call(this, options);
            setTimeout(function () {
                _this.setValue();
                if (_this.isRobotReponse || options.response != null) {
                    // Robot is pseudo thinking, can also be user -->
                    // , but if addUserChatResponse is called from ConversationalForm, then the value is there, therefore skip ...
                    setTimeout(function () { return _this.setValue({ text: options.response }); }, 0); //ConversationalForm.animationsEnabled ? Helpers.lerp(Math.random(), 500, 900) : 0);
                }
                else {
                    // shows the 3 dots automatically, we expect the reponse to be empty upon creation
                    // TODO: Auto completion insertion point
                    setTimeout(function () { return _this.el.classList.add("peak-thumb"); }, cf.ConversationalForm.animationsEnabled ? 1400 : 0);
                }
            }, 0);
        };
        ChatResponse.prototype.dealloc = function () {
            if (this.onClickCallback) {
                this.el.removeEventListener(cf.Helpers.getMouseEvent("click"), this.onClickCallback, false);
                this.onClickCallback = null;
            }
            _super.prototype.dealloc.call(this);
        };
        // template, can be overwritten ...
        ChatResponse.prototype.getTemplate = function () {
            return "<cf-chat-response class=\"" + (this.isRobotReponse ? "robot" : "user") + "\">\n\t\t\t\t<thumb style=\"background-image: url(" + this.image + ")\"></thumb>\n\t\t\t\t<text>" + (!this.response ? ChatResponse.THINKING_MARKUP : this.response) + "</text>\n\t\t\t</cf-chat-response>";
        };
        return ChatResponse;
    }(cf.BasicElement));
    ChatResponse.THINKING_MARKUP = "<thinking><span>.</span><span>.</span><span>.</span></thinking>";
    cf.ChatResponse = ChatResponse;
})(cf || (cf = {}));
