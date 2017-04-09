/// <reference path="../logic/EventDispatcher.ts"/>
// namespace
var cf;
(function (cf) {
    // class
    var BasicElement = (function () {
        function BasicElement(options) {
            this.eventTarget = options.eventTarget;
            // TODO: remove
            if (!this.eventTarget)
                throw new Error("this.eventTarget not set!! : " + this.constructor.name);
            this.setData(options);
            this.createElement();
        }
        BasicElement.prototype.setData = function (options) {
        };
        BasicElement.prototype.createElement = function () {
            var template = document.createElement('template');
            template.innerHTML = this.getTemplate();
            this.el = template.firstChild || template.content.firstChild;
            return this.el;
        };
        // template, should be overwritten ...
        BasicElement.prototype.getTemplate = function () { return "should be overwritten..."; };
        ;
        BasicElement.prototype.dealloc = function () {
            this.el.parentNode.removeChild(this.el);
        };
        return BasicElement;
    }());
    cf.BasicElement = BasicElement;
})(cf || (cf = {}));
