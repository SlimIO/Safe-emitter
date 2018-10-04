const SafeEmitter = require("..");

const sym = Symbol("foo");
const myEvent = new SafeEmitter();
myEvent.catch((err, eventName) => {
    console.log(`Catched error for event <${eventName.toString()}> ${err.message}`);
});
myEvent.on(sym, () => {
    throw new Error("ooopsss!");
});
myEvent.emit(sym);
