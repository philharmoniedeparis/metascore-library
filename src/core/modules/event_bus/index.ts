import AbstractModule, { type Context } from "@core/services/module-manager/AbstractModule";
import Emitter from "tiny-emitter";

export default class EventBusModule extends AbstractModule {
  static id = "event_bus";

  constructor(context: Context) {
    super(context);

    this._emitter = new Emitter();
  }

  /**
   * Subscribe to an event
   *
   * @param {string} event The name of the event to subscribe to
   * @param {Function} handler  The function to call when the event is emitted
   */
  on(event, handler) {
    this._emitter.on(event, handler);
  }

  /**
   * Subscribe to an event only once
   *
   * @param {string} event The name of the event to subscribe to
   * @param {Function} handler  The function to call when the event is emitted
   */
  once(event, handler) {
    this._emitter.once(event, handler);
  }

  /**
   * Unsubscribe from an event
   *
   * @param {string} event The name of the event to unsubscribe from
   * @param {Function} handler  The function used when binding to the event
   */
  off(event, handler) {
    this._emitter.off(event, handler);
  }

  /**
   * Trigger a named event
   *
   * @param {string} event The event name to emit
   * @param {object?} payload An optional payload to pass to the event subscribers
   */
  emit(event, payload) {
    this._emitter.emit(event, payload);
  }
}
