import Emitter from "tiny-emitter";

const events = new Emitter();
const EVENT_TYPES = { example: "example" };

export default {
  $emit: {
    example: (payload) => events.$emit(EVENT_TYPES.example, payload),
  },
  $on: {
    example: (callback) => events.$on(EVENT_TYPES.example, callback),
  },
};
