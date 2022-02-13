import MediaSelector from "./components/MediaSelector";

export default {
  name: "MediaSelector",
  install({ app }) {
    app.component("MediaSelector", MediaSelector);
  },
};
