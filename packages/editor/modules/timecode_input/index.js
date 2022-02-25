import TimecodeInput from "./components/TimecodeInput";

export default {
  name: "TimecodeInput",
  install({ app }) {
    app.component("TimecodeInput", TimecodeInput);
  },
};
