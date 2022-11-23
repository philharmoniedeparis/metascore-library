import LinkCommandBase from "@ckeditor/ckeditor5-link/src/linkcommand";
import { omit } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";

export default class LinkCommand extends LinkCommandBase {
  /**
   * @inheritDoc
   */
  constructor(editor) {
    super(editor);

    /**
     * The type of link.
     *
     * @observable
     * @readonly
     * @member #type
     */
    this.set("type", null);

    /**
     * The link parameters.
     *
     * @observable
     * @readonly
     * @member #params
     */
    this.set("params", null);

    this.on("change:value", (evt, name, value) => {
      this.type = "play";
      this.params = null;

      if (value) {
        const { getLinkActions } = useModule("app_components");
        const actions = getLinkActions(value);

        if (actions && actions.length > 0) {
          const action = actions[0];
          this.type = action.type;
          this.params = omit(action, ["type"]);
        }
      }
    });
  }
}
