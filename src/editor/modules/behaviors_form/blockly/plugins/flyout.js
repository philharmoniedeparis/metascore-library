import { ContinuousFlyout } from "@blockly/continuous-toolbox";

export default class Flyout extends ContinuousFlyout {
  constructor(workspaceOptions) {
    super(workspaceOptions);

    this.CORNER_RADIUS = 0;
  }
}
