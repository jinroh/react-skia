import CallbackQueue from "react/lib/CallbackQueue";
import PooledClass from "react/lib/PooledClass";
import Transaction from "react/lib/Transaction";
import assign from "react/lib/Object.assign";
import {repaintAll} from "./html5/painter";
import {rootNode} from "./ReactSkiaComponent";

const QUEUING = {
  initialize: function() {
    this.reactMountReady.reset();
  },
  close: function() {
    this.reactMountReady.notifyAll();
  }
};

const REDRAW = {
  close: function() {
    repaintAll(rootNode);
  }
};


export default function ReactSkiaReconcileTransaction() {
  this.reinitializeTransaction();
  this.reactMountReady = CallbackQueue.getPooled(null);
}

const Mixin = {
  getTransactionWrappers: function() {
    return [QUEUING, REDRAW];
  },
  getReactMountReady: function() {
    return this.reactMountReady;
  },
  destructor: function() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;
  }
};

assign(
  ReactSkiaReconcileTransaction.prototype,
  Transaction.Mixin,
  Mixin
);

PooledClass.addPoolingTo(ReactSkiaReconcileTransaction);
