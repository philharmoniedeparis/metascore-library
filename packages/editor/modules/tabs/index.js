import TabsContainer from "./components/TabsContainer";
import TabsItem from "./components/TabsItem";

export default {
  name: "Tabs",
  install({ app }) {
    app.component("TabsContainer", TabsContainer);
    app.component("TabsItem", TabsItem);
  },
};
