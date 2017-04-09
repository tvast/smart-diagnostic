// namespace
var cf;
(function (cf) {
    // class
    var Dictionary = (function () {
        function Dictionary(options) {
            // can be overwritten
            this.data = {
                "user-image": "//conversational-form-static-0iznjsw.stackpathdns.com/src/images/human.png",
                "entry-not-found": "Dictionary item not found.",
                "input-placeholder": "Type your answer here ...",
                "group-placeholder": "Type to filter list ...",
                "input-placeholder-error": "Your input is not correct ...",
                "input-placeholder-required": "Input is required ...",
                "input-placeholder-file-error": "File upload failed ...",
                "input-placeholder-file-size-error": "File size too big ...",
                "input-no-filter": "No results found for <strong>{input-value}</strong>",
                "user-reponse-and": " and ",
                "user-reponse-missing": "Missing input ...",
                "user-reponse-missing-group": "Nothing selected ...",
                "general": "General type1|General type2",
                "icon-type-file": "<svg class='cf-icon-file' viewBox='0 0 10 14' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><g stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'><g transform='translate(-756.000000, -549.000000)' fill='#0D83FF'><g transform='translate(736.000000, 127.000000)'><g transform='translate(0.000000, 406.000000)'><polygon points='20 16 26.0030799 16 30 19.99994 30 30 20 30'></polygon></g></g></g></g></svg>",
            };
            // can be overwriten
            this.robotData = {
                "robot-image": "//conversational-form-static-0iznjsw.stackpathdns.com/src/images/robot.png",
                "input": "Please write some text.",
                "text": "Please write some text.",
                "checkbox": "Select as many as you want.",
                "name": "What's your name?",
                "email": "Need your e-mail.",
                "password": "Please provide password",
                "tel": "What's your phone number?",
                "radio": "I need you to select one of these.",
                "select": "Choose any of these options.",
                "general": "General1|General2|General3.."
            };
            Dictionary.instance = this;
            // overwrite data if defined 
            if (options && options.data)
                this.data = this.validateAndSetNewData(options.data, this.data);
            // overwrite user image
            if (options.userImage)
                this.data["user-image"] = options.userImage;
            // overwrite robot image
            if (options.robotImage)
                this.robotData["robot-image"] = options.robotImage;
            // overwrite robot questions if defined
            if (options && options.robotData)
                this.robotData = this.validateAndSetNewData(options.robotData, this.robotData);
        }
        Dictionary.get = function (id) {
            var ins = Dictionary.instance;
            var value = ins.data[id];
            if (!value) {
                value = ins.data["entry-not-found"];
            }
            else {
                var values = value.split("|");
                value = values[Math.floor(Math.random() * values.length)];
            }
            return value;
        };
        /**
        * @name set
        * set a dictionary value
        *	id: string, id of the value to update
        *	type: string, "human" || "robot"
        *	value: string, value to be inserted
        */
        Dictionary.set = function (id, type, value) {
            var ins = Dictionary.instance;
            var obj = type == "robot" ? ins.robotData : ins.data;
            obj[id] = value;
            return obj[id];
        };
        Dictionary.getRobotResponse = function (tagType) {
            var ins = Dictionary.instance;
            var value = ins.robotData[tagType];
            if (!value) {
                // value not found, so pick a general one
                var generals = ins.robotData["general"].split("|");
                value = generals[Math.floor(Math.random() * generals.length)];
            }
            else {
                var values = value.split("|");
                value = values[Math.floor(Math.random() * values.length)];
            }
            return value;
        };
        Dictionary.parseAndGetMultiValueString = function (arr) {
            // check ControlElement.ts for value(s)
            var value = "";
            for (var i = 0; i < arr.length; i++) {
                var str = arr[i];
                var sym = (arr.length > 1 && i == arr.length - 2 ? Dictionary.get("user-reponse-and") : ", ");
                value += str + (i < arr.length - 1 ? sym : "");
            }
            return value;
        };
        Dictionary.prototype.validateAndSetNewData = function (newData, originalDataObject) {
            for (var key in originalDataObject) {
                if (!newData[key]) {
                    console.warn("Conversational Form Dictionary warning, '" + key + "' value is undefined, mapping '" + key + "' to default value. See Dictionary.ts for keys.");
                    newData[key] = originalDataObject[key];
                }
            }
            return newData;
        };
        return Dictionary;
    }());
    Dictionary.keyCodes = {
        "left": 37,
        "right": 39,
        "down": 40,
        "up": 38,
        "backspace": 8,
        "enter": 13,
        "space": 32,
        "shift": 16,
        "tab": 9,
    };
    cf.Dictionary = Dictionary;
})(cf || (cf = {}));
