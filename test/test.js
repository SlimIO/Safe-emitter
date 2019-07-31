"use strict";

/* eslint no-empty-function: 0 */

// Require Third-Party Dependencies
const avaTest = require("ava");

// Require SafeEmitter
const SafeEmitter = require("../");

avaTest("Enumate SafeEmitter keys", function assert(assert) {
    const evt = new SafeEmitter();
    const keys = Reflect.ownKeys(evt);
    assert.is(keys.length, 3);
    for (const key of keys) {
        assert.true(typeof key === "symbol");
    }

    assert.pass();
});

avaTest("Retrieve eventNames", function assert(assert) {
    const sym = Symbol("hey!");
    const evt = new SafeEmitter();
    evt.on("foo", () => {});
    evt.on("bar", () => {});
    evt.on(sym, () => {});

    assert.deepEqual(evt.eventNames(), ["foo", "bar", sym]);
});

avaTest("Get listener count for a given eventName", function assert(assert) {
    const evt = new SafeEmitter();
    evt.on("foo", () => {});
    evt.on("foo", () => {});
    evt.on("bar", () => {});

    assert.is(evt.listenerCount("foo"), 2);
    assert.is(evt.listenerCount("bar"), 1);
    assert.is(evt.listenerCount("hey"), 0);
});

avaTest("Get listeners handle of a given eventName", function assert(assert) {
    const evt = new SafeEmitter();
    const listeners = [
        () => {}
    ];
    evt.on("foo", listeners[0]);

    assert.deepEqual(evt.listeners("foo"), listeners);
    assert.is(evt.listeners("bar"), null);
});

avaTest("Play with getMaxListeners() & setMaxListeners(max)", function assert(assert) {
    const evt = new SafeEmitter();

    assert.is(evt.getMaxListeners(), SafeEmitter.defaultMaxListeners);
    evt.setMaxListeners(-10);
    assert.is(evt.getMaxListeners(), SafeEmitter.defaultMaxListeners);
    evt.setMaxListeners(20);
    assert.is(evt.getMaxListeners(), 20);
});

avaTest("setMaxListeners(max) should throw a typeError if max is not a number", function assert(assert) {
    const evt = new SafeEmitter();

    assert.throws(() => evt.setMaxListeners("10"), {
        instanceOf: TypeError,
        message: "max argument should be typeof number!"
    });
});

avaTest("catch(errorListener) should throw a typeError if errorListener is not a function", function assert(assert) {
    const evt = new SafeEmitter();

    assert.throws(() => evt.catch("10"), {
        instanceOf: TypeError,
        message: "errorListener should be typeof Function"
    });
});

avaTest("catch error", async function assert(assert) {
    assert.plan(2);
    const evt = new SafeEmitter().catch((error) => {
        if (error.message === "oops!") {
            assert.pass();
        }
    });
    evt.on("foo", () => {
        throw new Error("oops!");
    });
    // eslint-disable-next-line
    evt.on("foo", async() => {
        throw new Error("oops!");
    });
    evt.emit("foo");

    await new Promise((resolve) => setImmediate(resolve));
});

avaTest("on() eventName should be typeof string or symbol", function assert(assert) {
    const evt = new SafeEmitter();

    assert.throws(() => evt.on(10), {
        instanceOf: TypeError,
        message: "eventName should be typeof string or symbol"
    });
});

avaTest("on() listener should be typeof function", function assert(assert) {
    const evt = new SafeEmitter();

    assert.throws(() => evt.on("foo", 10), {
        instanceOf: TypeError,
        message: "listener should be typeof Function"
    });
});

avaTest("prependListener() eventName should be typeof string or symbol", function assert(assert) {
    const evt = new SafeEmitter();

    assert.throws(() => evt.prependListener(10), {
        instanceOf: TypeError,
        message: "eventName should be typeof string or symbol"
    });
});

avaTest("prependListener() listener should be typeof function", function assert(assert) {
    const evt = new SafeEmitter();

    assert.throws(() => evt.prependListener("foo", 10), {
        instanceOf: TypeError,
        message: "listener should be typeof Function"
    });
});

avaTest("prependListener (add event listener at the top)", function assert(assert) {
    const evt = new SafeEmitter();
    const listeners = [
        function bar() {},
        function foo() {}
    ];

    evt.on("foo", listeners[1]);
    evt.prependListener("foo", listeners[0]);
    assert.deepEqual(evt.listeners("foo"), listeners);
});

avaTest("once() eventName should be typeof string or symbol", function assert(assert) {
    const evt = new SafeEmitter();

    assert.throws(() => evt.once(10), {
        instanceOf: TypeError,
        message: "eventName should be typeof string or symbol"
    });
});

avaTest("once() Wait for a given event!", async function assert(assert) {
    const evt = new SafeEmitter();
    setImmediate(() => {
        evt.emit("foo");
    });

    await evt.once("foo");
    assert.pass();
});

avaTest("once() Timeout a given event!", async function assert(assert) {
    const evt = new SafeEmitter();

    await assert.throwsAsync(evt.once("foo", 1), {
        instanceOf: Error,
        message: "once timeOut for eventName foo"
    });
});

