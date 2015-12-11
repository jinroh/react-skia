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
        {(v => <rect style={{
          width: this.props.width,
          left: v.left - this.props.width / 2,
          top: v.top - this.props.height / 2,
          height: this.props.height,
          opacity: v.opacity,
          backgroundColor: this.state.color,
          ...this.props.style,
        }}>
          {this.props.children}
        </rect>)}
      </Motion>
    );
  },
});

let longText = `
Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.
 * Neither the name Facebook nor the names of its contributors may be used to
   endorse or promote products derived from this software without specific
   prior written permission.
`;

const Carousel = React.createClass({
  getInitialState() {
    return { translate: 0 };
  },
  componentWillMount() {
    document.addEventListener("keydown", ({keyCode}) => {
      if (keyCode === 39) {
        this.setState({ translate: this.state.translate + 120 })
      } else if (keyCode === 37) {
        this.setState({ translate: this.state.translate - 120 })
      }
    });
  },
  render() {
    return (
      <Motion defaultStyle={{ translateX: 0 }} style={{
        translateX: spring(this.state.translate)
      }}>
        {v => <view style={{
          height: 100,
          position: "absolute",
          top: 0,
          left: 0,
          flexDirection: "row",
          flexWrap: "nowrap",
          backgroundColor: "red",
        }}>
          <img src="http://i.imgur.com/leCMOWx.jpg" style={{width: 100, margin: 10, backgroundColor: "black", translateX: v.translateX}}/>
          <img src="http://i.imgur.com/leCMOWx.jpg" style={{width: 100, margin: 10, backgroundColor: "black", translateX: v.translateX}}/>
          <img src="http://i.imgur.com/leCMOWx.jpg" style={{width: 100, margin: 10, backgroundColor: "black", translateX: v.translateX}}/>
          <img src="http://i.imgur.com/leCMOWx.jpg" style={{width: 100, margin: 10, backgroundColor: "black", translateX: v.translateX}}/>
          <img src="http://i.imgur.com/leCMOWx.jpg" style={{width: 100, margin: 10, backgroundColor: "black", translateX: v.translateX}}/>
          <img src="http://i.imgur.com/leCMOWx.jpg" style={{width: 100, margin: 10, backgroundColor: "black", translateX: v.translateX}}/>
          <img src="http://i.imgur.com/leCMOWx.jpg" style={{width: 100, margin: 10, backgroundColor: "black", translateX: v.translateX}}/>
          <img src="http://i.imgur.com/leCMOWx.jpg" style={{width: 100, margin: 10, backgroundColor: "black", translateX: v.translateX}}/>
          <img src="http://i.imgur.com/leCMOWx.jpg" style={{width: 100, margin: 10, backgroundColor: "black", translateX: v.translateX}}/>
          <img src="http://i.imgur.com/leCMOWx.jpg" style={{width: 100, margin: 10, backgroundColor: "black", translateX: v.translateX}}/>
        </view>}
      </Motion>
    );
  }
})

const Foo = React.createClass({
  getInitialState() {
    return {flexes:[3,5]};
  },
  componentWillMount() {
    document.addEventListener("keydown", (evt) => {
      if (evt.keyCode === 32) {
        var [flex1, flex2] = this.state.flexes;
        this.setState({
          flexes: [
            flex1 === 5 ? 3 : 5,
            flex2 === 5 ? 3 : 5,
          ]
        })
      }
    });
  },
  render() {
    return (
      <rect style={{
        width: 1165,
        height: 600,
        flexDirection: "row",
      }}>
        { /* <rect style={{
          backgroundColor: "darkgreen",
          flex: this.state.flexes[0],
        }}>
          <text style={{ color: "white" }}>{longText}</text>
        </rect> */}
        <rect style={{
          backgroundColor: "brown",
          flex: this.state.flexes[1],
        }}>
          <RandomRect style={{backgroundColor: "pink"}}>
            { /* <img src="http://i.imgur.com/leCMOWx.jpg" /> */ }
          </RandomRect>
          <RandomRect style={{backgroundColor: "orange"}} anim={[170, 60]}>
            { /* <img src="http://i.imgur.com/leCMOWx.jpg" /> */ }
          </RandomRect>
        </rect>
        <Carousel />
      </rect>
    );
  },
});

const X1MenuItem = React.createClass({
  render() {
    return (
      <rect
        flex={1}
        paddingRight={10}
        paddingBottom={20}
        paddingLeft={10}
      >
        <text
          color="#aaa"
          lineHeight={20}
          flex={1}
        >
        {this.props.label}
        </text>
      </rect>
    );
  }
});

const Menu = React.createClass({
  render() {
    return (
      <rect
        width={1165}
        height={200}
        flexDirection="column"
        justifyContent="space-between"
        backgroundColor="black"
        opacity={0.7}
      >
        <X1MenuItem name="zaplist"  label="Zapliste" />
        <X1MenuItem name="guide"    label="Guide TV" />
        <X1MenuItem name="vod"      label="À la demande" />
        <X1MenuItem name="apps"     label="Les Apps" />
        <X1MenuItem name="settings" label="Réglages" />
      </rect>
    );
  }
});

render(<Foo />, document.querySelector("canvas").getContext("2d"));
