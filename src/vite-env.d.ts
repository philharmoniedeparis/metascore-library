/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

import '../.types/generated.d.ts'

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// @blockly/block-plus-minus
declare module "@blockly/block-plus-minus/src/field_minus";
declare module "@blockly/block-plus-minus/src/field_plus";

import type { StoreOnActionListenerContext, StateTree } from "pinia";

interface HistoryContext extends StoreOnActionListenerContext<string, StateTree, unknown, unknown> {
  push: (item: unknown) => void
}
declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    history?: (this: Store, context: HistoryContext) => void
  }
}
