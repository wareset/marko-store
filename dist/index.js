"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = store;

function _store() {
  const data = _interopRequireDefault(require("@wareset/store"));

  _store = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function checkComponent(components, component, args) {
  if (!component || !component.elId || component.elId !== component.getElId) {
    args.unshift(component);
    return 0;
  }

  if (!component.setState) return 1;
  if (components.indexOf(component) < 0) return 2;
  return true;
}

function autosubscribe(Observer, component, components, once = false) {
  const unsubscribe = Observer.subscribe((val, observers, this$, unsub) => {
    component.setState('___storeForceUpdate', Math.random());
    if (once) unsub();
  });
  component.on('destroy', () => {
    unsubscribe();
    const index = components.indexOf(component);
    if (index >= 0) components.splice(index, 1);
  });
}

function store(component, ...args) {
  const components = [];
  const type = checkComponent(components, component, args);
  const store = (0, _store().default)(...args); // prettier-ignore

  const {
    subscribe,
    set,
    setWeak,
    setSure,
    update,
    updateWeak,
    updateSure,
    unobservable,
    observable,
    observableWeak,
    observableSure,
    unobserve,
    observe,
    observeWeak,
    observeSure,
    undependency,
    dependency,
    dependencyWeak,
    dependencySure,
    undepend,
    depend,
    dependWeak,
    dependSure,
    unbridge,
    bridge,
    bridgeWeak,
    bridgeSure
  } = store; // prettier-ignore

  const methods = {
    subscribe,
    set,
    setWeak,
    setSure,
    update,
    updateWeak,
    updateSure,
    unobservable,
    observable,
    observableWeak,
    observableSure,
    unobserve,
    observe,
    observeWeak,
    observeSure,
    undependency,
    dependency,
    dependencyWeak,
    dependencySure,
    undepend,
    depend,
    dependWeak,
    dependSure,
    unbridge,
    bridge,
    bridgeWeak,
    bridgeSure
  };
  Object.keys(methods).forEach((key, i) => {
    store[key] = (component, ...args) => {
      const type = checkComponent(components, component, args);
      const result = methods[key](...args);

      if (type && !i) {
        if (type === 1) Promise.resolve().then(() => result());else component.on('destroy', () => result());
      }

      if (type === 2) autosubscribe(store, component, components, !!i);
      return result;
    };
  });
  if (type === 2) autosubscribe(store, component, components, false);
  return store;
}