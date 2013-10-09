/*jslint browser: true, curly: false*/
(function () {
    'use strict';

    /**
     * Scroll2Play type constructor.
     *
     * @constructor
     * @this {Scroll2Play}
     * @param {String} elId Scroll2Play container id.
     * @param {String} lowResImgsUrl Path to low res images folder.
     * @param {String} highResImgsUrl Path to low high images folder.
     * @param {String} imgPrefix Image file prefix.
     * @param {String} imgsCount Number of available images.
     * @param {String} imgsType Images type, like: 'jpg', 'png', 'gif'...
     * @param {String} imgsNumFormat Format for images numbering, like: 0000 will be substitued with 0001, 0002,...,0010 etc.
     */
    var Scroll2Play = window.Scroll2Play = function Scroll2Play(elId, lowResImgsUrl, highResImgsUrl, imgPrefix, imgsCount, imgsType, imgsNumFormat) {
        this.el = document.getElementById(elId);
        if (!this.el) throw new Error('Element with specified id doesn\'t exist!');
        this.el.style.cssText += 'position:fixed;overflow:hidden;width:100%;height:100%;';

        this.img = document.createElement('img');
        this.img.style.cssText = 'position:relative;height:auto;width:auto;min-height:100vh;min-width:100vw;';
        this.el.appendChild(this.img);

        this.lowResImgsUrl = lowResImgsUrl;
        this.highResImgsUrl = highResImgsUrl;
        this.imgPrefix = imgPrefix;
        this.imgsCount = imgsCount;
        this.imgsType = imgsType ? imgsType : 'jpg';
        this.imgsNumFormat = imgsNumFormat ? imgsNumFormat : '0';

        this.xhrs = [];
        this.images = [];
    };

    /**
     * Initiates loading of low res images.
     *
     * @fires Scroll2Play#onload Fired when loading images is complete.
     * @fires Scroll2Play#onprogress Fired during images loading, callback param is % of progress.
     * @fires Scroll2Play#onerror Fired when loading images fails.
     * @return {Scroll2Play}
     */
    Scroll2Play.prototype.load = function s2p_load() {
        var that = this,
            loaded = 0,
            error = false;

        for (var i = 0; i < this.imgsCount; i++) {
            that.xhrs[i] = xhr();
        }

        function xhr() {
            var req = new XMLHttpRequest();
            req.open('GET', that._getImgUrl(that.lowResImgsUrl, i), true);
            req.responseType = 'blob';
            req.addEventListener('load', xhr_loadHandler(i), false);
            req.addEventListener('error', xhr_errorHandler(), false);
            req.addEventListener('abort', xhr_abortHandler(), false);
            req.send();
            return req;
        }

        function xhr_loadHandler(i) {
            return function _xhr_loadHandler(e) {
                if (!error) {

                    // Creating BLOB references
                    that.images[i] = window.URL.createObjectURL(e.target.response);

                    // Incrementing num of loaded images
                    loaded++;

                    if (that.onprogress) {
                        that.onprogress(loaded / that.imgsCount);
                    }
                    if (loaded == that.imgsCount) {
                        delete that.xhrs; // Cleaning up
                        if (that.onload) that.onload();
                        that._handleScrolling();
                    }
                }
            };
        }

        function xhr_errorHandler() {
            return function (e) {
                error = true;
                if (that.onerror) that.onerror(e);
            };
        }

        function xhr_abortHandler() {
            return function (e) {
                error = true;
                if (that.onerror) that.onerror(e);
            };
        }

        return this;
    };

    /**
     * @event
     */
    Scroll2Play.prototype.onload = function () {};

    /**
     * @event
     */
    Scroll2Play.prototype.onerror = function () {};

    /**
     * @event
     * @param {Number} progress Progress at which loading low res images is. Values range 0-1.
     */
    /*jshint unused: vars */
    Scroll2Play.prototype.onprogress = function (progress) {};

    /**
     * @private
     */
    Scroll2Play.prototype._getImgUrl = function s2p_getImgUrl(url, imgNum) {
        var strNum = String(imgNum);
        return url + '/' + this.imgPrefix + this.imgsNumFormat.substr(0, this.imgsNumFormat.length - strNum.length) + strNum + '.' + this.imgsType;
    };

    /**
     * @private
     */
    Scroll2Play.prototype._handleScrolling = function s2p_handleScrolling() {
        var that = this,
            prevImgNum = null,
            scrollEndTimeout = null;

        function window_scrollHandler() { // Handling window scroll event

            // First clearing the timeout, if there is one already
            if (scrollEndTimeout !== null) {
                clearTimeout(scrollEndTimeout);
            }

            var img,
                imgNum = Math.round(window.pageYOffset / document.body.clientHeight * that.images.length);
            if (null === prevImgNum || prevImgNum != imgNum) {
                img = that.images[imgNum];
                if (img) {
                    // Setting src
                    that.img.src = img;
                    // Resizing and repositioning image
                    window_resizeHandler();
                    // Setting prev image num so it doesn't reload it unecessarly
                    prevImgNum = imgNum;
                }
            }

            scrollEndTimeout = setTimeout(function () {
                that._loadHighResImg(imgNum);
            }, 250);
        }
        window.addEventListener('scroll', window_scrollHandler, false);
        window_scrollHandler();

        function window_resizeHandler() { // Centering image
            // Updating min-width & min-height so it doesn't use img width & height
            var top = (window.innerHeight - that.img.height) / 2 + 'px',
                left = (window.innerWidth - that.img.width) / 2 + 'px';
            that.img.style.cssText = 'position:relative;height:auto;width:auto;min-height:100vh;min-width:100vw;top:' + top + ';left:' + left;
        }
        window.addEventListener('resize', window_resizeHandler, false);
    };

    /**
     * @private
     */
    /*jshint unused: vars */
    Scroll2Play.prototype._loadHighResImg = function s2p_loadHighResImg(imgNum) {
        if (this.highResImgsUrl) {
            var width = this.img.width,
                height = this.img.height;
            this.img.src = this._getImgUrl(this.highResImgsUrl, imgNum);
            this.img.width = width;
            this.img.height = height;
        }
    };

})();
