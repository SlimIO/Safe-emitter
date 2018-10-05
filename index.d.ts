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
    off(eventName: SafeEmitter.EventName, listener: SafeEmitter.Listener): void;
    once(eventName: SafeEmitter.EventName, timeOut?: number): Promise<void>;
    addEventListener(eventName: SafeEmitter.EventName, listener: SafeEmitter.Listener): void;
    removeEventListener(eventName: SafeEmitter.EventName, listener: SafeEmitter.Listener): void;
    prependListener(eventName: SafeEmitter.EventName, listener: SafeEmitter.Listener): void;
    prependOnceListener(): void;
    removeAllListeners(eventName?: SafeEmitter.EventName): void;
    emit(eventName: SafeEmitter.EventName, ...data: any[]): void;
    emitAndWait(eventName: SafeEmitter.EventName, ...data: any[]): void;
}

/**
 * Emitter namespace
 */
declare namespace SafeEmitter {

    export type ErrorListener = (error: Error, eventName: EventName, listener: Listener) => void;
    export type EventName = String | Symbol;
    export type Listener = () => any;

}

export as namespace SafeEmitter;
export = SafeEmitter;
