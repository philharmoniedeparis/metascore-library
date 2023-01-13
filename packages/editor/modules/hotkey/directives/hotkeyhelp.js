import { splitCombination } from "v-hotkey/src/helpers";
import { isApplePlatform } from "@metascore-library/core/utils/device";
import { capitalizeFirstLetter } from "@metascore-library/core/utils/string";

export default {
  mounted(el, binding) {
    const combination = binding.value;
    const keys = splitCombination(combination).map((key) => {
      if (key === "mod") {
        return isApplePlatform() ? "Cmd" : "Ctrl";
      }

      return capitalizeFirstLetter(key);
    });

    const str = `[${keys.join("+")}]`;

    el.title = el.title ? `${el.title} ${str}` : str;
  },
};
