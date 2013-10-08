scroll2play
===========

Simple JS lib that mimics video playback while scrolling browser window. You can see it in action [here](http://pwalczyszyn.github.io/scroll2play/).

## API

`Scroll2Play` requires support of [vw & vh](http://www.w3.org/TR/css3-values/#viewport-relative-lengths) units of measure and `window.URL.createObjectURL`.
These requirements should be met by modern browsers as you can see [here](http://caniuse.com/viewport-units) and [here](http://caniuse.com/bloburls).

### Constructor

`Scroll2Play` constructor accepts following parameters:

* `elId` - Scroll2Play container id.
* `lowResImgsUrl` - Relative or absolute path to low resolution images folder.
* `highResImgsUrl` - Relative or absolute path to high resolution images folder. If it's null it will not use high res images when scrolling is stopped.
* `imgPrefix` - Image file prefix.
* `imgsCount` - Number of available images.
* `imgsType` - Images type, like: 'jpg', 'png', 'gif'...
* `imgsNumFormat` - Format for images numbering, like: 0000 will be substitued with 0001, 0002,...,0010 etc.

### Functions

Instance of `Scroll2Play` has only one function `load` that intiates loading of low res images.

### Events

It dispatches three events:

* `onload` - Dispatched when loading images is complete.
* `onprogress` - Dispatched during images loading with a progress value param.
* `onerror` - Dispatched when loading any of the images failes. After this event loading of images is stopped.

### Usage

This is how you can use it in your own project:

    // Instantiate Scroll2Play
    var s2p = new Scroll2Play('s2p-container', 'images/lowres', 'images/highres', 'wakey-', 55, 'jpg', '00');

    // Listen to progress of images loading
    s2p.onprogress = function(progress) {
        var loader = document.querySelector('.loader');
        loader.innerHTML = 'Loading ' + Math.floor(progress * 100) + '%';
    }

    // Images loaded event
    s2p.onload = function() {
        document.body.classList.remove('loading');
    }

    // Listen to images loading error
    s2p.onerror = function(e) {
        alert('Couldn't load sequance images!');
    }

    // Start images loading
    s2p.load();


## License

  MIT
