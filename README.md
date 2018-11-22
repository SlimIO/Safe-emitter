# SafeEmitter

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/safeEmitter/Config/commit-activity)
[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/SlimIO/safeEmitter/blob/master/LICENSE)
[![Known Vulnerabilities](https://snyk.io/test/github/SlimIO/safeEmitter/badge.svg?targetFile=package.json)](https://snyk.io/test/github/SlimIO/safeEmitter?targetFile=package.json)

Safe NodeJS Event Emitter (aim to be compatible with NodeJS Emitter as possible). This package has been created to answer specific need of the SlimIO product and has no purpose of replacing NodeJS Emitter.

Within the SlimIO Core we need to ensure that all addons are started as expected without any errors (any Error in an EventEmitter will cause a stop at the core level).

If you dont know why you need this, please don't use it !

> Note: The SlimIO core force NodeJS DEP0018 (So unhandledPromise will stop the process).

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

const evt = new SafeEmitter().catch((err, eventName) => {
    console.log(`Catched error for event <${eventName}> ${err.message}`);
});

evt.on("foo", () => {
    new Error("ooppsss!");
});
evt.once("foo").then(() => {
    console.log("triggered one time!");
});

evt.emit("foo");
evt.emitAndWait("foo").then(() => {
    console.log("all foo events have been emitted!");
}).catch(console.error);
```

## API

All API are compatible with NodeJS EventEmitter except `emitAsync`, `catch`, `once` and `prependOnceListener`.

The method **prependOnceListener** is not implemented (it will throw a not Implemented error if you try to call it).

```ts
declare class SafeEmitter {
    constructor();

    // Static Properties
    static defaultMaxListeners: number;

    // Methods
    getMaxListeners(): number;
    setMaxListeners(max: number): void;
    catch(errorListener: SafeEmitter.ErrorListener): this;
    eventNames(): SafeEmitter.EventName[];
    listenerCount(eventName: SafeEmitter.EventName): number;
    listeners(eventName: SafeEmitter.EventName): SafeEmitter.Listener[];
    rawListeners(eventName: SafeEmitter.EventName): SafeEmitter.Listener[];
    on(eventName: SafeEmitter.EventName, listener: SafeEmitter.Listener): void;
    off(eventName: SafeEmitter.EventName, listener: SafeEmitter.Listener): boolean;
    once(eventName: SafeEmitter.EventName, timeOut?: number): Promise<void>;
    addEventListener(eventName: SafeEmitter.EventName, listener: SafeEmitter.Listener): void;
    removeEventListener(eventName: SafeEmitter.EventName, listener: SafeEmitter.Listener): void;
    prependListener(eventName: SafeEmitter.EventName, listener: SafeEmitter.Listener): void;
    prependOnceListener(): void;
    removeAllListeners(eventName?: SafeEmitter.EventName): void;
    emit(eventName: SafeEmitter.EventName, ...data: any[]): void;
    emitAndWait(eventName: SafeEmitter.EventName, ...data: any[]): Promise<void>;
}

declare namespace SafeEmitter {
    export type ErrorListener = (error: Error, eventName: EventName, listener: Listener) => void;
    export type EventName = String | Symbol;
    export type Listener = (...any: any[]) => any;
}
```

### once(eventName: String|Symbol, timeOut?: number): Promise< void >;
The method `once` has been refactored to return a Promise when the event is catched. Optionally you can set a timeOut in milliseconds. The back listener will be cleaned-up automatically !

```js
async function main() {
    const evt = new SafeEmitter();
    setTimeout(() => {
        evt.emit("foo");
    }, 500);
    await evt.once("foo");
    console.log("foo has been triggered!");
}
main().catch(console.error);
```

> It's a design choice made for SlimIO core and addons containers.

### catch(errorListener: SafeEmitter.ErrorListener): this;
Add an error listener to the EventEmitter. The listener is able to catch all kind of errors (even for Asynchronous Function).

The error listener is has described by the TypeScript definition:
```ts
type ErrorListener = (error: Error, eventName: EventName, listener: Listener) => void;
```

Example:

```js
const evt = new SafeEmitter().catch((err) => {
    console.log(err.message);
});
evt.on("foo", () => {
    throw new Error("ooppss sync!");
});
evt.on("bar", async() => {
    throw new Error("ooppss async!");
});

evt.emit("foo");
evt.emit("bar");
```

### emitAndWait(eventName: String|Symbol, ...data: any[]): Promise< void >;
Emit an event and wait for all listeners to be completed (It's work for AsyncFunction too). Be sure to use this method wisely !

```js
async function main() {
    const evt = new SafeEmitter();
    // ... add many listeners (synchronous or event asynchronous).

    await evt.emitAndWait("foo");
    console.log("all foo listeners have been triggered and completed!");
}
main().catch(console.error);
```

## LICENSE
MIT
