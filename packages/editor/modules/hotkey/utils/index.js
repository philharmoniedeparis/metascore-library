import { splitCombination } from "v-hotkey/src/helpers";
import { isApplePlatform } from "@metascore-library/core/utils/device";
import { capitalizeFirstLetter } from "@metascore-library/core/utils/string";

/**
 * Format a hotkey combination for display perposes.
 *
 * @param {string} combination The key combination to format
 */
export function format(combination) {
  const keys = splitCombination(combination).map((key) => {
    if (key === "mod") {
      return isApplePlatform() ? "Cmd" : "Ctrl";
    }

    return capitalizeFirstLetter(key);
  });

  return keys.join("+");
}
