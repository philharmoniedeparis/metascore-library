import { computed, readonly } from "vue";
import { isNull, isUndefined } from "@/core/utils/Var";

export default function (model) {
  const size = computed(() => {
    const { dimension: value } = model.value;

    if (!isUndefined(value) && !isNull(value)) {
      return {
        width: `${value[0]}px`,
        height: `${value[1]}px`,
      };
    }

    return {};
  });

  return {
    size: readonly(size),
  };
}
