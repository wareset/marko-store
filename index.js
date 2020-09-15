const waresetStore = require('@wareset/store');
const { DEFAULT_WEAK_SURE } = require('@wareset/store/lib/consts.js');

function check_component(components, component, args) {
  if (!component || !component.elId || component.elId !== component.getElId) {
    args.unshift(component);
    return 0;
  }

  if (!component.setState) return 1;
  if (components.indexOf(component) < 0) return 2;

  return true;
}

function autosubscribe(Observer, component, components) {
  const unsubscribe = Observer.subscribe(() => {
    component.setState('___storeForceUpdate', Math.random());
  });

  component.on('destroy', () => {
    unsubscribe();

    const index = components.indexOf(component);
    if (index >= 0) components.splice(index, 1);
  });
}

module.exports = function store(component, ...args) {
  const components = [];

  const type = check_component(components, component, args);
  const store = waresetStore(...args);

  const {
    subscribe,
    set,
    setWeak,
    setSure,
    update,
    updateWeak,
    updateSure,
    observable,
    observe,
    dependency,
    dependencyWeak,
    dependencySure,
    undependency,
    unobservable,
    depend,
    dependWeak,
    dependSure,
    undepend,
    unobserve,
    bridge,
    bridgeWeak,
    bridgeSure,
    unbridge
  } = store;

  const methods = {
    subscribe,
    ...{ set, setWeak, setSure },
    ...{ update, updateWeak, updateSure },
    observable,
    observe,
    ...{ dependency, dependencyWeak, dependencySure },
    undependency,
    unobservable,
    ...{ depend, dependWeak, dependSure },
    undepend,
    unobserve,
    ...{ bridge, bridgeWeak, bridgeSure },
    unbridge
  };
  Object.keys(methods).forEach(key => {
    store[key] = (component, ...args) => {
      const type = check_component(components, component, args);
      const result = methods[key](...args);

      if (type && methods[key] === subscribe) {
        if (type === 1) Promise.resolve().then(() => result());
        else component.on('destroy', () => result());
      }
      if (type === 2) autosubscribe(store, component, components);

      return result;
    };
  });

  const _methods = { set, update, dependency, depend, bridge };
  Object.keys(_methods).forEach(method => {
    DEFAULT_WEAK_SURE.forEach((v, k) => {
      store[method][v] = !k ? store[method] : store[`${method}${v}`];
    });
  });

  if (type === 2) autosubscribe(store, component, components);

  return store;
};
