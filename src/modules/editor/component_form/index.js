import ComponentForm from "./components/ComponentForm";

export default {
  name: "ComponentForm",
  install({ app }) {
    app.component("component-form", ComponentForm);
  },
};
