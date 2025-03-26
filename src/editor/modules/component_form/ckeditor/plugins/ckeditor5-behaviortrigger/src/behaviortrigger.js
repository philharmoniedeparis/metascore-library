import { Plugin } from "ckeditor5";
import BehaviorTriggerEditing from "./behaviortriggerediting";
import BehaviorTriggerUI from "./behaviortriggerui";

export default class BehaviorTrigger extends Plugin {
  static get requires() {
    return [BehaviorTriggerEditing, BehaviorTriggerUI];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "BehaviorTrigger";
  }
}
