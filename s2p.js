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
var Scroll2Play = function Scroll2Play(elId, lowResImgsUrl, highResImgsUrl, imgPrefix, imgsCount, imgsType, imgsNumFormat) {
    this.el = document.getElementById(elId);
    if (!this.el) throw new Error('Element with specified id doesn\'t exist!');
    this.el.style.cssText += 'position:fixed;width:100%;height:100%;';

    this.img = new Image;
    this.img.style.cssText = 'position:relative;min-height:100vh;min-width:100vw;';
    this.el.appendChild(this.img);

    this.lowResImgsUrl = lowResImgsUrl;
    this.highResImgsUrl = highResImgsUrl;
    this.imgPrefix = imgPrefix;
    this.imgsCount = imgsCount;
    this.imgsType = imgsType ? imgsType : 'jpg';
    this.imgsNumFormat = imgsNumFormat ? imgsNumFormat : '0';

    this.images = [];
}

/**
 * Initiates loading of low res images.
 *
 * @fires Scroll2Play#onload Fired when loading images is complete.
 * @fires Scroll2Play#onprogress Fired during images loading, callback param is % of progress.
 * @return {Scroll2Play}
 */
Scroll2Play.prototype.load = function s2p_load() {
    var loaded = 0;
    for (var i = 0, img; i < this.imgsCount; i++) {
        img = new Image();
        img.style.cssText = this.img.style.cssText;

        img.src = this._getImgUrl(this.lowResImgsUrl, i);
        img.onload = function (e) {
            loaded++;
            updateProgress.call(this);
        }.bind(this);
        img.onerror = img.onabort = function (e) {
            loaded++;
            this.images.splice(this.images.indexOf(e.target), 1);
            updateProgress.call(this);
        }.bind(this);
        this.images.push(img);
    }

    function updateProgress() {
        if (this.onprogress) {
            this.onprogress(loaded / this.imgsCount);
        }
        if (loaded >= this.imgsCount) {
            if (this.onload) this.onload();
            this._handleScrolling();
        }
    }

    return this;
}

/**
 * @event
 */
Scroll2Play.prototype.onload = function () {}

/**
 * @event
 * @param {Number} progress Progress at which loading low res images is. Values range 0-1.
 */
Scroll2Play.prototype.onprogress = function (progress) {}

/**
 * @private
 */
Scroll2Play.prototype._getImgUrl = function s2p_getImgUrl(url, imgNum) {
    var strNum = String(imgNum);
    return url + '/' + this.imgPrefix + this.imgsNumFormat.substr(0, this.imgsNumFormat.length - strNum.length) + strNum + '.' + this.imgsType;
}

/**
 * @private
 */
Scroll2Play.prototype._handleScrolling = function s2p_handleScrolling() {
    var that = this,
        prevImgNum = null,
        scrollEndTimeout = null;

    function window_scrollHandler() { // Handling window scroll event

        // First clearing the timeout, if there is one already
        if (scrollEndTimeout != null) {
            clearTimeout(scrollEndTimeout);
        }

        var img,
            imgNum = Math.round(window.pageYOffset / document.body.clientHeight * that.images.length);
        if (null == prevImgNum || prevImgNum != imgNum) {
            img = that.images[imgNum];

            if (img) {
                // Getting top and left of already loaded image
                var top = (window.innerHeight - that.img.height) / 2 + 'px',
                    left = (window.innerWidth - that.img.width) / 2 + 'px';

                that.img = img;
                that.img.style.top = top;
                that.img.style.left = left;

                that.el.innerHTML = '';
                that.el.appendChild(that.img);

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
        that.img.style.top = (window.innerHeight - that.img.height) / 2 + 'px';
        that.img.style.left = (window.innerWidth - that.img.width) / 2 + 'px';
    }
    window.addEventListener('resize', window_resizeHandler, false);
    window_resizeHandler();
}

/**
 * @private
 */
Scroll2Play.prototype._loadHighResImg = function s2p_loadHighResImg(imgNum) {
    if (this.highResImgsUrl) {
        var width = this.img.width,
            height = this.img.height;
        this.img.src = this._getImgUrl(this.highResImgsUrl, imgNum);
        this.img.width = width;
        this.img.height = height;
    }
}