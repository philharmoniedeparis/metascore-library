import TimecodeInput from "./components/TimecodeInput";

export default {
  name: "TimecodeInput",
  async install({ app }) {
    app.component("TimecodeInput", TimecodeInput);
  },
};
