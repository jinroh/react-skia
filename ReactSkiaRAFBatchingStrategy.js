import ReactUpdates from "react/lib/ReactUpdates";

const requestAnimationFrame = window.requestAnimationFrame;

function tick() {
  ReactUpdates.flushBatchedUpdates();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

export default {
  isBatchingUpdates: true,
  batchedUpdates: function(callback, a, b, c, d, e) {
    callback(a, b, c, d, e);
  }
};
