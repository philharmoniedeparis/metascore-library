//import { rankWith, and, schemaTypeIs, schemaMatches } from "@jsonforms/core";
import { rankWith, schemaTypeIs } from "@jsonforms/core";

import ArrayControlRenderer from "./ArrayControlRenderer.vue";
//import AnimatedControlRenderer from "./AnimatedControlRenderer.vue";

export const arrayRenderers = [
  {
    renderer: ArrayControlRenderer,
    tester: rankWith(3, schemaTypeIs("array")),
  },
  /*{
    renderer: AnimatedControlRenderer,
    tester: rankWith(
      4,
      and(
        schemaTypeIs("array"),
        schemaMatches((schema) => schema.format === "animated")
      )
    ),
  },*/
];
