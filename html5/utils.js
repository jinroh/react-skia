var measureText = require("./measureText");

function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

/**
 * Draw an image into a <canvas>. This operation requires that the image
 * already be loaded.
 *
 * @param {CanvasContext} context
 * @param {Image} image The source image (from ImageCache.get())
 * @param {Number} x The x-coordinate to begin drawing
 * @param {Number} y The y-coordinate to begin drawing
 * @param {Number} width The desired width
 * @param {Number} height The desired height
 * @param {Object} options Available options are:
 *   {Number} originalWidth
 *   {Number} originalHeight
 *   {Object} focusPoint {x,y}
 *   {String} backgroundColor
 */
function drawImage (context, image, x, y, width, height, options) {
  options = options || {};

  if (options.backgroundColor) {
    context.save();
    context.fillStyle = options.backgroundColor;
    context.fillRect(x, y, width, height);
    context.restore();
  }

  var dx = 0;
  var dy = 0;
  var dw = 0;
  var dh = 0;
  var sx = 0;
  var sy = 0;
  var sw = 0;
  var sh = 0;
  var scale;
  var scaledSize;
  var actualSize;
  var focusPoint = options.focusPoint;

  actualSize = {
    width: image.getWidth(),
    height: image.getHeight()
  };

  scale = Math.max(
    width / actualSize.width,
    height / actualSize.height
  ) || 1;
  scale = parseFloat(scale.toFixed(4), 10);

  scaledSize = {
    width: actualSize.width * scale,
    height: actualSize.height * scale
  };

  if (focusPoint) {
    // Since image hints are relative to image "original" dimensions (original != actual),
    // use the original size for focal point cropping.
    if (options.originalHeight) {
      focusPoint.x *= (actualSize.height / options.originalHeight);
      focusPoint.y *= (actualSize.height / options.originalHeight);
    }
  } else {
    // Default focal point to [0.5, 0.5]
    focusPoint = {
      x: actualSize.width * 0.5,
      y: actualSize.height * 0.5
    };
  }

  // Clip the image to rectangle (sx, sy, sw, sh).
  sx = Math.round(clamp(width * 0.5 - focusPoint.x * scale, width - scaledSize.width, 0)) * (-1 / scale);
  sy = Math.round(clamp(height * 0.5 - focusPoint.y * scale, height - scaledSize.height, 0)) * (-1 / scale);
  sw = Math.round(actualSize.width - (sx * 2));
  sh = Math.round(actualSize.height - (sy * 2));

  // Scale the image to dimensions (dw, dh).
  dw = Math.round(width);
  dh = Math.round(height);

  // Draw the image on the canvas at coordinates (dx, dy).
  dx = Math.round(x);
  dy = Math.round(y);

  context.drawImage(image.getRawImage(), sx, sy, sw, sh, dx, dy, dw, dh);
}

/**
 * @param {CanvasContext} context
 * @param {String} text The text string to render
 * @param {Number} x The x-coordinate to begin drawing
 * @param {Number} y The y-coordinate to begin drawing
 * @param {Number} width The maximum allowed width
 * @param {Number} height The maximum allowed height
 * @param {FontFace} fontFace The FontFace to to use
 * @param {Object} options Available options are:
 *   {Number} fontSize
 *   {Number} lineHeight
 *   {String} textAlign
 *   {String} color
 *   {String} backgroundColor
 */
function drawText(context, text, fontFace, {top: x, left: y, width: maxWidth}, style) {
  let textMetrics;
  let currX = x;
  let currY = y;
  let currText;
  style = style || {};

  let fontSize = style.fontSize || 16;
  let lineHeight = style.lineHeight || 18;
  let textAlign = style.textAlign || "left";
  let backgroundColor = style.backgroundColor || "transparent";
  let color = style.color || "#000";

  textMetrics = measureText(
    text,
    maxWidth,
    fontFace,
    fontSize,
    lineHeight
  );

  context.save();

  let {width,height} = textMetrics;

  // Draw the background
  if (backgroundColor !== "transparent") {
    context.fillStyle = backgroundColor;
    context.fillRect(x, y, width, height);
  }

  context.fillStyle = color;
  context.font = fontFace.attributes.style + " " + fontFace.attributes.weight + " " + fontSize + "px " + fontFace.family;

  for (let index = 0; index < textMetrics.lines.length; index++) {
    let line = textMetrics.lines[index];
    currText = line.text;
    currY = (index === 0)
      ? (y + fontSize)
      : (y + fontSize + lineHeight * index);

    // Account for text-align: left|right|center
    switch (textAlign) {
    case "center":
      currX = x + (width / 2) - (line.width / 2);
      break;
    case "right":
      currX = x + width - line.width;
      break;
    default:
      currX = x;
    }

    if ((index < textMetrics.lines.length - 1) &&
      ((fontSize + lineHeight * (index + 1)) > height)) {
      currText = currText.replace(/\,?\s?\w+$/, "…");
    }

    if (currY <= (height + y)) {
      context.fillText(currText, currX, currY);
    }
  }

  context.restore();
}

/**
 * Draw a linear gradient
 *
 * @param {CanvasContext} context
 * @param {Number} x1 gradient start-x coordinate
 * @param {Number} y1 gradient start-y coordinate
 * @param {Number} x2 gradient end-x coordinate
 * @param {Number} y2 gradient end-y coordinate
 * @param {Array} colorStops Array of {(String)color, (Number)position} values
 * @param {Number} x x-coordinate to begin fill
 * @param {Number} y y-coordinate to begin fill
 * @param {Number} width how wide to fill
 * @param {Number} height how tall to fill
 */
function drawGradient(context, x1, y1, x2, y2, colorStops, x, y, width, height) {
  var grad;

  context.save();
  grad = context.createLinearGradient(x1, y1, x2, y2);

  colorStops.forEach(function (colorStop) {
    grad.addColorStop(colorStop.position, colorStop.color);
  });

  context.fillStyle = grad;
  context.fillRect(x, y, width, height);
  context.restore();
}

module.exports = {
  drawImage: drawImage,
  drawText: drawText,
  drawGradient: drawGradient,
};
