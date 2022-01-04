import PlayerPreview from "./components/PlayerPreview";

export default {
  name: "PlayerPreview",
  install({ app }) {
    app.component("player-preview", PlayerPreview);
  },
};
