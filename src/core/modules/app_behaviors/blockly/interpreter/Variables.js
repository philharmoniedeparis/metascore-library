import { ref } from "vue";
import AbstractInterpreter from "./AbstractInterpreter";

export default class Variables extends AbstractInterpreter {
  constructor() {
    super();

    this._listeners = [];
  }

  get context() {
    return {
      store: ref(new Map()),
    };
  }
}
