import { LinkCommand } from "@ckeditor/ckeditor5-link";
import { omit } from "lodash";
import { useModule } from "@core/services/module-manager";

export default class CustomLinkCommand extends LinkCommand {
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
    this.set("params", {});

    this.on("change:value", (evt, name, value) => {
      this.type = "url";
      this.params = {};

      if (value) {
        const { getLinkActions } = useModule("app_components");
        const actions = getLinkActions(value);

        if (actions && actions.length > 0) {
          const action = actions[0];

          this.params = omit(action, ["type"]);

          switch (action.type) {
            case "page":
              this.type = action.type;
              this.params.index++;
              break;

            case "showBlock":
              this.type = "toggle";
              this.params.action = "show";
              break;
            case "hideBlock":
              this.type = "toggle";
              this.params.action = "hide";
              break;
            case "toggleBlock":
              this.type = "toggle";
              this.params.action = "toggle";
              break;

            case "enterFullscreen":
              this.type = "fullscreen";
              this.params.action = "enter";
              break;
            case "exitFullscreen":
              this.type = "fullscreen";
              this.params.action = "exit";
              break;
            case "toggleFullscreen":
              this.type = "fullscreen";
              this.params.action = "toggle";
              break;

            default:
              this.type = action.type;
          }
        }
      }
    });
  }
}
