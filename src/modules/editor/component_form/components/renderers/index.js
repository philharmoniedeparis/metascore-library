import { arrayRenderers } from "./array";
import { controlRenderers } from "./controls";

export const customRenderers = [...controlRenderers, ...arrayRenderers];
