import LinkCommandBase from "@ckeditor/ckeditor5-link/src/linkcommand";

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
     * @member #value
     */
    this.set("type", undefined);

    /**
     * The link parameters.
     *
     * @observable
     * @readonly
     * @member #params
     */
    this.set("params", undefined);

    this.on("change:value", (evt, name, value) => {
      if (!value) return;

      let matches = null;

      if (
        (matches = value.match(/^#play(=(\d*\.?\d+)?,(\d*\.?\d+)?,([^,]+))?$/))
      ) {
        this.type = "play";

        if (typeof matches[1] !== "undefined") {
          this.params = {
            excerpt: true,
            start:
              typeof matches[2] !== "undefined" ? parseFloat(matches[2]) : null,
            stop:
              typeof matches[2] !== "undefined" ? parseFloat(matches[3]) : null,
            scenario: matches[4],
          };
        } else {
          this.params = {
            excerpt: false,
          };
        }
        return;
      }

      if (value.match(/^#pause$/)) {
        this.type = "pause";
        this.params = null;
        return;
      }

      if (value.match(/^#stop$/)) {
        this.type = "stop";
        this.params = null;
        return;
      }

      if ((matches = value.match(/^#seek=(\d*\.?\d+)$/))) {
        this.type = "seek";
        this.params = {
          time: parseFloat(matches[1]),
        };
        return;
      }

      if ((matches = value.match(/^#page=([^,]*),(\d+)$/))) {
        this.type = "page";
        this.params = {
          block: matches[1],
          page: matches[2],
        };
        return;
      }

      if ((matches = value.match(/^#(show|hide|toggle)Block=(.*)$/))) {
        this.type = "toggle";
        this.params = {};
        return;
      }

      if ((matches = value.match(/^#scenario=(.+)$/))) {
        this.type = "scenario";
        this.params = {};
        return;
      }

      if ((matches = value.match(/^#(enter|exit|toggle)Fullscreen$/))) {
        this.type = "fullscreen";
        this.params = {};
        return;
      }

      this.type = "url";
      this.params = null;
    });
  }
}
