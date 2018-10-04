# SafeEmitter
Safe and isolated Event Emitter (designed to be compatible with NodeJS Emitter). This package has been created to answer specific need of the SlimIO product and has no purpose of replacing NodeJS Emitter.

Within the SlimIO Core we need to ensure that all addons are started as expected without any errors (any Error in an EventEmitter will cause a stop at the core level).

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/safe-emitter
# or
$ yarn add @slimio/safe-emitter
```

## Usage example

```js
const SafeEmitter = require("@slimio/safe-emitter");

const eContainer = new SafeEmitter();
eContainer.catch((err, eventName) => {
    console.log(`Catched error for event <${eventName}> ${err.message}`);
});

eContainer.on("foo", () => {
    new Error("ooppsss!");
});
eContainer.once("foo").then(() => {
    console.log("triggered one time!");
});

eContainer.emit("foo");
eContainer.emitAndWait("foo").then(() => {
    console.log("all foo events have been emitted!");
}).catch(console.error);
```

## API

All API are NodeJS compatible except `emitAsync`, `catch`, `once` and `prependOnceListener`.

The method **prependOnceListener** was not implemented (it will throw a not Implemented error if you call it).

```ts
declare class SafeEmitter {
    constructor();

    // Static Properties
    static defaultMaxListeners: number;

    // Methods
    getMaxListeners(): number;
    setMaxListeners(max: number): void;
    catch(errorListener: SafeEmitter.Listener): void;
    eventNames(): SafeEmitter.EventName[];
    listenerCount(eventName: SafeEmitter.EventName): number;
    listeners(eventName: SafeEmitter.EventName): SafeEmitter.Listener[];
    rawListeners(eventName: SafeEmitter.EventName): SafeEmitter.Listener[];
    on(eventName: SafeEmitter.EventName, listener: SafeEmitter.Listener): void;
    off(eventName: SafeEmitter.EventName, listener: SafeEmitter.Listener): void;
    once(eventName: SafeEmitter.EventName): Promise<void>;
    addEventListener(eventName: SafeEmitter.EventName, listener: SafeEmitter.Listener): void;
    removeEventListener(eventName: SafeEmitter.EventName, listener: SafeEmitter.Listener): void;
    prependListener(eventName: SafeEmitter.EventName, listener: SafeEmitter.Listener): void;
    prependOnceListener(): void;
    removeAllListeners(eventName?: SafeEmitter.EventName): void;
    emit(eventName: SafeEmitter.EventName, ...data: any[]): void;
    emitAndWait(eventName: SafeEmitter.EventName, ...data: any[]): Promise<void>;
}

declare namespace SafeEmitter {
    export type EventName = String | Symbol;
    export type Listener = (...any: any[]) => any;
}
```

### once(eventName: String|Symbol): Promise< void >;
WIP

### catch(errorListener): void;
WIP

### emitAndWait(eventName: String|Symbol, ...data: any[]): Promise< void >;
WIP

## LICENSE
MIT