avaTest("once() Handle event before timeOut", async function assert(assert) {
    const evt = new SafeEmitter();
    setTimeout(() => {
        evt.emit("foo");
    }, 10);

    await evt.once("foo", 50);
    assert.pass();
});

avaTest("prependOnceListener() should throw not implemented error", function assert(assert) {
    const evt = new SafeEmitter();

    const { message } = assert.throws(() => evt.prependOnceListener(), Error);
    assert.is(message, "SafeEmitter doesn't implement the method prependOnceListener");
});

avaTest("off() eventName should be typeof string or symbol", function assert(assert) {
    const evt = new SafeEmitter();

    assert.throws(() => evt.off(10), {
        instanceOf: TypeError,
        message: "eventName should be typeof string or symbol"
    });
});

avaTest("off() listener should be typeof function", function assert(assert) {
    const evt = new SafeEmitter();

    assert.throws(() => evt.off("foo", 10), {
        instanceOf: TypeError,
        message: "listener should be typeof Function"
    });
});

avaTest("off() remove a listener", function assert(assert) {
    const evt = new SafeEmitter();
    /**
     * @function listener
     */
    function listener() {
        // do thing
    }
    evt.on("foo", listener);

    assert.false(evt.off("bar", () => {}));
    assert.false(evt.off("foo", () => {}));
    assert.true(evt.off("foo", listener));
    assert.deepEqual(evt.listeners("foo"), []);
});

avaTest("removeAllListeners", function assert(assert) {
    const evt = new SafeEmitter();
    evt.on("foo", () => {});
    evt.on("bar", () => {});
    evt.removeAllListeners();

    assert.deepEqual(evt.listenerCount("foo"), 0);
    assert.deepEqual(evt.listenerCount("bar"), 0);
});

avaTest("removeAllListeners(eventName) eventName should be string or symbol", function assert(assert) {
    const evt = new SafeEmitter();

    assert.throws(() => evt.removeAllListeners(10), {
        instanceOf: TypeError,
        message: "eventName should be typeof string or symbol"
    });
});

avaTest("removeAllListeners for a given eventName", function assert(assert) {
    const evt = new SafeEmitter();
    evt.on("foo", () => {});
    evt.on("bar", () => {});
    evt.removeAllListeners("foo");

    assert.deepEqual(evt.listenerCount("foo"), 0);
    assert.deepEqual(evt.listenerCount("bar"), 1);
});

avaTest("emit data to listener", async function assert(assert) {
    assert.plan(2);
    const evt = new SafeEmitter();
    evt.on("foo", (msg) => {
        if (msg === "foo") {
            assert.pass();
        }
    });
    // eslint-disable-next-line
    evt.on("foo", async(msg) => {
        if (msg === "foo") {
            assert.pass();
        }
    });

    evt.emit("bar");
    evt.emit("foo", "foo");
    await new Promise((resolve) => setTimeout(resolve, 10));
});

avaTest("emit data and await response", async function assert(assert) {
    assert.plan(2);
    const evt = new SafeEmitter();
    evt.on("foo", () => {
        assert.pass();
    });
    // eslint-disable-next-line
    evt.on("foo", async() => {
        assert.pass();
    });

    evt.emitAndWait("bar");
    await evt.emitAndWait("foo");
});

avaTest("catch error with emitAndAwait", async function assert(assert) {
    assert.plan(1);
    const evt = new SafeEmitter().catch((error) => {
        if (error.message === "oops!") {
            assert.pass();
        }
    });
    evt.on("foo", () => {
        throw new Error("oops!");
    });

    await evt.emitAndWait("foo");
});

avaTest("reach maximum number of listener", function assert(assert) {
    const evt = new SafeEmitter();
    evt.setMaxListeners(1);
    evt.on("foo", () => {});

    assert.throws(() => {
        evt.on("foo", () => {});
    }, { instanceOf: Error, message: "The maximum number of listeners (1) has been reach." });
});

avaTest("once method with arguments!", async function assert(assert) {
    const evt = new SafeEmitter();
    setImmediate(() => {
        evt.emit("foo", 10, 5);
    });
    const args = await evt.once("foo");
    assert.deepEqual(args, [10, 5]);
});

avaTest("catch once() multiple time with emit", async function assert(assert) {
    assert.plan(4);
    const evt = new SafeEmitter();

    evt.on("newListener", (eventName) => {
        if (eventName === "foo") {
            assert.pass();
        }
    });
    evt.on("removeListener", (eventName) => {
        if (eventName === "foo") {
            assert.pass();
        }
    });

    setImmediate(() => {
        evt.emit("foo");
    });

    await Promise.all([
        evt.once("foo", 100),
        evt.once("foo", 100)
    ]);

    await new Promise((resolve) => setImmediate(resolve));
});

avaTest("catch once() multiple time with emitAndWait", async function assert(assert) {
    assert.plan(4);
    const evt = new SafeEmitter();

    evt.on("newListener", (eventName) => {
        if (eventName === "foo") {
            assert.pass();
        }
    });
    evt.on("removeListener", (eventName) => {
        if (eventName === "foo") {
            assert.pass();
        }
    });

    setImmediate(() => {
        evt.emitAndWait("foo");
    });

    await Promise.all([
        evt.once("foo", 100),
        evt.once("foo", 100)
    ]);

    await new Promise((resolve) => setImmediate(resolve));
});
