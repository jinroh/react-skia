import {computeLayout} from "css-layout/src/Layout.js";
import {FontFace, isFontLoaded} from "./fonts";
import {drawText, drawImage} from "./utils";

export function repaintAll(renderTreeRootNode) {
  let context = renderTreeRootNode.getCanvasContext();
  computeLayout(renderTreeRootNode);
  clear(renderTreeRootNode, context);
  renderNode(renderTreeRootNode, context);
}

function clear(node, context) {
  context.clearRect(0, 0, node.layout.width, node.layout.height);
}

function sortByZIndexAscending(a, b) {
  return (a.zIndex || 0) - (b.zIndex || 0);
}

function renderNode(node, context) {
  const {type, style, layout, text, children} = node;

  var hasOpacity = (style.opacity != null);
  if (hasOpacity && style.opacity <= 0) {
    return;
  }

  let drawingCustomFunc;
  switch (type) {
  case "text":
    drawingCustomFunc = drawLayoutedText;
    break;
  }

  const saveContext = (
    (hasOpacity && style.opacity < 1) ||
    (style.translateX || style.translateY)
  );

  if (saveContext) {
    context.save();

    if (hasOpacity && style.opacity < 1) {
      context.globalAlpha = style.opacity;
    }

    if (style.translateX || style.translateY) {
      context.translate(style.translateX || 0, style.translateY || 0);
    }
  }

  context.save();
  renderBase(style, layout, context);
  if (drawingCustomFunc) {
    drawingCustomFunc(style, layout, text, context);
  }
  context.restore();

  if (children.length) {
    let childrenToDraw = children.slice().sort(sortByZIndexAscending);
    for (let i = 0; i < childrenToDraw.length; i++) {
      renderNode(childrenToDraw[i], context);
    }
  }

  node.cleanLayout();

  if (saveContext) {
    context.restore();
  }
}

function renderBase(style, layout, context) {
  // TODO: border
  if (style.backgroundColor) {
    context.fillStyle = style.backgroundColor;
    context.fillRect(layout.left, layout.top, layout.width, layout.height);
  }
}

function drawLayoutedText(style, layout, text, context) {
  var fontFace = style.fontFace || FontFace.Default();
  if (isFontLoaded(fontFace)) {
    drawText(context, text, fontFace, layout, style);
  }
}
