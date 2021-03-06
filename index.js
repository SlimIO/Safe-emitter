"use strict";

// Private Properties
const events = new WeakMap();

// Symbols
const maxEventListeners = Symbol("maxEventListeners");
const errorHandler = Symbol("ErrorHandler");
const breakpoints = Symbol("BreakPoints");

/**
 * @function isAsyncFunction
 * @param {any} value JavaScript Object value
 * @returns {boolean}
 */
function isAsyncFunction(value) {
    return Object.prototype.toString.call(value).slice(8, -1) === "AsyncFunction";
}

/**
 * @function isEventName
 * @description Known if a given eventName is a string or symbol primitive!
 * @param {string | symbol} eventName eventName
 * @returns {boolean}
 */
function isEventName(eventName) {
    const evtType = typeof eventName;

    return evtType === "string" || evtType === "symbol";
}

/**
 * @function addListener
 * @description Shortcut method to add a new Listener to a given eventName
 * @param {!SafeEmitter} emitter Emitter instance
 * @param {!string} eventName eventName
 * @param {any} listener event listener (handler)
 * @param {!boolean} start push at the start or the end
 * @returns {void}
 *
 * @throws {Error}
 */
// eslint-disable-next-line
function addListener(emitter, eventName, listener, start) {
    const evt = events.get(emitter);
    if (evt.has(eventName)) {
        const listenerArr = evt.get(eventName);
        if (listenerArr.length + 1 > emitter.getMaxListeners()) {
            throw new Error(`The maximum number of listeners (${emitter.getMaxListeners()}) has been reach.`);
        }
        listenerArr[start ? "unshift" : "push"](listener);
    }
    else {
        events.get(emitter).set(eventName, [listener]);
    }

    emitter.emit("newListener", eventName, listener);
}

/**
 * @class SafeEmitter
 */
class SafeEmitter {
    /**
     * @class
     */
    constructor() {
        events.set(this, new Map());
        this[maxEventListeners] = SafeEmitter.defaultMaxListeners;
        /* istanbul ignore next */
        // eslint-disable-next-line
        this[errorHandler] = function errorHandler() {};
        this[breakpoints] = new Set();
    }

    /**
     * @public
     * @function stopPropagation
     * @memberof SafeEmitter#
     * @param {!(string | symbol)} eventName event name
     * @returns {void}
     */
    stopPropagation(eventName) {
        if (!isEventName(eventName)) {
            throw new TypeError("eventName should be typeof string or symbol");
        }

        this[breakpoints].add(eventName);
    }

    /**
     * @public
     * @function catch
     * @memberof SafeEmitter#
     * @param {!Function} errorListener EventEmitter errorListener
     * @returns {this}
     */
    catch(errorListener) {
        if (typeof errorListener !== "function") {
            throw new TypeError("errorListener should be typeof Function");
        }

        this[errorHandler] = errorListener;

        return this;
    }

    /**
     * @public
     * @function eventNames
     * @description Returns an array listing the events for which the emitter has registered listeners.
     * @memberof SafeEmitter#
     * @returns {(string|symbol)[]}  The values in the array will be strings or Symbols.
     */
    eventNames() {
        return [...events.get(this).keys()];
    }

    /**
     * @public
     * @function listenerCount
     * @description Returns the number of listeners listening to the event named eventName.
     * @memberof SafeEmitter#
     * @param {!string} eventName event name
     * @returns {number}
     */
    listenerCount(eventName) {
        const evt = events.get(this);

        return evt.has(eventName) ? evt.get(eventName).length : 0;
    }

    /**
     * @public
     * @function listeners
     * @memberof SafeEmitter#
     * @description Returns a copy of the array of listeners for the event named eventName.
     * @param {!string} eventName event name
     * @returns {Array<any>}
     */
    listeners(eventName) {
        const evt = events.get(this);
        if (!evt.has(eventName)) {
            return null;
        }

        return evt.get(eventName).slice();
    }

    /**
     * @public
     * @function getMaxListeners
     * @memberof SafeEmitter#
     * @description Maximum number of listeners that can be added to one event!
     * @returns {number}
     */
    getMaxListeners() {
        return this[maxEventListeners];
    }

    /**
     * @public
     * @function setMaxListeners
     * @memberof SafeEmitter#
     * @param {!number} max new maximum of listeners for the given event
     * @description Maximum number of listeners that can be added to one event!
     * @returns {void}
     *
     * @throws {TypeError}
     */
    setMaxListeners(max) {
        if (typeof max !== "number") {
            throw new TypeError("max argument should be typeof number!");
        }

        this[maxEventListeners] = max < 0 ? SafeEmitter.defaultMaxListeners : max;
    }

    /**
     * @public
     * @function on
     * @memberof SafeEmitter#
     * @param {!string} eventName event name
     * @param {!SafeEmitter.Listener} listener event handler!
     * @returns {void}
     *
     * @throws {TypeError}
     */
    on(eventName, listener) {
        if (!isEventName(eventName)) {
            throw new TypeError("eventName should be typeof string or symbol");
        }
        if (typeof listener !== "function") {
            throw new TypeError("listener should be typeof Function");
        }

        addListener(this, eventName, listener, false);
    }

