import EventEmitter from "events";

const NOOP = function() {};

class Img extends EventEmitter {
  constructor(src) {
    super();
    this._originalSrc = src;
    this._img = new Image();
    this._img.onload = this.emit.bind(this, "load");
    this._img.onerror = this.emit.bind(this, "error");
    this._img.crossOrigin = true;
    this._img.src = src;

    // The default impl of events emitter will throw on any "error" event unless
    // there is at least 1 handler. Logging anything in this case is unnecessary
    // since the browser console will log it too.
    this.on("error", NOOP);

    // Default is just 10.
    this.setMaxListeners(100);
  }

  destructor() {
    this.removeAllListeners();
  }

  getOriginalSrc() {
    return this._originalSrc;
  }

  getRawImage() {
    return this._img;
  }

  getWidth() {
    return this._img.naturalWidth;
  }

  getHeight() {
    return this._img.naturalHeight;
  }

  isLoaded() {
    return this._img.naturalHeight > 0;
  }
}

const kInstancePoolLength = 300;

const _instancePool = {
  length: 0,
  // Keep all the nodes in memory.
  elements: {

  },

  // Push with 0 frequency
  push(hash, data) {
    this.length++;
    this.elements[hash] = {
      hash: hash, // Helps identifying
      freq: 0,
      data: data
    };
  },

  get(path) {
    let element = this.elements[path];

    if( element ){
      element.freq++;
      return element.data;
    }

    return null;
  },

  // used to explicitely remove the path
  removeElement(path) {
    // Now almighty GC can claim this soul
    let element = this.elements[path];
    delete this.elements[path];
    this.length--;
    return element;
  },

  _reduceLeastUsed(least, currentHash) {
    let current = _instancePool.elements[currentHash];

    if( least.freq > current.freq ){
      return current;
    }

    return least;
  },

  popLeastUsed() {
    let reducer = _instancePool._reduceLeastUsed;
    let minUsed = Object.keys(this.elements).reduce(reducer, { freq: Infinity });

    if( minUsed.hash ){
      return this.removeElement(minUsed.hash);
    }

    return null;
  }
};

export const ImageCache = {
  get(src) {
    let image = _instancePool.get(src);
    if (!image) {
      // Awesome LRU
      image = new Img(src);
      if (_instancePool.length >= kInstancePoolLength) {
        _instancePool.popLeastUsed().destructor();
      }
      _instancePool.push(image.getOriginalSrc(), image);
    }
    return image;
  }
};
