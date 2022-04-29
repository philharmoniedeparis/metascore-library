import AbstractModule from "@metascore-library/core/services/module-manager/AbstractModule";
import MediaPlayer from "@metascore-library/core/modules/media_player";
import BufferIndicator from "./components/BufferIndicator";

export default class BufferIndicatorModule extends AbstractModule {
  static id = "buffer_indicator";

  static dependencies = [MediaPlayer];

  constructor({ app }) {
    super(arguments);

    app.component("BufferIndicator", BufferIndicator);
  }
}