    /**
     * @public
     * @function prependListener
     * @memberof SafeEmitter#
     * @param {!string} eventName event name
     * @param {!SafeEmitter.Listener} listener event handler!
     * @returns {void}
     *
     * @throws {TypeError}
     */
    prependListener(eventName, listener) {
        if (!isEventName(eventName)) {
            throw new TypeError("eventName should be typeof string or symbol");
        }
        if (typeof listener !== "function") {
            throw new TypeError("listener should be typeof Function");
        }

        addListener(this, eventName, listener, true);
    }

    /**
     * @public
     * @function once
     * @description Adds a one-time listener function for the event named eventName.
     * @memberof SafeEmitter#
     * @param {!string} eventName event name
     * @param {number} [timeOut] event Timeout
     * @returns {void}
     *
     * @throws {TypeError}
     */
    once(eventName, timeOut) {
        if (!isEventName(eventName)) {
            throw new TypeError("eventName should be typeof string or symbol");
        }

        return new Promise((resolve, reject) => {
            /** @type {NodeJS.Timer} */
            let timeOutTimer;

            const listener = (...args) => {
                if (typeof timeOutTimer !== "undefined") {
                    clearTimeout(timeOutTimer);
                }

                this.off(eventName, listener);
                resolve(args);
            };

            if (typeof timeOut === "number") {
                timeOutTimer = setTimeout(() => {
                    this.off(eventName, listener);
                    reject(new Error(`once timeOut for eventName ${eventName}`));
                }, timeOut);
            }
            this.on(eventName, listener);
        });
    }

    /**
     * @public
     * @function prependOnceListener
     * @description Not Implemented
     * @memberof SafeEmitter#
     * @returns {void}
     *
     * @throws {TypeError}
     */
    // eslint-disable-next-line
    prependOnceListener() {
        throw new Error("SafeEmitter doesn't implement the method prependOnceListener");
    }

    /**
     * @public
     * @function off
     * @memberof SafeEmitter#
     * @param {!string} eventName event name
     * @param {any} listener event handler!
     * @returns {boolean}
     *
     * @throws {TypeError}
     */
    off(eventName, listener) {
        if (!isEventName(eventName)) {
            throw new TypeError("eventName should be typeof string or symbol");
        }
        if (typeof listener !== "function") {
            throw new TypeError("listener should be typeof Function");
        }

        const evt = events.get(this);
        if (!evt.has(eventName)) {
            return false;
        }

        const listenerArr = evt.get(eventName);
        const handlerIndex = listenerArr.indexOf(listener);
        if (handlerIndex === -1) {
            return false;
        }

        this.emit("removeListener", eventName, listener);
        listenerArr.splice(handlerIndex, 1);

        return true;
    }

    /**
     * @public
     * @function removeAllListeners
     * @description Removes all listeners, or those of the specified eventName.
     * @memberof SafeEmitter#
     * @param {string} [eventName] event name
     * @returns {void}
     *
     * @throws {TypeError}
     */
    removeAllListeners(eventName) {
        if (typeof eventName === "undefined" || eventName === null) {
            events.set(this, new Map());

            return;
        }
        else if (!isEventName(eventName)) {
            throw new TypeError("eventName should be typeof string or symbol");
        }

        events.get(this).delete(eventName);
    }

    /**
     * @public
     * @function emit
     * @description Emit a Normal Synchronous event
     * @memberof SafeEmitter#
     * @param {!string} eventName event name
     * @param {any} data Handler data...
     * @returns {void}
     */
    emit(eventName, ...data) {
        const evt = events.get(this);
        if (!evt.has(eventName)) {
            return;
        }

        // Send event at the next event-loop iteration!
        const listeners = evt.get(eventName).slice(0);

        setImmediate(() => {
            for (const listener of listeners) {
                if (this[breakpoints].has(eventName)) {
                    this[breakpoints].delete(eventName);
                    break;
                }

                if (isAsyncFunction(listener)) {
                    listener(...data).catch((error) => {
                        this[errorHandler](error, eventName, listener);
                        this.emit("error", error);
                    });
                    continue;
                }

                try {
                    listener(...data);
                }
                catch (error) {
                    this[errorHandler](error, eventName, listener);
                    this.emit("error", error);
                }
            }
        });
    }

    /**
     * @async
     * @public
     * @function emitAndWait
     * @description Emit an event and wait for all listeners to be completed!
     * @memberof SafeEmitter#
     * @param {!string} eventName event name
     * @param {any} data Handler data...
     * @returns {void}
     */
    async emitAndWait(eventName, ...data) {
        const evt = events.get(this);
        if (!evt.has(eventName)) {
            return;
        }

        const listeners = evt.get(eventName).slice(0);

        // Iterate over all listeners of eventName
        for (const listener of listeners) {
            try {
                if (isAsyncFunction(listener)) {
                    await listener(...data);
                    continue;
                }
                listener(...data);
            }
            catch (error) {
                this.emit("error", error);
                this[errorHandler](error, eventName, listener);
            }
        }
    }
}

// Static defaultMaxListeners
SafeEmitter.defaultMaxListeners = 10;

// Add method alias
SafeEmitter.prototype.addEventListener = SafeEmitter.prototype.on;
SafeEmitter.prototype.removeEventListener = SafeEmitter.prototype.off;
SafeEmitter.prototype.rawListeners = SafeEmitter.prototype.listeners;

module.exports = SafeEmitter;
