import {
  rankWith,
  or,
  isIntegerControl,
  isNumberControl,
} from "@jsonforms/core";

import NumberControlRenderer from "./NumberControlRenderer.vue";

export const controlRenderers = [
  {
    renderer: NumberControlRenderer,
    tester: rankWith(3, or(isNumberControl, isIntegerControl)),
  },
];
