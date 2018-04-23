import React from 'react';
import App from './App';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import MessageThread from './app/components/message_thread';
import store from './app/store';

// "it" is the test function in Jest
// Tests the Main component for rendering errors.
it('App: renders without crashing', () => {
  const rendered = renderer.create(<App />).toJSON();
  expect(rendered).toBeTruthy();
});

// Props relevant to the MessageThread component
let test = {
  key1: "5c18585e73bf993099a060dc0c9d69c98f9d2e7817288e9b5d70987de37fb68f90918ecf4eda43460c83eb2426ea661cc5adb2b0b0e478f22a42bd7f5209344ac00c77fa891c9b6f8a1acd1435ce27112997af02dcd08cfe8f81e06012b1f0af76d5a47b747db0eedc4a26c177518e962ee5660edaf912cd47bf09452655b0e9",
  key2: "acf5c12879f83dc60fb4bfb31fd11b398a96977289d8ef98c525121ee419d86b8858caa1544ade99a43a0ddc8742f630cb2a3ef669e0c46406df593207a6fd811185314c558dcfa85fdee6dfcf3c6ec5e06bfc8c3ba95d06bed62b62217812dabe467773297fb2e7498e78d22f2a7a3d6e216d52773f9885f01cddfa33c3d679",
};

let pair = {
  sender: test.key1,
  reciever: test.key2,
};


// Tests the MessageThread component for rendering errors.
it('MessageThread: renders without crashing', () => {
  // Start by rendering an instance of the component.
  // We must include our store in the root component for the tests to work.
  const rendered = renderer.create(<MessageThread pair={pair} store={store}/>).toJSON();
  expect(rendered).toBeTruthy();
});

// This test checks to see if the props are loaded in correctly.
it('MessageThread: props load in correctly', () => {
  const testRenderer = renderer.create(<MessageThread pair={pair} store={store}/>);
  const testInstance = testRenderer.root;

  // The props should match up with the keys that we passed in.
  expect(testInstance.props.pair.sender).toBe(test.key1);
  expect(testInstance.props.pair.reciever).toBe(test.key2);
});