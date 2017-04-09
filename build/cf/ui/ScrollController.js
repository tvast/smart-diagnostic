/// <reference path="../logic/Helpers.ts"/>
/// <reference path="../logic/EventDispatcher.ts"/>
// namespace
var cf;
(function (cf) {
    var ScrollController = (function () {
        function ScrollController(options) {
            this.listWidth = 0;
            this.visibleAreaWidth = 0;
            this.max = 0;
            this.interacting = false;
            this.x = 0;
            this.xTarget = 0;
            this.startX = 0;
            this.startXTarget = 0;
            this.mouseSpeed = 0;
            this.mouseSpeedTarget = 0;
            this.direction = 0;
            this.directionTarget = 0;
            this.inputAccerlation = 0;
            this.inputAccerlationTarget = 0;
            this.interactionListener = options.interactionListener;
            this.eventTarget = options.eventTarget;
            this.listToScroll = options.listToScroll;
            this.prevButton = options.listNavButtons[0];
            this.nextButton = options.listNavButtons[1];
            this.onListNavButtonsClickCallback = this.onListNavButtonsClick.bind(this);
            this.prevButton.addEventListener("click", this.onListNavButtonsClickCallback, false);
            this.nextButton.addEventListener("click", this.onListNavButtonsClickCallback, false);
            this.documentLeaveCallback = this.documentLeave.bind(this);
            this.onInteractStartCallback = this.onInteractStart.bind(this);
            this.onInteractEndCallback = this.onInteractEnd.bind(this);
            this.onInteractMoveCallback = this.onInteractMove.bind(this);
            document.addEventListener("mouseleave", this.documentLeaveCallback, false);
            document.addEventListener(cf.Helpers.getMouseEvent("mouseup"), this.documentLeaveCallback, false);
            this.interactionListener.addEventListener(cf.Helpers.getMouseEvent("mousedown"), this.onInteractStartCallback, false);
            this.interactionListener.addEventListener(cf.Helpers.getMouseEvent("mouseup"), this.onInteractEndCallback, false);
            this.interactionListener.addEventListener(cf.Helpers.getMouseEvent("mousemove"), this.onInteractMoveCallback, false);
        }
        ScrollController.prototype.onListNavButtonsClick = function (event) {
            var dirClick = event.currentTarget.getAttribute("direction");
            this.pushDirection(dirClick == "next" ? -1 : 1);
        };
        ScrollController.prototype.documentLeave = function (event) {
            this.onInteractEnd(event);
        };
        ScrollController.prototype.onInteractStart = function (event) {
            var vector = cf.Helpers.getXYFromMouseTouchEvent(event);
            this.interacting = true;
            this.startX = vector.x;
            this.startXTarget = this.startX;
            this.inputAccerlation = 0;
            this.render();
        };
        ScrollController.prototype.onInteractEnd = function (event) {
            this.interacting = false;
        };
        ScrollController.prototype.onInteractMove = function (event) {
            if (this.interacting) {
                var vector = cf.Helpers.getXYFromMouseTouchEvent(event);
                var newAcc = vector.x - this.startX;
                var magnifier = 6.2;
                this.inputAccerlationTarget = newAcc * magnifier;
                this.directionTarget = this.inputAccerlationTarget < 0 ? -1 : 1;
                this.startXTarget = vector.x;
            }
        };
        ScrollController.prototype.render = function () {
            var _this = this;
            if (this.rAF)
                cancelAnimationFrame(this.rAF);
            // normalise startX
            this.startX += (this.startXTarget - this.startX) * 0.2;
            // animate accerlaration
            this.inputAccerlation += (this.inputAccerlationTarget - this.inputAccerlation) * (this.interacting ? Math.min(ScrollController.accerlation + 0.1, 1) : ScrollController.accerlation);
            var accDamping = 0.25;
            this.inputAccerlationTarget *= accDamping;
            // animate directions
            this.direction += (this.directionTarget - this.direction) * 0.2;
            // extra extra
            this.mouseSpeed += (this.mouseSpeedTarget - this.mouseSpeed) * 0.2;
            this.direction += this.mouseSpeed;
            // animate x
            this.xTarget += this.inputAccerlation * 0.05;
            // bounce back when over
            if (this.xTarget > 0)
                this.xTarget += (0 - this.xTarget) * cf.Helpers.lerp(ScrollController.accerlation, 0.3, 0.8);
            if (this.xTarget < this.max)
                this.xTarget += (this.max - this.xTarget) * cf.Helpers.lerp(ScrollController.accerlation, 0.3, 0.8);
            this.x += (this.xTarget - this.x) * 0.4;
            // toggle visibility on nav arrows
            var xRounded = Math.round(this.x);
            if (xRounded < 0) {
                if (!this.prevButton.classList.contains("active"))
                    this.prevButton.classList.add("active");
                if (!this.prevButton.classList.contains("cf-gradient"))
                    this.prevButton.classList.add("cf-gradient");
            }
            if (xRounded == 0) {
                if (this.prevButton.classList.contains("active"))
                    this.prevButton.classList.remove("active");
                if (this.prevButton.classList.contains("cf-gradient"))
                    this.prevButton.classList.remove("cf-gradient");
            }
            if (xRounded > this.max) {
                if (!this.nextButton.classList.contains("active"))
                    this.nextButton.classList.add("active");
                if (!this.nextButton.classList.contains("cf-gradient"))
                    this.nextButton.classList.add("cf-gradient");
            }
            if (xRounded <= this.max) {
                if (this.nextButton.classList.contains("active"))
                    this.nextButton.classList.remove("active");
                if (this.nextButton.classList.contains("cf-gradient"))
                    this.nextButton.classList.remove("cf-gradient");
            }
            // set css transforms
            var xx = this.x;
            cf.Helpers.setTransform(this.listToScroll, "translateX(" + xx + "px)");
            // cycle render
            if (this.interacting || (Math.abs(this.x - this.xTarget) > 0.02 && !this.interacting))
                this.rAF = window.requestAnimationFrame(function () { return _this.render(); });
        };
        ScrollController.prototype.setScroll = function (x, y) {
            this.xTarget = this.visibleAreaWidth == this.listWidth ? 0 : x;
            this.render();
        };
        ScrollController.prototype.pushDirection = function (dir) {
            this.inputAccerlationTarget += (5000) * dir;
            this.render();
        };
        ScrollController.prototype.dealloc = function () {
            this.prevButton.removeEventListener("click", this.onListNavButtonsClickCallback, false);
            this.nextButton.removeEventListener("click", this.onListNavButtonsClickCallback, false);
            this.onListNavButtonsClickCallback = null;
            this.prevButton = null;
            this.nextButton = null;
            document.removeEventListener("mouseleave", this.documentLeaveCallback, false);
            document.removeEventListener(cf.Helpers.getMouseEvent("mouseup"), this.documentLeaveCallback, false);
            this.interactionListener.removeEventListener(cf.Helpers.getMouseEvent("mousedown"), this.onInteractStartCallback, false);
            this.interactionListener.removeEventListener(cf.Helpers.getMouseEvent("mouseup"), this.onInteractEndCallback, false);
            this.interactionListener.removeEventListener(cf.Helpers.getMouseEvent("mousemove"), this.onInteractMoveCallback, false);
            this.documentLeaveCallback = null;
            this.onInteractStartCallback = null;
            this.onInteractEndCallback = null;
            this.onInteractMoveCallback = null;
        };
        ScrollController.prototype.reset = function () {
            this.interacting = false;
            this.startX = 0;
            this.startXTarget = this.startX;
            this.inputAccerlation = 0;
            this.x = 0;
            this.xTarget = 0;
            cf.Helpers.setTransform(this.listToScroll, "translateX(0px)");
            this.render();
            this.prevButton.classList.remove("active");
            this.nextButton.classList.remove("active");
        };
        ScrollController.prototype.resize = function (listWidth, visibleAreaWidth) {
            this.reset();
            this.visibleAreaWidth = visibleAreaWidth;
            this.listWidth = Math.max(visibleAreaWidth, listWidth);
            this.max = (this.listWidth - this.visibleAreaWidth) * -1;
            this.render();
        };
        return ScrollController;
    }());
    ScrollController.accerlation = 0.1;
    cf.ScrollController = ScrollController;
})(cf || (cf = {}));
