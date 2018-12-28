declare class SafeEmitter<T = SafeEmitter.Default> {
    constructor();

    // Static Properties
    static defaultMaxListeners: number;

    // Methods
    getMaxListeners(): number;
    setMaxListeners(max: number): void;
    catch(errorListener: SafeEmitter.ErrorListener<T>): this;
    eventNames(): keyof T[];
    listenerCount<K extends keyof T>(eventName: K): number;
    listeners<K extends keyof T>(eventName: K): T[K][];
    rawListeners<K extends keyof T>(eventName: K): T[K][];
    on<K extends keyof T>(eventName: K, listener: T[K]): void;
    off<K extends keyof T>(eventName: K, listener: T[K]): boolean;
    once<K extends keyof T>(eventName: K, timeOut?: number): Promise<[T[K]]>;
    addEventListener<K extends keyof T>(eventName: K, listener: T[K]): void;
    removeEventListener<K extends keyof T>(eventName: K, listener: T[K]): void;
    prependListener<K extends keyof T>(eventName: K, listener: T[K]): void;
    prependOnceListener(): void;
    removeAllListeners<K extends keyof T>(eventName?: K): void;
    emit<K extends keyof T>(eventName: K, data: T[K]): void;
    emitAndWait<K extends keyof T>(eventName: K, data: T[K]): void;
}

declare namespace SafeEmitter {
    export type EventType = string | symbol;
    export type ErrorListener<T> = (error: Error, eventName: keyof T, listener: T[keyof T]) => void;
    export interface Default {
        [key: string]: () => void;
    }
}

export as namespace SafeEmitter;
export = SafeEmitter;
