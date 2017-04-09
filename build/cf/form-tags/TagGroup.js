/// <reference path="ButtonTag.ts"/>
/// <reference path="InputTag.ts"/>
/// <reference path="SelectTag.ts"/>
/// <reference path="../ui/UserInput.ts"/>
// group tags together, this is done automatically by looking through InputTags with type radio or checkbox and same name attribute.
// single choice logic for Radio Button, <input type="radio", where name is the same
// multi choice logic for Checkboxes, <input type="checkbox", where name is the same
// namespace
var cf;
(function (cf) {
    // class
    var TagGroup = (function () {
        function TagGroup(options) {
            this.elements = options.elements;
            if (cf.ConversationalForm.illustrateAppFlow)
                console.log('Conversational Form > TagGroup registered:', this.elements[0].type, this);
        }
        Object.defineProperty(TagGroup.prototype, "required", {
            get: function () {
                for (var i = 0; i < this.elements.length; i++) {
                    var element = this.elements[i];
                    if (this.elements[i].required) {
                        return true;
                    }
                }
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "eventTarget", {
            set: function (value) {
                this._eventTarget = value;
                for (var i = 0; i < this.elements.length; i++) {
                    var tag = this.elements[i];
                    tag.eventTarget = value;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "type", {
            get: function () {
                return "group";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "name", {
            get: function () {
                return this.elements[0].name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "label", {
            get: function () {
                return this.elements[0].label;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "question", {
            get: function () {
                // check if elements have the questions, else fallback
                var tagQuestion = this.elements[0].question;
                if (tagQuestion) {
                    return tagQuestion;
                }
                else {
                    // fallback to robot response from dictionary
                    var robotReponse = cf.Dictionary.getRobotResponse(this.getGroupTagType());
                    return robotReponse;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "activeElements", {
            get: function () {
                return this._activeElements;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "value", {
            get: function () {
                // TODO: fix value???
                return this._values;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "disabled", {
            get: function () {
                var disabled = false;
                for (var i = 0; i < this.elements.length; i++) {
                    var element = this.elements[i];
                    if (element.disabled)
                        disabled = true;
                }
                return disabled;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TagGroup.prototype, "errorMessage", {
            get: function () {
                var errorMessage = cf.Dictionary.get("input-placeholder-error");
                for (var i = 0; i < this.elements.length; i++) {
                    var element = this.elements[i];
                    errorMessage = element.errorMessage;
                }
                return errorMessage;
            },
            enumerable: true,
            configurable: true
        });
        TagGroup.prototype.dealloc = function () {
            for (var i = 0; i < this.elements.length; i++) {
                var element = this.elements[i];
                element.dealloc();
            }
            this.elements = null;
        };
        TagGroup.prototype.refresh = function () {
            for (var i = 0; i < this.elements.length; i++) {
                var element = this.elements[i];
                element.refresh();
            }
        };
        TagGroup.prototype.getGroupTagType = function () {
            return this.elements[0].type;
        };
        TagGroup.prototype.setTagValueAndIsValid = function (value) {
            var isValid = false;
            var groupType = this.elements[0].type;
            this._values = [];
            this._activeElements = [];
            switch (groupType) {
                case "radio":
                    var numberRadioButtonsVisible = [];
                    var wasRadioButtonChecked = false;
                    for (var i = 0; i < value.controlElements.length; i++) {
                        var element = value.controlElements[i];
                        var tag = this.elements[this.elements.indexOf(element.referenceTag)];
                        if (element.visible) {
                            numberRadioButtonsVisible.push(element);
                            if (tag == element.referenceTag) {
                                tag.domElement.checked = element.checked;
                                if (element.checked) {
                                    this._values.push(tag.value);
                                    this._activeElements.push(tag);
                                }
                                // a radio button was checked
                                if (!wasRadioButtonChecked && element.checked)
                                    wasRadioButtonChecked = true;
                            }
                        }
                    }
                    // special case 1, only one radio button visible from a filter
                    if (!isValid && numberRadioButtonsVisible.length == 1) {
                        var element = numberRadioButtonsVisible[0];
                        var tag = this.elements[this.elements.indexOf(element.referenceTag)];
                        element.checked = true;
                        tag.domElement.checked = true;
                        isValid = true;
                        if (element.checked) {
                            this._values.push(tag.value);
                            this._activeElements.push(tag);
                        }
                    }
                    else if (!isValid && wasRadioButtonChecked) {
                        // a radio button needs to be checked of
                        isValid = wasRadioButtonChecked;
                    }
                    break;
                case "checkbox":
                    // checkbox is always valid
                    isValid = true;
                    for (var i = 0; i < value.controlElements.length; i++) {
                        var element = value.controlElements[i];
                        var tag = this.elements[this.elements.indexOf(element.referenceTag)];
                        tag.domElement.checked = element.checked;
                        if (element.checked) {
                            this._values.push(tag.value);
                            this._activeElements.push(tag);
                        }
                    }
                    break;
            }
            return isValid;
        };
        return TagGroup;
    }());
    cf.TagGroup = TagGroup;
})(cf || (cf = {}));
