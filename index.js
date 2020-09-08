const waresetStore = require('@wareset/store');
const { SET_AND_WATCH_METHODS } = require('@wareset/store/lib/consts.js');

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
    watcher,
    watcherWeak,
    watcherSure,
    unwatcher,
    watch,
    watchWeak,
    watchSure,
    unwatch,
    bridge,
    bridgeWeak,
    bridgeSure,
    unbridge
  } = store;

  const methods = {
    subscribe,
    ...{ set, setWeak, setSure },
    ...{ update, updateWeak, updateSure },
    ...{ watcher, watcherWeak, watcherSure },
    unwatcher,
    ...{ watch, watchWeak, watchSure },
    unwatch,
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

  const _methods = { set, update, watcher, watch, bridge };
  Object.keys(_methods).forEach(method => {
    SET_AND_WATCH_METHODS.forEach((v, k) => {
      _methods[method][v] = !k ? store[method] : store[`${method}${v}`];
    });
  });

  // (set.Weak = store.setWeak), (set.Sure = store.setSure);
  // (update.Weak = store.updateWeak), (update.Sure = store.updateSure);
  // (watcher.Weak = store.watcherWeak), (watcher.Sure = store.watcherSure);
  // (watch.Weak = store.watchWeak), (watch.Sure = store.watchSure);
  // (bridge.Weak = store.bridgeWeak), (bridge.Sure = store.bridgeSure);

  if (type === 2) autosubscribe(store, component, components);

  return store;
};
