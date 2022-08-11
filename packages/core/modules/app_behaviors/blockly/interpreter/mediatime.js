import { useModule } from "@metascore-library/core/services/module-manager";
import JavaScript from "blockly/javascript";
import { unref } from "vue";

export function init(interpreter, globalObject) {
  // Ensure 'MediaTime' name does not conflict with variable names.
  JavaScript.addReservedWords("MediaTime");

  // Create 'MediaTime' global object.
  const MediaTime = interpreter.nativeToPseudo({});
  interpreter.setProperty(globalObject, "MediaTime", MediaTime);

  // Define 'MediaTime.get' property.
  interpreter.setProperty(
    MediaTime,
    "get",
    interpreter.createNativeFunction(function () {
      const { time } = useModule("media_player");
      return unref(time);
    })
  );

  // Define 'MediaTime.set' property.
  interpreter.setProperty(
    MediaTime,
    "set",
    interpreter.createNativeFunction(function (time) {
      const { seekTo } = useModule("media_player");
      console.log("seekTo", time);
      return seekTo(time);
    })
  );
}
