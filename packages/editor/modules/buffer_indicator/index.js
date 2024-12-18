import AbstractModule from "@core/services/module-manager/AbstractModule";
import MediaPlayer from "@core/modules/media_player";
import BufferIndicator from "./components/BufferIndicator";

export default class BufferIndicatorModule extends AbstractModule {
  static id = "buffer_indicator";

  static dependencies = [MediaPlayer];

  constructor({ app }) {
    super(arguments);

    app.component("BufferIndicator", BufferIndicator);
  }
}
