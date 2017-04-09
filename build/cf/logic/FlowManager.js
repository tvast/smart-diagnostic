/// <reference path="../form-tags/Tag.ts"/>
/// <reference path="../ConversationalForm.ts"/>
var cf;
(function (cf) {
    // interface
    cf.FlowEvents = {
        USER_INPUT_UPDATE: "cf-flow-user-input-update",
        USER_INPUT_INVALID: "cf-flow-user-input-invalid",
        //	detail: string
        FLOW_UPDATE: "cf-flow-update",
    };
    // class
    var FlowManager = (function () {
        function FlowManager(options) {
            this.stopped = false;
            this.maxSteps = 0;
            this.step = 0;
            this.savedStep = -1;
            this.stepTimer = 0;
            /**
            * ignoreExistingTags
            * @type boolean
            * ignore existing tags, usually this is set to true when using startFrom, where you don't want it to check for exisintg tags in the list
            */
            this.ignoreExistingTags = false;
            this.cfReference = options.cfReference;
            this.eventTarget = options.eventTarget;
            this.setTags(options.tags);
            this.maxSteps = this.tags.length;
            this.userInputSubmitCallback = this.userInputSubmit.bind(this);
            this.eventTarget.addEventListener(cf.UserInputEvents.SUBMIT, this.userInputSubmitCallback, false);
        }
        Object.defineProperty(FlowManager.prototype, "currentTag", {
            get: function () {
                return this.tags[this.step];
            },
            enumerable: true,
            configurable: true
        });
        FlowManager.prototype.userInputSubmit = function (event) {
            var _this = this;
            cf.ConversationalForm.illustrateFlow(this, "receive", event.type, event.detail);
            var appDTO = event.detail;
            var isTagValid = this.currentTag.setTagValueAndIsValid(appDTO);
            var hasCheckedForTagSpecificValidation = false;
            var hasCheckedForGlobalFlowValidation = false;
            var onValidationCallback = function () {
                // check 1
                if (_this.currentTag.validationCallback && typeof _this.currentTag.validationCallback == "function") {
                    if (!hasCheckedForTagSpecificValidation && isTagValid) {
                        hasCheckedForTagSpecificValidation = true;
                        _this.currentTag.validationCallback(appDTO, function () {
                            isTagValid = true;
                            onValidationCallback();
                        }, function (optionalErrorMessage) {
                            isTagValid = false;
                            if (optionalErrorMessage)
                                appDTO.errorText = optionalErrorMessage;
                            onValidationCallback();
                        });
                        return;
                    }
                }
                // check 2, this.currentTag.required <- required should be handled in the callback.
                if (FlowManager.generalFlowStepCallback && typeof FlowManager.generalFlowStepCallback == "function") {
                    if (!hasCheckedForGlobalFlowValidation && isTagValid) {
                        hasCheckedForGlobalFlowValidation = true;
                        // use global validationCallback method
                        FlowManager.generalFlowStepCallback(appDTO, function () {
                            isTagValid = true;
                            onValidationCallback();
                        }, function (optionalErrorMessage) {
                            isTagValid = false;
                            if (optionalErrorMessage)
                                appDTO.errorText = optionalErrorMessage;
                            onValidationCallback();
                        });
                        return;
                    }
                }
                // go on with the flow
                if (isTagValid) {
                    // do the normal flow..
                    cf.ConversationalForm.illustrateFlow(_this, "dispatch", cf.FlowEvents.USER_INPUT_UPDATE, appDTO);
                    // update to latest DTO because values can be changed in validation flow...
                    appDTO = appDTO.input.getFlowDTO();
                    _this.eventTarget.dispatchEvent(new CustomEvent(cf.FlowEvents.USER_INPUT_UPDATE, {
                        detail: appDTO //UserInput value
                    }));
                    // goto next step when user has answered
                    setTimeout(function () { return _this.nextStep(); }, cf.ConversationalForm.animationsEnabled ? 250 : 0);
                }
                else {
                    cf.ConversationalForm.illustrateFlow(_this, "dispatch", cf.FlowEvents.USER_INPUT_INVALID, appDTO);
                    // Value not valid
                    _this.eventTarget.dispatchEvent(new CustomEvent(cf.FlowEvents.USER_INPUT_INVALID, {
                        detail: appDTO //UserInput value
                    }));
                }
            };
            // TODO, make into promises when IE is rolling with it..
            onValidationCallback();
        };
        FlowManager.prototype.startFrom = function (indexOrTag, ignoreExistingTags) {
            if (ignoreExistingTags === void 0) { ignoreExistingTags = false; }
            if (typeof indexOrTag == "number")
                this.step = indexOrTag;
            else {
                // find the index..
                this.step = this.tags.indexOf(indexOrTag);
            }
            this.ignoreExistingTags = ignoreExistingTags;
            if (!this.ignoreExistingTags) {
                this.editTag(this.tags[this.step]);
            }
            else {
                //validate step, and ask for skipping of current step
                this.showStep();
            }
        };
        FlowManager.prototype.start = function () {
            this.stopped = false;
            this.validateStepAndUpdate();
        };
        FlowManager.prototype.stop = function () {
            this.stopped = true;
        };
        FlowManager.prototype.nextStep = function () {
            if (this.stopped)
                return;
            if (this.savedStep != -1)
                this.step = this.savedStep;
            this.savedStep = -1; //reset saved step
            this.step++;
            this.validateStepAndUpdate();
        };
        FlowManager.prototype.previousStep = function () {
            this.step--;
            this.validateStepAndUpdate();
        };
        FlowManager.prototype.addStep = function () {
            // this can be used for when a Tags value is updated and new tags are presented
            // like dynamic tag insertion depending on an answer.. V2..
        };
        FlowManager.prototype.dealloc = function () {
            this.eventTarget.removeEventListener(cf.UserInputEvents.SUBMIT, this.userInputSubmitCallback, false);
            this.userInputSubmitCallback = null;
        };
        /**
        * @name editTag
        * go back in time and edit a tag.
        */
        FlowManager.prototype.editTag = function (tag) {
            this.ignoreExistingTags = false;
            this.savedStep = this.step - 1;
            this.step = this.tags.indexOf(tag); // === this.currentTag
            this.validateStepAndUpdate();
        };
        FlowManager.prototype.setTags = function (tags) {
            this.tags = tags;
            for (var i = 0; i < this.tags.length; i++) {
                var tag = this.tags[i];
                tag.eventTarget = this.eventTarget;
            }
        };
        FlowManager.prototype.skipStep = function () {
            this.nextStep();
        };
        FlowManager.prototype.validateStepAndUpdate = function () {
            if (this.maxSteps > 0) {
                if (this.step == this.maxSteps) {
                    // console.warn("We are at the end..., submit click")
                    this.cfReference.doSubmitForm();
                }
                else {
                    this.step %= this.maxSteps;
                    if (this.currentTag.disabled) {
                        // check if current tag has become or is disabled, if it is, then skip step.
                        this.skipStep();
                    }
                    else {
                        this.showStep();
                    }
                }
            }
        };
        FlowManager.prototype.showStep = function () {
            if (this.stopped)
                return;
            cf.ConversationalForm.illustrateFlow(this, "dispatch", cf.FlowEvents.FLOW_UPDATE, this.currentTag);
            this.currentTag.refresh();
            this.eventTarget.dispatchEvent(new CustomEvent(cf.FlowEvents.FLOW_UPDATE, {
                detail: {
                    tag: this.currentTag,
                    ignoreExistingTag: this.ignoreExistingTags
                }
            }));
        };
        return FlowManager;
    }());
    FlowManager.STEP_TIME = 1000;
    cf.FlowManager = FlowManager;
})(cf || (cf = {}));
