# marko-store

Reactive store for [marko-js](https://www.npmjs.com/package/marko) like store/writable from Svelte

## Before using, be sure to read https://www.npmjs.com/package/@wareset/store

This observer was specifically written for marko-js, but it can be used individually, so it was taken out separately.

## Installation:

```bash
npm i marko-store ## yarn add marko-store
```

# How to use:

> ./src/store/index.js

```javascript
import store from 'marko-store';

export const counter = store(0);
```

> ./src/pages/index/index.marko

```marko
import store from 'marko-store';
import { counter } from '../../store/index.js'

class {
  onCreate() {
    this.store = {
      array: store(this, ['test_array'])
    };

    counter.subscribe(this);
  }
}

div -- Example of using the 'marko-store'
div -- Count: ${counter}

btn-increment array=component.store.array
br
btn-decrement array=component.store.array

div -- Array: ${component.store.array.$}
btn-random array=component.store.array
```

> ./src/pages/index/components/btn-increment.marko

```marko
import { counter } from '../../../store/index.js'

class {
  onCreate(input) {
    this.store = {
      array: input.array
    };

    counter.subscribe(this);
    this.store.array.subscribe(this);
  }

  increment() {
    ++counter.$;
    this.store.array.update(v => [...v, counter.$]);
  }
}

button on-click("increment") -- Increment: (${counter.$} + 1), ${component.store.array}
```

> ./src/pages/index/components/btn-decrement.marko

```marko
import { counter } from '../../../store/index.js'

class {
  onCreate(input) {
    counter.subscribe(this);
  }

  decrement() {
    --counter.$;
  }
}

button on-click("decrement") -- Decrement: (${counter.$} - 1)
```

> ./src/pages/index/components/btn-random.marko

```marko
static const rand = () => ~(Math.random() * -10) + 1;

class {
  onCreate(input) {
    this.store = {
      array: input.array
    };
  }

  random() {
    this.store.array.set(this, [...Array(rand())].map(() => rand()));
  }
}

button on-click("random") -- New array: ${component.store.array}
```

## Description of the example:

### 1. Permanent subscription of the component:

So we signed our component to update if the 'counter' is changed:

```javascript
this.store = {
  array: store(this, ['test_array']) // the component was already signed when it was created
};

counter.subscribe(this); // subscribing a component to an rerender
```

When destroyed, all components are automatically unsubscribed.

### 2. Partial subscription of a component:

In the file './src/pages/index/components/btn-random.marko', the array value is not constantly updated, so it is not necessary to sign it completely. All methods ('set', 'setSure', 'update'...) can be called by specifying the _this_ as the first argument. In this case, the component is updated once and immediately unsubscribes from updates.

```javascript
this.store.array.set(
  this,
  [...Array(rand())].map(() => rand())
);
```

### 3. State change:

Please, see https://www.npmjs.com/package/@wareset/store

```javascript
--counter.$; // counter.update(v => --v);
```

### 4. A simple example of a more complex usage:

Thus, changing any observer, in any part of the code, will cause the component 'some-component.marko' to be rerender:

> store/some-component-store.js
```javascript
import store from 'marko-store';

export const VAL_1$ = store('some-value-1');
export const VAL_2$ = store('some-value-2');
export const VAL_3$ = store('some-value-3');

export const needUpdate$ = store(null);
needUpdate$.dependSure([VAL_1$, VAL_2$, VAL_3$]);
```

> some-component.marko

```marko
import * as stores from '../../../store/some-component-store.js'

class {
  onCreate(input) {
    stores.needUpdate$.subscribe(this);
  }
}

div -- someval_1 ${stores.VAL_1$.$}
div -- someval_2 ${stores.VAL_2$.$}
div -- someval_3 ${stores.VAL_3$.$}
```

## How the update works?

When updating the observer state, the method is called for all signed components:

```javascript
this.setState('___storeForceUpdate', Math.random());
```

To be honest, I do not know how to do this more effectively. If You know of a better solution, I would appreciate your help.

## Lisence

MIT
