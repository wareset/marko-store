const waresetStore = require('@wareset/store');

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
  const Observer = waresetStore(...args);

  const { subscribe, set, update } = Observer;

  const methods = { subscribe, set, update };
  Object.keys(methods).forEach(key => {
    Observer[key] = (component, ...args) => {
      const type = check_component(components, component, args);
      const result = methods[key](...args);

      if (type && methods[key] === subscribe) {
        if (type === 1) Promise.resolve(() => result());
        else component.on('destroy', () => result());
      }
      if (type === 2) autosubscribe(Observer, component, components);

      return result;
    };
  });

  if (type === 2) autosubscribe(Observer, component, components);

  return Observer;
};
