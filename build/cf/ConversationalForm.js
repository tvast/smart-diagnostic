// version 0.9.0
/// <reference path="ui/UserInput.ts"/>
/// <reference path="ui/chat/ChatList.ts"/>
/// <reference path="logic/FlowManager.ts"/>
/// <reference path="logic/EventDispatcher.ts"/>
/// <reference path="form-tags/Tag.ts"/>
/// <reference path="form-tags/TagGroup.ts"/>
/// <reference path="form-tags/InputTag.ts"/>
/// <reference path="form-tags/SelectTag.ts"/>
/// <reference path="form-tags/ButtonTag.ts"/>
/// <reference path="data/Dictionary.ts"/>
var cf;
(function (cf) {
    var ConversationalForm = (function () {
        function ConversationalForm(options) {
            this.version = "0.9.2";
            this.cdnPath = "//conversational-form-{version}-0iznjsw.stackpathdns.com/";
            this.isDevelopment = false;
            this.loadExternalStyleSheet = true;
            this.preventAutoAppend = false;
            this.preventAutoStart = false;
            window.ConversationalForm = this;
            this.cdnPath = this.cdnPath.split("{version}").join(this.version.split(".").join(""));
            console.log('Conversational Form > version:', this.version);
            window.ConversationalForm[this.createId] = this;
            // possible to create your own event dispatcher, so you can tap into the events of the app
            if (options.eventDispatcher)
                this._eventTarget = options.eventDispatcher;
            // set a general step validation callback
            if (options.flowStepCallback)
                cf.FlowManager.generalFlowStepCallback = options.flowStepCallback;
            this.isDevelopment = ConversationalForm.illustrateAppFlow = !!document.getElementById("conversational-form-development");
            if (this.isDevelopment || options.loadExternalStyleSheet == false) {
                this.loadExternalStyleSheet = false;
            }
            if (!isNaN(options.scrollAccerlation))
                cf.ScrollController.accerlation = options.scrollAccerlation;
            this.preventAutoStart = options.preventAutoStart;
            this.preventAutoAppend = options.preventAutoAppend;
            if (!options.formEl)
                throw new Error("Conversational Form error, the formEl needs to be defined.");
            this.formEl = options.formEl;
            this.formEl.setAttribute("cf-create-id", this.createId);
            this.submitCallback = options.submitCallback;
            if (this.formEl.getAttribute("cf-no-animation") == "")
                ConversationalForm.animationsEnabled = false;
            if (this.formEl.getAttribute("cf-prevent-autofocus") == "")
                cf.UserInput.preventAutoFocus = true;
            this.dictionary = new cf.Dictionary({
                data: options.dictionaryData,
                robotData: options.dictionaryRobot,
                userImage: options.userImage,
                robotImage: options.robotImage,
            });
            // emoji.. fork and set your own values..
            this.context = options.context ? options.context : document.body;
            this.tags = options.tags;
            this.init();
        }
        Object.defineProperty(ConversationalForm.prototype, "createId", {
            get: function () {
                if (!this._createId) {
                    this._createId = new Date().getTime().toString();
                }
                return this._createId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ConversationalForm.prototype, "eventTarget", {
            get: function () {
                if (!this._eventTarget) {
                    this._eventTarget = new cf.EventDispatcher(this);
                }
                return this._eventTarget;
            },
            enumerable: true,
            configurable: true
        });
        ConversationalForm.prototype.init = function () {
            cf.Helpers.setEmojiLib();
            if (this.loadExternalStyleSheet) {
                // not in development/examples, so inject production css
                var head = document.head || document.getElementsByTagName("head")[0];
                var style = document.createElement("link");
                var githubMasterUrl = this.cdnPath + "conversational-form.min.css";
                style.type = "text/css";
                style.media = "all";
                style.setAttribute("rel", "stylesheet");
                style.setAttribute("href", githubMasterUrl);
                head.appendChild(style);
            }
            else {
                // expect styles to be in the document
                this.isDevelopment = true;
            }
            // set context position to relative, else we break out of the box
            var position = window.getComputedStyle(this.context).getPropertyValue("position").toLowerCase();
            if (["fixed", "absolute", "relative"].indexOf(position) == -1) {
                this.context.style.position = "relative";
            }
            // if tags are not defined then we will try and build some tags our selves..
            if (!this.tags || this.tags.length == 0) {
                this.tags = [];
                var fields = [].slice.call(this.formEl.querySelectorAll("input, select, button, textarea"), 0);
                for (var i = 0; i < fields.length; i++) {
                    var element = fields[i];
                    if (cf.Tag.isTagValid(element)) {
                        // ignore hidden tags
                        this.tags.push(cf.Tag.createTag(element));
                    }
                }
            }
            else {
                // tags are manually setup and passed as options.tags.
            }
            // remove invalid tags if they've sneaked in.. this could happen if tags are setup manually as we don't encurage to use static Tag.isTagValid
            var indexesToRemove = [];
            for (var i = 0; i < this.tags.length; i++) {
                var element = this.tags[i];
                if (!element || !cf.Tag.isTagValid(element.domElement)) {
                    indexesToRemove.push(element);
                }
            }
            for (var i = 0; i < indexesToRemove.length; i++) {
                var tag = indexesToRemove[i];
                this.tags.splice(this.tags.indexOf(tag), 1);
            }
            if (!this.tags || this.tags.length == 0) {
                console.warn("Conversational Form: No tags found or registered.");
            }
            //let's start the conversation
            this.setupTagGroups();
            this.setupUI();
            return this;
        };
        /**
        * @name updateDictionaryValue
        * set a dictionary value at "runtime"
        *	id: string, id of the value to update
        *	type: string, "human" || "robot"
        *	value: string, value to be inserted
        */
        ConversationalForm.prototype.updateDictionaryValue = function (id, type, value) {
            cf.Dictionary.set(id, type, value);
            if (["robot-image", "user-image"].indexOf(id) != -1) {
                this.chatList.updateThumbnail(id == "robot-image", value);
            }
        };
        ConversationalForm.prototype.getFormData = function (serialized) {
            if (serialized === void 0) { serialized = false; }
            if (serialized) {
                var serialized_1 = {};
                for (var i = 0; i < this.tags.length; i++) {
                    var element = this.tags[i];
                    if (element.name && element.value)
                        serialized_1[element.name] = element.value;
                }
                return serialized_1;
            }
            else {
                var formData = new FormData(this.formEl);
                return formData;
            }
        };
        ConversationalForm.prototype.addRobotChatResponse = function (response) {
            this.chatList.createResponse(true, null, response);
        };
        ConversationalForm.prototype.addUserChatResponse = function (response) {
            // add a "fake" user response..
            this.chatList.createResponse(false, null, response);
        };
        ConversationalForm.prototype.stop = function (optionalStoppingMessage) {
            if (optionalStoppingMessage === void 0) { optionalStoppingMessage = ""; }
            this.flowManager.stop();
            if (optionalStoppingMessage != "")
                this.chatList.createResponse(true, null, optionalStoppingMessage);
            this.userInput.onFlowStopped();
        };
        ConversationalForm.prototype.start = function () {
            this.userInput.disabled = false;
            this.userInput.visible = true;
            this.flowManager.start();
        };
        ConversationalForm.prototype.getTag = function (nameOrIndex) {
            if (typeof nameOrIndex == "number") {
                return this.tags[nameOrIndex];
            }
            else {
                // TODO: fix so you can get a tag by its name attribute
                return null;
            }
        };
        ConversationalForm.prototype.setupTagGroups = function () {
            // make groups, from input tag[type=radio | type=checkbox]
            // groups are used to bind logic like radio-button or checkbox dependencies
            var groups = [];
            for (var i = 0; i < this.tags.length; i++) {
                var tag = this.tags[i];
                if (tag.type == "radio" || tag.type == "checkbox") {
                    if (!groups[tag.name])
                        groups[tag.name] = [];
                    groups[tag.name].push(tag);
                }
            }
            if (Object.keys(groups).length > 0) {
                for (var group in groups) {
                    if (groups[group].length > 0) {
                        // always build groupd when radio or checkbox
                        var tagGroup = new cf.TagGroup({
                            elements: groups[group]
                        });
                        // remove the tags as they are now apart of a group
                        for (var i = 0; i < groups[group].length; i++) {
                            var tagToBeRemoved = groups[group][i];
                            if (i == 0)
                                this.tags.splice(this.tags.indexOf(tagToBeRemoved), 1, tagGroup);
                            else
                                this.tags.splice(this.tags.indexOf(tagToBeRemoved), 1);
                        }
                    }
                }
            }
        };
        ConversationalForm.prototype.setupUI = function () {
            // start the flow
            this.flowManager = new cf.FlowManager({
                cfReference: this,
                eventTarget: this.eventTarget,
                tags: this.tags
            });
            this.el = document.createElement("div");
            this.el.id = "conversational-form";
            this.el.className = "conversational-form";
            if (ConversationalForm.animationsEnabled)
                this.el.classList.add("conversational-form--enable-animation");
            // add conversational form to context
            if (!this.preventAutoAppend)
                this.context.appendChild(this.el);
            //hide until stylesheet is rendered
            this.el.style.visibility = "hidden";
            var innerWrap = document.createElement("div");
            innerWrap.className = "conversational-form-inner";
            this.el.appendChild(innerWrap);
            // Conversational Form UI
            this.chatList = new cf.ChatList({
                eventTarget: this.eventTarget
            });
            innerWrap.appendChild(this.chatList.el);
            this.userInput = new cf.UserInput({
                eventTarget: this.eventTarget,
                cfReference: this
            });
            innerWrap.appendChild(this.userInput.el);
            this.onUserAnswerClickedCallback = this.onUserAnswerClicked.bind(this);
            this.eventTarget.addEventListener(cf.ChatResponseEvents.USER_ANSWER_CLICKED, this.onUserAnswerClickedCallback, false);
            this.el.classList.add("conversational-form--show");
            if (!this.preventAutoStart)
                this.flowManager.start();
            if (!this.tags || this.tags.length == 0) {
                // no tags, so just so the input
                this.userInput.visible = true;
            }
        };
        /**
        * @name onUserAnswerClicked
        * on user ChatReponse clicked
        */
        ConversationalForm.prototype.onUserAnswerClicked = function (event) {
            var tag = event.detail;
            this.flowManager.editTag(tag);
        };
        /**
        * @name remapTagsAndStartFrom
        * index: number, what index to start from
        * setCurrentTagValue: boolean, usually this method is called when wanting to loop or skip over questions, therefore it might be usefull to set the value of the current tag before changing index.
        * ignoreExistingTags: boolean, possible to ignore existing tags, to allow for the flow to just "happen"
        */
        ConversationalForm.prototype.remapTagsAndStartFrom = function (index, setCurrentTagValue, ignoreExistingTags) {
            if (index === void 0) { index = 0; }
            if (setCurrentTagValue === void 0) { setCurrentTagValue = false; }
            if (ignoreExistingTags === void 0) { ignoreExistingTags = false; }
            if (setCurrentTagValue) {
                this.chatList.setCurrentUserResponse(this.userInput.getFlowDTO());
            }
            // possibility to start the form flow over from {index}
            for (var i = 0; i < this.tags.length; i++) {
                var tag = this.tags[i];
                tag.refresh();
            }
            this.flowManager.startFrom(index, ignoreExistingTags);
        };
        /**
        * @name focus
        * Sets focus on Conversational Form
        */
        ConversationalForm.prototype.focus = function () {
            if (this.userInput)
                this.userInput.setFocusOnInput();
        };
        ConversationalForm.prototype.doSubmitForm = function () {
            this.el.classList.add("done");
            this.userInput.reset();
            if (this.submitCallback) {
                // remove should be called in the submitCallback
                this.submitCallback();
            }
            else {
                // this.formEl.submit();
                // doing classic .submit wont trigger onsubmit if that is present on form element
                // as described here: http://wayback.archive.org/web/20090323062817/http://blogs.vertigosoftware.com/snyholm/archive/2006/09/27/3788.aspx
                // so we mimic a click.
                var button = this.formEl.ownerDocument.createElement('input');
                button.style.display = 'none';
                button.type = 'submit';
                this.formEl.appendChild(button);
                button.click();
                this.formEl.removeChild(button);
                // remove conversational
                this.remove();
            }
        };
        ConversationalForm.prototype.remove = function () {
            if (this.onUserAnswerClickedCallback) {
                this.eventTarget.removeEventListener(cf.ChatResponseEvents.USER_ANSWER_CLICKED, this.onUserAnswerClickedCallback, false);
                this.onUserAnswerClickedCallback = null;
            }
            if (this.flowManager)
                this.flowManager.dealloc();
            if (this.userInput)
                this.userInput.dealloc();
            if (this.chatList)
                this.chatList.dealloc();
            this.dictionary = null;
            this.flowManager = null;
            this.userInput = null;
            this.chatList = null;
            this.context = null;
            this.formEl = null;
            this.tags = null;
            this.submitCallback = null;
            this.el.parentNode.removeChild(this.el);
            this.el = null;
            window.ConversationalForm[this.createId] = null;
        };
        // to illustrate the event flow of the app
        ConversationalForm.illustrateFlow = function (classRef, type, eventType, detail) {
            // ConversationalForm.illustrateFlow(this, "dispatch", FlowEvents.USER_INPUT_INVALID, event.detail);
            // ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
            if (detail === void 0) { detail = null; }
            if (ConversationalForm.illustrateAppFlow) {
                var highlight = "font-weight: 900; background: " + (type == "receive" ? "#e6f3fe" : "pink") + "; color: black; padding: 0px 5px;";
                console.log("%c** event flow: %c" + eventType + "%c flow type: %c" + type + "%c from: %c" + classRef.constructor.name, "font-weight: 900;", highlight, "font-weight: 400;", highlight, "font-weight: 400;", highlight);
                if (detail)
                    console.log("** event flow detail:", detail);
            }
        };
        ConversationalForm.autoStartTheConversation = function () {
            if (ConversationalForm.hasAutoInstantiated)
                return;
            // auto start the conversation
            var formElements = document.querySelectorAll("form[cf-form]");
            // no form elements found, look for the old init attribute
            if (formElements.length === 0) {
                formElements = document.querySelectorAll("form[cf-form-element]");
            }
            var formContexts = document.querySelectorAll("*[cf-context]");
            if (formElements && formElements.length > 0) {
                for (var i = 0; i < formElements.length; i++) {
                    var form = formElements[i];
                    var context = formContexts[i];
                    new cf.ConversationalForm({
                        formEl: form,
                        context: context
                    });
                }
                ConversationalForm.hasAutoInstantiated = true;
            }
        };
        return ConversationalForm;
    }());
    ConversationalForm.animationsEnabled = true;
    ConversationalForm.illustrateAppFlow = true;
    ConversationalForm.hasAutoInstantiated = false;
    cf.ConversationalForm = ConversationalForm;
})(cf || (cf = {}));
if (document.readyState == "complete") {
    // if document alread instantiated, usually this happens if Conversational Form is injected through JS
    setTimeout(function () { return cf.ConversationalForm.autoStartTheConversation(); }, 0);
}
else {
    // await for when document is ready
    window.addEventListener("load", function () {
        cf.ConversationalForm.autoStartTheConversation();
    }, false);
}
