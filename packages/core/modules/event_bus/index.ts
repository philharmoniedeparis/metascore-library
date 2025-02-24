import AbstractModule from "@core/services/module-manager/AbstractModule";
import { TinyEmitter } from "tiny-emitter";

export default class EventBusModule extends AbstractModule {
  static id = "event_bus";

  _emitter = new TinyEmitter();

  /**
   * Subscribe to an event
   *
   * @param event The name of the event to subscribe to
   * @param handler  The function to call when the event is emitted
   */
  on(event: string, handler: (payload?: unknown) => void) {
    this._emitter.on(event, handler);
  }

  /**
   * Subscribe to an event only once
   *
   * @param event The name of the event to subscribe to
   * @param handler  The function to call when the event is emitted
   */
  once(event: string, handler: (payload?: unknown) => void) {
    this._emitter.once(event, handler);
  }

  /**
   * Unsubscribe from an event
   *
   * @param event The name of the event to unsubscribe from
   * @param handler  The function used when binding to the event
   */
  off(event: string, handler: (payload?: unknown) => void) {
    this._emitter.off(event, handler);
  }

  /**
   * Trigger a named event
   *
   * @param event The event name to emit
   * @param payload An optional payload to pass to the event subscribers
   */
  emit(event: string, payload?: unknown) {
    this._emitter.emit(event, payload);
  }
}
