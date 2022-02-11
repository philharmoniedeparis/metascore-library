import PlayerZoom from "./components/PlayerZoom.vue";

export default {
  name: "PlayerZoom",
  install({ app }) {
    app.component("PlayerZoom", PlayerZoom);
  },
};
