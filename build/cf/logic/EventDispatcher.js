/// <reference path="../ConversationalForm.ts"/>
var cf;
(function (cf) {
    // interface
    var EventDispatcher = (function () {
        function EventDispatcher(cfRef) {
            this._cf = cfRef;
            this.target = document.createDocumentFragment();
        }
        Object.defineProperty(EventDispatcher.prototype, "cf", {
            get: function () {
                return this._cf;
            },
            enumerable: true,
            configurable: true
        });
        EventDispatcher.prototype.addEventListener = function (type, listener, useCapture) {
            return this.target.addEventListener(type, listener, useCapture);
        };
        EventDispatcher.prototype.dispatchEvent = function (event) {
            return this.target.dispatchEvent(event);
        };
        EventDispatcher.prototype.removeEventListener = function (type, listener, useCapture) {
            this.target.removeEventListener(type, listener, useCapture);
        };
        return EventDispatcher;
    }());
    cf.EventDispatcher = EventDispatcher;
})(cf || (cf = {}));
