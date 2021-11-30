import { computed, readonly } from "vue";
import { isNull, isUndefined } from "@/core/utils/Var";

export default function (model) {
  const position = computed(() => {
    const { position: value } = model.value;

    if (!isUndefined(value) && !isNull(value)) {
      return {
        top: `${value[0]}px`,
        left: `${value[1]}px`,
      };
    }

    return {};
  });

  return {
    position: readonly(position),
  };
}
