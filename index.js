// Require Third-party Dependencies
const is = require("@slimio/is");

// Private Properties
const events = new WeakMap();
const maxEventListeners = Symbol("maxEventListeners");
const errorHandler = Symbol("ErrorHandler");

/**
 * @function addListener
 * @param {!SafeEmitter} emitter Emitter instance
 * @param {!String} eventName eventName
 * @param {any} listener event listener (handler)
 * @param {!Boolean} start push at the start or the end
 * @returns {void}
 */
function addListener(emitter, eventName, listener, start = false) {
    const evt = events.get(emitter);
    if (evt.has(eventName)) {
        const listenerArr = evt.get(eventName);
        if (listenerArr.length + 1 > emitter.maxListeners) {
            throw new Error(`Maximum number of listener (${emitter.maxListeners}) has been reach.`);
        }
        listenerArr[start ? "unshift" : "push"](listener);
    }
    else {
        evt.set(eventName, [listener]);
    }
}

/**
 * @class SafeEmitter
 */
class SafeEmitter {

    /**
     * @constructor
     */
    constructor() {
        events.set(this, new Map());
        this[maxEventListeners] = SafeEmitter.defaultMaxListeners;
        this[errorHandler] = function errorHandler(err) {
            console.error(err);
        };
    }

    /**
     * @public
     * @method eventNames
     * @memberof SafeEmitter#
     * @return {String[]}
     */
    eventNames() {
        return [...events.get(this).keys()];
    }

    /**
     * @public
     * @method listenerCount
     * @memberof SafeEmitter#
     * @param {!String} eventName event name
     * @return {Number}
     */
    listenerCount(eventName) {
        const evt = events.get(this);
        if (!evt.has(eventName)) {
            return 0;
        }

        return evt.get(eventName).length;
    }

    /**
     * @public
     * @method listeners
     * @memberof SafeEmitter#
     * @desc Returns a copy of the array of listeners for the event named eventName.
     * @param {!String} eventName event name
     * @return {Array<any>}
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
     * @memberof SafeEmitter#
     * @member {Number} maxListeners
     * @desc Maximum number of listeners that can be added to one event!
     */
    get maxListeners() {
        return this[maxEventListeners];
    }

    /**
     * @param {!Number} max newest maximum count
     * @throws {TypeError}
     */
    set maxListeners(max) {
        if (typeof max !== "number") {
            throw new TypeError("max argument should be typeof number!");
        }

        this[maxEventListeners] = max < 0 ? SafeEmitter.defaultMaxListeners : max;
    }

    /**
     * @public
     * @method on
     * @memberof SafeEmitter#
     * @param {!String} eventName event name
     * @param {any} listener event handler!
     * @return {void}
     *
     * @throws {TypeError}
     * @throws {Error}
     */
    on(eventName, listener) {
        if (typeof eventName !== "string") {
            throw new TypeError("eventName should be typeof string");
        }
        if (!is.func(listener)) {
            throw new TypeError("listener should be typeof Function");
        }

        addListener(this, eventName, listener, false);
    }

    /**
     * @public
     * @method prependListener
     * @memberof SafeEmitter#
     * @param {!String} eventName event name
     * @param {any} listener event handler!
     * @return {void}
     *
     * @throws {TypeError}
     * @throws {Error}
     */
    prependListener(eventName, listener) {
        if (typeof eventName !== "string") {
            throw new TypeError("eventName should be typeof string");
        }
        if (!is.func(listener)) {
            throw new TypeError("listener should be typeof Function");
        }

        addListener(this, eventName, listener, true);
    }

    /**
     * @public
     * @method once
     * @memberof SafeEmitter#
     * @param {!String} eventName event name
     * @param {!Number} timeOut event Timeout
     * @return {void}
     *
     * @throws {TypeError}
     */
    once(eventName, timeOut) {
        if (typeof eventName !== "string") {
            throw new TypeError("eventName should be typeof string");
        }

        return new Promise((resolve, reject) => {
            /** @type {NodeJS.Timer} */
            let timeOutTimer;
            const listener = () => {
                if (typeof timeOutTimer !== "undefined") {
                    clearTimeout(timeOutTimer);
                }
                this.off(eventName, listener);
                resolve();
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
     * @method off
     * @memberof SafeEmitter#
     * @param {!String} eventName event name
     * @param {any} listener event handler!
     * @return {void}
     *
     * @throws {TypeError}
     */
    off(eventName, listener) {
        if (typeof eventName !== "string") {
            throw new TypeError("eventName should be typeof string");
        }
        if (!is.func(listener)) {
            throw new TypeError("handler should be typeof Function");
        }

        const evt = events.get(this);
        if (evt.has(eventName)) {
            const listenerArr = evt.get(eventName);
            const handlerIndex = listenerArr.indexOf(listener);
            if (handlerIndex !== -1) {
                listenerArr.splice(handlerIndex, 1);
            }
        }
    }

    /**
     * @public
     * @method removeAllListeners
     * @memberof SafeEmitter#
     * @param {!String} eventName event name
     * @return {void}
     *
     * @throws {TypeError}
     */
    removeAllListeners(eventName) {
        if (typeof eventName !== "string") {
            throw new TypeError("eventName should be typeof string");
        }

        events.get(this).delete(eventName);
    }

    /**
     * @public
     * @method emit
     * @memberof SafeEmitter#
     * @param {!String} eventName event name
     * @param {any} data Handler data...
     * @return {void}
     */
    emit(eventName, ...data) {
        const evt = events.get(this);
        if (evt.has(eventName)) {
            return;
        }

        const listenersArr = evt.get(eventName);
        for (const listener of listenersArr) {
            if (is.asyncFunction(listener)) {
                listener(...data).catch(this[errorHandler]);
                continue;
            }
            try {
                listener(...data);
            }
            catch (error) {
                this[errorHandler](error);
            }
        }
    }

    /**
     * @public
     * @method emitAsync
     * @memberof SafeEmitter#
     * @param {!String} eventName event name
     * @param {any} data Handler data...
     * @return {void}
     */
    emitAsync(eventName, ...data) {
        const evt = events.get(this);
        if (evt.has(eventName)) {
            return;
        }

        const listenersArr = evt.get(eventName);
        Promise.all(listenersArr).catch(this[errorHandler]);
    }

}

// Static defaultMaxListeners
SafeEmitter.defaultMaxListeners = 10;

// Add method alias
SafeEmitter.prototype.addEventListener = SafeEmitter.prototype.on;
SafeEmitter.prototype.removeEventListener = SafeEmitter.prototype.off;

module.exports = SafeEmitter;
