import React from "react";
import ReactInstanceHandles from "react/lib/ReactInstanceHandles";
import ReactElement from "react/lib/ReactElement";
import ReactUpdates from "react/lib/ReactUpdates";
import instantiateReactComponent from "react/lib/instantiateReactComponent";
import ReactInjection from "react/lib/ReactInjection";
import ReactComponentEnvironment from "react/lib/ReactComponentEnvironment";
import ReactSkiaReconcileTransaction from "./ReactSkiaReconcileTransaction";
import ReactSkiaRAFBatchingStrategy from "./ReactSkiaRAFBatchingStrategy";
import {ReactSkiaComponent} from "./ReactSkiaComponent";
import invariant from "invariant";

ReactInjection.NativeComponent.injectGenericComponentClass(
  ReactSkiaComponent
);

ReactInjection.Updates.injectBatchingStrategy(
  ReactSkiaRAFBatchingStrategy
);

ReactInjection.Updates.injectReconcileTransaction(
  ReactSkiaReconcileTransaction
);

// NOTE: we're monkeypatching ReactComponentEnvironment because
// ReactInjection.Component.injectEnvironment() currently throws, as
// it's already injected by ReactDOM for backward compat in 0.14.
// Read more: https://github.com/Yomguithereal/react-blessed/issues/5
ReactComponentEnvironment.processChildrenUpdates = function () {};
ReactComponentEnvironment.replaceNodeWithMarkupByID = function () {};

export function render(element, canvasContext) {
  invariant(
    ReactElement.isValidElement(element),
    "render(): You must pass a valid ReactElement."
  );

  const id = ReactInstanceHandles.createReactRootID();
  const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
  const component = instantiateReactComponent(element);

  transaction.perform(() => {
    component.mountComponent(id, transaction, {
      canvasContext,
      parent: null,
    });
  });

  return component._instance;
}

import {Motion, spring} from "react-motion";

const RandomRect = React.createClass({
  getInitialState() {
    return {
      opacity: 1,
      left:    0,
      top:     0,
      color:   "rgb(0,0,0)",
    };
  },
  getDefaultProps() {
    return {
      width: 150,
      height: 150,
      anim: [170, 26]
    };
  },
  componentWillMount() {
    document.addEventListener("mousemove", (evt) => {
      this.setState({
        left: evt.offsetX,
        top:  evt.offsetY,
      });
    });
  },
  render() {
    return (
      <Motion defaultStyle={{opacity: 0, left: 0, top: 0}} style={{
        opacity: spring(this.state.opacity, this.props.anim),
        left:    spring(this.state.left, this.props.anim),
        top:     spring(this.state.top, this.props.anim),
      }}>
        {(v => <rect
          width={this.props.width}
          height={this.props.height}
          left={v.left - this.props.width / 2}
          top={v.top - this.props.height / 2}
          opacity={v.opacity}
          backgroundColor={this.props.color || this.state.color}
        >
          {this.props.children}
        </rect>)}
      </Motion>
    );
  },
});

const Foo = React.createClass({
  render() {
    return (
      <rect width={1280} height={1024}>
        <RandomRect color="pink">
          <rect backgroundColor="darkblue" width={50} height={50}/>
          <rect backgroundColor="black"    width={50} height={50}/>
          <text>haha</text>
        </RandomRect>
        <RandomRect color="orange" anim={[170, 60]}>
          <text>haha</text>
        </RandomRect>
      </rect>
    );
  },
});

render(<Foo />, document.querySelector("canvas").getContext("2d"));
