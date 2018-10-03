// Require Third-party Dependencies
const is = require("@slimio/is");

/**
 * @class SafeEmitter
 */
class SafeEmitter {

    /**
     * @constructor
     * @param {Object=} [options={}] Emitter options
     * @param {Boolean=} options.async Enable Asynchronous mode
     */
    constructor(options = Object.create(null)) {
        /** @type {Map<String, Array<() => any>>} */
        this._events = new Map();
        this._maxEventListeners = SafeEmitter.DEFAULT_MAX;
        this._async = is.bool(options.async) ? options.async : false;
    }

    /**
     * @public
     * @method eventNames
     * @memberof SafeEmitter#
     * @return {String[]}
     */
    eventNames() {
        return [...this._events.keys()];
    }

    /**
     * @public
     * @method listenerCount
     * @memberof SafeEmitter#
     * @param {!String} eventName event name
     * @return {Number}
     */
    listenerCount(eventName) {
        if (!this._events.has(eventName)) {
            return 0;
        }

        return this._events.get(eventName).length;
    }

    /**
     * @public
     * @memberof SafeEmitter#
     * @member {Number} maxListeners
     * @desc Maximum number of listeners that can be added to one event!
     */
    get maxListeners() {
        return this._maxEventListeners;
    }

    /**
     * @param {!Number} max newest maximum count
     */
    set maxListeners(max) {
        if (typeof max !== "number") {
            throw new TypeError("max should be typeof number!");
        }

        this._maxEventListeners = max < 0 ? SafeEmitter.DEFAULT_MAX : max;
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

        if (this._events.has(eventName)) {
            const listenerArr = this._events.get(eventName);
            if (listenerArr.length + 1 > this._maxEventListeners) {
                throw new Error(`Maximum number of listener (${this._maxEventListeners}) has been reach.`);
            }
            listenerArr.push(listener);
        }
        else {
            this._events.set(eventName, [listener]);
        }
    }

    prependListener(eventName, listener) {

    }

    once(eventName, listener)  {

    }

    prependOnceListener(eventName, listener) {

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

        if (this._events.has(eventName)) {
            const listenerArr = this._events.get(eventName);
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

        this._events.delete(eventName);
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
        if (this._events.has(eventName)) {
            return;
        }


    }

}

SafeEmitter.DEFAULT_MAX = 10;

// Add method alias
SafeEmitter.prototype.addEventListener = SafeEmitter.prototype.on;
SafeEmitter.prototype.removeEventListener = SafeEmitter.prototype.off;

module.exports = SafeEmitter;
