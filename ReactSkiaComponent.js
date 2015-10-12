import ReactMultiChild from "react/lib/ReactMultiChild";
import assign from "react/lib/Object.assign";
import invariant from "invariant";

export let rootNode;

// For quickly matching children type, to test if can be treated as
// content.
const CONTENT_TYPES = {
  "string": true,
  "number": true,
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

export class ReactSkiaComponent {
  constructor(tag) {
    this._tag = tag.toLowerCase();
    this._renderedChildren = null;
    this._rootNodeID = null;
    this._canvasContext = null;
    this._parentNode = null;

    // NOTE(pierre): this is due to css-layout
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

    const children = props && props.children || [];
    const childrenToUse = [].concat(children);

    checkContentTypes(type, childrenToUse);

    this.style = props;
    this.isDirty = true;

    if (type === "text") {
      this.text = childrenToUse.join("");
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
    this.style = nextProps;

    // TODO(pierre): optimize this dirty flag
    this.isDirty = true;

    const children = nextProps && nextProps.children;
    const childrenToUse = children == null ? [] : [].concat(children);

    checkContentTypes(type, childrenToUse);

    if (type === "text") {
      this.text = childrenToUse.join("");
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
    if (this._parentNode) {
      this._parentNode.dirtyLayout();
    }
  }

  cleanLayout() {
    this.isDirty = false;
  }
}

assign(ReactSkiaComponent.prototype, ReactMultiChild.Mixin);
