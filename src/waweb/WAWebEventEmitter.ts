// TypeScript version of the provided JavaScript module.
// Note: The "err" dependency is replaced with a generic Error throw.

type EventCallback = (...args: any[]) => void;
interface EventHandler {
  callback: EventCallback & { _callback?: EventCallback };
  context?: any;
  ctx: any;
}
type EventMap = Record<string, EventHandler[]>;

let listenIdCounter = 0;
/**
 * Reverse enginered from JS by ChatGPT, use as type only
 */
export class WAWebEventEmitter {
  private _events?: EventMap;
  private _listeningTo?: Record<string, WAWebEventEmitter>;
  private _listenId?: string;

  private static _splitter = /\s+/;

  on(event: string, callback?: EventCallback, context?: any): this {
    if (!callback) return this;
    if (typeof callback !== "function") {
      throw new Error("Callback parameter passed is not a function");
    }
    if (
      this._multiEvent(
        this.on,
        event,
        callback,
        context
      )
    ) {
      return this;
    }
    this._getOrCreateEvents(event).push({
      callback,
      context,
      ctx: context != null ? context : this,
    });
    return this;
  }

  once(event: string, callback?: EventCallback, context?: any): this {
    if (!callback) return this;
    if (
      this._multiEvent(
        this.once,
        event,
        callback,
        context
      )
    ) {
      return this;
    }
    const self = this;
    let called = false;
    function onceCallback(this: any, ...args: any[]) {
      if (!called) {
        called = true;
        self.off(event, onceCallback, context);
        callback.apply(this, args);
      }
    }
    (onceCallback as any)._callback = callback;
    return this.on(event, onceCallback, context);
  }

  off(event?: string, callback?: EventCallback, context?: any): this {
    const events = this._events;
    if (!events) return this;
    if (
      this._multiEvent(
        this.off,
        event,
        callback,
        context
      )
    ) {
      return this;
    }
    if (!event && callback == null && context == null) {
      this._events = undefined;
      return this;
    }
    const names = event ? [event] : Object.keys(events);
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const handlers = events[name];
      if (!handlers) continue;
      events[name] = [];
      if (callback != null || context != null) {
        for (let j = 0; j < handlers.length; j++) {
          const handler = handlers[j];
          if (
            (callback && callback !== handler.callback && callback !== (handler.callback as any)._callback) ||
            (context != null && handler.context !== context)
          ) {
            events[name].push(handler);
          }
        }
      }
      if (events[name].length === 0) {
        delete events[name];
      }
    }
    return this;
  }

  trigger(event: string, ...args: any[]): this {
    if (!this._events) return this;
    if (
      this._multiEvent(
        this.trigger,
        event,
        ...args
      )
    ) {
      return this;
    }
    const handlers = this._getEvents(event);
    const allHandlers = this._getEvents("all");
    if (handlers) this._triggerEvents(handlers, args);
    if (allHandlers) this._triggerEvents(allHandlers, [event, ...args]);
    return this;
  }

  stopListening(obj?: WAWebEventEmitter, event?: string, callback?: EventCallback): this {
    let listeningTo = this._listeningTo;
    if (!listeningTo) return this;
    let id = obj == null ? undefined : obj._listenId;
    const targets = id ? { [id]: obj } : listeningTo;
    const removeAll = !event && !callback;
    for (const key in targets) {
      const target = targets[key];
      target.off(event, callback, this);
      const targetEvents = target._events;
      if (removeAll || !targetEvents || Object.keys(targetEvents).length === 0) {
        delete listeningTo[key];
      }
    }
    if (!this._listeningTo || Object.keys(this._listeningTo).length === 0) {
      delete this._listeningTo;
    }
    return this;
  }

  listenTo(obj: WAWebEventEmitter, event: string, callback: EventCallback): this {
    if (!callback) return this;
    this._addListeningTo(obj);
    obj.on(event, callback, this);
    return this;
  }

  listenToOnce(obj: WAWebEventEmitter, event: string, callback: EventCallback): this {
    this._addListeningTo(obj);
    obj.once(event, callback, this);
    return this;
  }

  listenToAndRun(obj: WAWebEventEmitter, event: string, callback: EventCallback): this {
    this.listenTo(obj, event, callback);
    callback.call(this);
    return this;
  }

  isListening(event?: string): boolean {
    const events = this._events;
    if (!events) return false;
    if (typeof event === "string") {
      return !!events[event];
    }
    return Object.keys(events).length === 0;
  }

  private _addListeningTo(obj: WAWebEventEmitter): void {
    const listeningTo = this._listeningTo || (this._listeningTo = {});
    const id = obj._listenId || (obj._listenId = "l" + ++listenIdCounter);
    listeningTo[id] = obj;
  }

  private _getOrCreateEvents(event: string): EventHandler[] {
    const events = this._events || (this._events = {});
    return events[event] || (events[event] = []);
  }

  private _getEvents(event?: string): EventHandler[] | undefined {
    if (!event) return;
    const events = this._events;
    if (!events) return;
    return events[event];
  }

  private _multiEvent(
    fn: Function,
    event?: string,
    ...rest: any[]
  ): boolean {
    if (event && WAWebEventEmitter._splitter.test(event)) {
      const events = event.split(WAWebEventEmitter._splitter);
      for (let i = 0; i < events.length; i++) {
        fn.call(this, events[i], ...rest);
      }
      return true;
    }
    return false;
  }

  private _triggerEvents(handlers: EventHandler[], args: any[]): void {
    let ev: EventHandler;
    let i = -1;
    const len = handlers.length;
    switch (args.length) {
      case 0:
        while (++i < len) (ev = handlers[i]).callback.call(ev.ctx);
        return;
      case 1:
        while (++i < len) (ev = handlers[i]).callback.call(ev.ctx, args[0]);
        return;
      case 2:
        while (++i < len) (ev = handlers[i]).callback.call(ev.ctx, args[0], args[1]);
        return;
      case 3:
        while (++i < len) (ev = handlers[i]).callback.call(ev.ctx, args[0], args[1], args[2]);
        return;
      default:
        while (++i < len) (ev = handlers[i]).callback.apply(ev.ctx, args);
        return;
    }
  }

  // Aliases for Backbone-style API compatibility
  bind(event: string, callback?: EventCallback, context?: any): this {
    return this.on(event, callback, context);
  }
  unbind(event?: string, callback?: EventCallback, context?: any): this {
    return this.off(event, callback, context);
  }
  removeListener(event?: string, callback?: EventCallback, context?: any): this {
    return this.off(event, callback, context);
  }
  removeAllListeners(): this {
    return this.off();
  }
  emit(event: string, ...args: any[]): this {
    return this.trigger(event, ...args);
  }
}