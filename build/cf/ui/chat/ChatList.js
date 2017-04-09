/// <reference path="ChatResponse.ts"/>
/// <reference path="../BasicElement.ts"/>
/// <reference path="../../logic/FlowManager.ts"/>
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
    cf.ChatListEvents = {
        CHATLIST_UPDATED: "cf-chatlist-updated"
    };
    // class
    var ChatList = (function (_super) {
        __extends(ChatList, _super);
        function ChatList(options) {
            var _this = _super.call(this, options) || this;
            _this.responses = [];
            // flow update
            _this.flowUpdateCallback = _this.onFlowUpdate.bind(_this);
            _this.eventTarget.addEventListener(cf.FlowEvents.FLOW_UPDATE, _this.flowUpdateCallback, false);
            // user input update
            _this.userInputUpdateCallback = _this.onUserInputUpdate.bind(_this);
            _this.eventTarget.addEventListener(cf.FlowEvents.USER_INPUT_UPDATE, _this.userInputUpdateCallback, false);
            // user input key change
            _this.onInputKeyChangeCallback = _this.onInputKeyChange.bind(_this);
            _this.eventTarget.addEventListener(cf.UserInputEvents.KEY_CHANGE, _this.onInputKeyChangeCallback, false);
            // user input height change
            _this.onInputHeightChangeCallback = _this.onInputHeightChange.bind(_this);
            _this.eventTarget.addEventListener(cf.UserInputEvents.HEIGHT_CHANGE, _this.onInputHeightChangeCallback, false);
            return _this;
        }
        ChatList.prototype.onInputHeightChange = function (event) {
            var dto = event.detail.dto;
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, dto);
            this.scrollListTo();
        };
        ChatList.prototype.onInputKeyChange = function (event) {
            var dto = event.detail.dto;
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, dto);
        };
        ChatList.prototype.onUserInputUpdate = function (event) {
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
            if (this.currentUserResponse) {
                var response = event.detail;
                this.setCurrentUserResponse(response);
            }
            else {
                // this should never happen..
                throw new Error("No current response ..?");
            }
        };
        ChatList.prototype.onFlowUpdate = function (event) {
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
            var currentTag = event.detail.tag;
            if (this.currentResponse)
                this.currentResponse.disabled = false;
            if (this.containsTagResponse(currentTag) && !event.detail.ignoreExistingTag) {
                // because user maybe have scrolled up and wants to edit
                // tag is already in list, so re-activate it
                this.onUserWantsToEditTag(currentTag);
            }
            else {
                // robot response
                var robot = this.createResponse(true, currentTag, currentTag.question);
                if (this.currentUserResponse) {
                    // linked, but only if we should not ignore existing tag
                    this.currentUserResponse.setLinkToOtherReponse(robot);
                    robot.setLinkToOtherReponse(this.currentUserResponse);
                }
                // user response, create the waiting response
                this.currentUserResponse = this.createResponse(false, currentTag);
            }
        };
        /**
        * @name containsTagResponse
        * @return boolean
        * check if tag has already been responded to
        */
        ChatList.prototype.containsTagResponse = function (tagToChange) {
            for (var i = 0; i < this.responses.length; i++) {
                var element = this.responses[i];
                if (!element.isRobotReponse && element.tag == tagToChange) {
                    return true;
                }
            }
            return false;
        };
        /**
        * @name onUserAnswerClicked
        * on user ChatReponse clicked
        */
        ChatList.prototype.onUserWantsToEditTag = function (tagToChange) {
            var oldReponse;
            for (var i = 0; i < this.responses.length; i++) {
                var element = this.responses[i];
                if (!element.isRobotReponse && element.tag == tagToChange) {
                    // update element thhat user wants to edit
                    oldReponse = element;
                    break;
                }
            }
            // reset the current user response
            this.currentUserResponse.processResponseAndSetText();
            if (oldReponse) {
                // only disable latest tag when we jump back
                if (this.currentUserResponse == this.responses[this.responses.length - 1]) {
                    this.currentUserResponse.hide();
                }
                this.currentUserResponse = oldReponse;
                this.onListUpdate(this.currentUserResponse);
            }
        };
        ChatList.prototype.onListUpdate = function (chatResponse) {
            var _this = this;
            setTimeout(function () {
                _this.eventTarget.dispatchEvent(new CustomEvent(cf.ChatListEvents.CHATLIST_UPDATED, {
                    detail: _this
                }));
                chatResponse.show();
                _this.scrollListTo(chatResponse);
            }, 0);
        };
        /**
        * @name setCurrentUserResponse
        * Update current reponse, is being called automatically from onFlowUpdate, but can also in rare cases be called automatically when flow is controlled manually.
        * reponse: FlowDTO
        */
        ChatList.prototype.setCurrentUserResponse = function (dto) {
            this.flowDTOFromUserInputUpdate = dto;
            if (!this.flowDTOFromUserInputUpdate.text) {
                if (dto.input.currentTag.type == "group") {
                    this.flowDTOFromUserInputUpdate.text = cf.Dictionary.get("user-reponse-missing-group");
                }
                else if (dto.input.currentTag.type != "password")
                    this.flowDTOFromUserInputUpdate.text = cf.Dictionary.get("user-reponse-missing");
            }
            this.currentUserResponse.setValue(this.flowDTOFromUserInputUpdate);
            this.scrollListTo();
        };
        ChatList.prototype.updateThumbnail = function (robot, img) {
            cf.Dictionary.set(robot ? "robot-image" : "user-image", robot ? "robot" : "human", img);
            var newImage = robot ? cf.Dictionary.getRobotResponse("robot-image") : cf.Dictionary.get("user-image");
            for (var i = 0; i < this.responses.length; i++) {
                var element = this.responses[i];
                if (robot && element.isRobotReponse) {
                    element.updateThumbnail(newImage);
                }
                else if (!robot && !element.isRobotReponse) {
                    element.updateThumbnail(newImage);
                }
            }
        };
        ChatList.prototype.createResponse = function (isRobotReponse, currentTag, value) {
            if (value === void 0) { value = null; }
            var response = new cf.ChatResponse({
                // image: null,
                tag: currentTag,
                eventTarget: this.eventTarget,
                isRobotReponse: isRobotReponse,
                response: value,
                image: isRobotReponse ? cf.Dictionary.getRobotResponse("robot-image") : cf.Dictionary.get("user-image"),
            });
            this.responses.push(response);
            this.currentResponse = response;
            var scrollable = this.el.querySelector("scrollable");
            scrollable.appendChild(this.currentResponse.el);
            this.onListUpdate(response);
            return response;
        };
        ChatList.prototype.scrollListTo = function (response) {
            if (response === void 0) { response = null; }
            try {
                var scrollable_1 = this.el.querySelector("scrollable");
                var y_1 = response ? response.el.offsetTop - 50 : 1000000000;
                scrollable_1.scrollTop = y_1;
                setTimeout(function () { return scrollable_1.scrollTop = y_1; }, 100);
            }
            catch (e) {
                // catch errors where CF have been removed
            }
        };
        ChatList.prototype.getTemplate = function () {
            return "<cf-chat type='pluto'>\n\t\t\t\t\t\t<scrollable></scrollable>\n\t\t\t\t\t</cf-chat>";
        };
        ChatList.prototype.dealloc = function () {
            this.eventTarget.removeEventListener(cf.FlowEvents.FLOW_UPDATE, this.flowUpdateCallback, false);
            this.flowUpdateCallback = null;
            this.eventTarget.removeEventListener(cf.FlowEvents.USER_INPUT_UPDATE, this.userInputUpdateCallback, false);
            this.userInputUpdateCallback = null;
            this.eventTarget.removeEventListener(cf.UserInputEvents.KEY_CHANGE, this.onInputKeyChangeCallback, false);
            this.onInputKeyChangeCallback = null;
            _super.prototype.dealloc.call(this);
        };
        return ChatList;
    }(cf.BasicElement));
    cf.ChatList = ChatList;
})(cf || (cf = {}));
