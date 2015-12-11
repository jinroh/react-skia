import ReactMultiChild from "react/lib/ReactMultiChild";
import assign from "react/lib/Object.assign";
import invariant from "invariant";
import {FontFace, isFontLoaded} from "./html5/fonts";
import measureText from "./html5/measureText";

export let rootNode;

// For quickly matching children type, to test if can be treated as
// content.
const CONTENT_TYPES = {
  "string": true,
  "number": true,
};

const DEFAULT_TEXT_STYLES = {
  fontSize: 16,
  lineHeight: 18,
  textAlign: "left",
  backgroundColor: "transparent",
  color: "#000",
  fontFace: FontFace.Default(),
};

function checkContentTypes(tag, children) {
  if (__DEV__) {
    for (let i = 0; i < children.length; i++) {
      let c = children[i];
      if (tag === "text") {
        invariant(
          CONTENT_TYPES[typeof c],
          "text component only accept text or numeric content");
      } else {
        invariant(
          !CONTENT_TYPES[typeof c],
          "text or numeric content are only accpeted by <text> components and not %s",
          tag);
      }
    }
  }
}

function measureTextLayout(width) {
  // TODO(pierre): check if layout hasn't changed from last saved
  // metrics
  // if (this.textMetrics) {
  //   return this.textMetrics;
  // }

  if (isFontLoaded(this.style.fontFace)) {
    this.textMetrics = measureText(
      this.text,
      width,
      this.style.fontFace,
      this.style.fontSize,
      this.style.lineHeight
    );
  }

  if (this.textMetrics) {
    return {
      width:  this.textMetrics.width,
      height: this.textMetrics.height,
    };
  } else {
    return {
      width:  0,
      height: 0,
    };
  }
}

function applyDefaultStyles(node, defaults) {
  var {style} = node;
  for (var styleName in defaults) {
    if (style[styleName] == null) {
      style[styleName] = defaults[styleName];
    }
  }
  if (!style.measure) {
    style.measure = measureTextLayout.bind(node);
  }
}

export class ReactSkiaComponent {
  constructor(tag) {
    this._tag = tag.toLowerCase();
    this._renderedChildren = null;
    this._rootNodeID = null;
    this._canvasContext = null;
    this._parentNode = null;

    // NOTE(pierre): this is for css-layout
    this.shouldUpdate = false;
    this.lastLayout = null;
    this.lineIndex = 0;
    this.nextAbsoluteChild = null;
    this.nextFlexChild = null;
    this.layout = {
      width: undefined,
      height: undefined,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    };

    this.type = this._tag;
    this.style = null;
    this.text = "";
    this.textMetrics = null;
    this.isDirty = false;
    this.children = [];
  }

  construct(element) {
    this._currentElement = element;
  }

  getCanvasContext() {
    return this._canvasContext;
  }

  mountComponent(rootID, transaction, context) {
    if (rootID.match(/\./g).length === 1) {
      rootNode = this;
    }

    this._parentNode = context.parent;
    this._canvasContext = context.canvasContext;
    this._rootNodeID = rootID;
    const props = this._currentElement.props;
    const type = this.type;

    this.style = (props && props.style) || {};
    this.isDirty = true;

    const children = props && props.children || [];
    const childrenToUse = [].concat(children);

    checkContentTypes(type, childrenToUse);

    if (type === "text") {
      this.text = childrenToUse.join("");
      applyDefaultStyles(this, DEFAULT_TEXT_STYLES);
    }
    else {
      context.parent = this;
      let mountedChildren = this.mountChildren(
        childrenToUse,
        transaction,
        context
      );
      if (Array.isArray(mountedChildren)) {
        this.children = mountedChildren;
      }
    }

    return this;
  }

  receiveComponent(nextElement, transaction, context) {
    const nextProps = nextElement.props;
    const type = this.type;

    this._currentElement = nextElement;
    this.style = (nextProps && nextProps.style) || {};
    this.dirtyLayout();

    const children = nextProps && nextProps.children;
    const childrenToUse = children == null ? [] : [].concat(children);

    checkContentTypes(type, childrenToUse);

    if (type === "text") {
      this.text = childrenToUse.join("");
      applyDefaultStyles(this, DEFAULT_TEXT_STYLES);
    }
    else {
      this.updateChildren(
        childrenToUse,
        transaction,
        context
      );
    }
  }

  unmountComponent() {
    this.unmountChildren();
    this._rootNodeID = null;
    this._parentNode = null;
    this.style = null;
    this.text = "";
    this.children = null;
    this.layout = null;
  }

  dirtyLayout() {
    this.isDirty = true;
    this.layout.width = undefined;
    this.layout.height = undefined;
    this.layout.top = 0;
    this.layout.left = 0;
    this.layout.right = 0;
    this.layout.bottom = 0;
    if (this._parentNode) {
      this._parentNode.dirtyLayout();
    }
  }

  cleanLayout() {
    this.isDirty = false;
  }
}

assign(ReactSkiaComponent.prototype, ReactMultiChild.Mixin);
