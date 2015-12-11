function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

export function drawImage (context, image, { left: x, top: y, width, height }, style) {
  style = style || {};

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
  var focusPoint = style.focusPoint;

  actualSize = {
    width: image.getWidth(),
    height: image.getHeight()
  };

  if (width === 0) {
    width = actualSize.width;
  }

  if (height === 0) {
    height = actualSize.height;
  }

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
    if (style.originalHeight) {
      focusPoint.x *= (actualSize.height / style.originalHeight);
      focusPoint.y *= (actualSize.height / style.originalHeight);
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

export function drawText(context, textMetrics, fontFace, {left: x, top: y, width: maxWidth, height: maxHeight}, style) {
  let currX = x;
  let currY = y;
  let currText;
  style = style || {};

  let fontSize = style.fontSize || 16;
  let lineHeight = style.lineHeight || 18;
  let textAlign = style.textAlign || "left";
  let backgroundColor = style.backgroundColor || "transparent";
  let color = style.color || "#000";

  context.save();

  const {width,height,lines} = textMetrics;

  // Draw the background
  if (backgroundColor !== "transparent") {
    context.fillStyle = backgroundColor;
    context.fillRect(x, y, width, height);
  }

  context.fillStyle = color;
  context.font = fontFace.attributes.style + " " + fontFace.attributes.weight + " " + fontSize + "px " + fontFace.family;

  const linesCount = lines.length;
  for (let index = 0; index < linesCount; index++) {
    let line = lines[index];
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

    if ((index < linesCount - 1) &&
        (fontSize + lineHeight * (index + 1) > height)) {
      currText = currText.replace(/\,?\s?\w+$/, "…");
    }

    if (currY <= (height + y)) {
      context.fillText(currText, currX, currY);
    }
  }

  context.restore();
}
