import TimecodeInput from "./components/TimecodeInput";

export default {
  id: "timecode_input",
  install({ app }) {
    app.component("TimecodeInput", TimecodeInput);
  },
};
