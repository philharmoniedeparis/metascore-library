import VueDOMPurifyHTML from "vue-dompurify-html";

export default {
  name: "DomPurify",
  install({ app }) {
    app.use(VueDOMPurifyHTML, {
      hooks: {
        afterSanitizeAttributes: (node) => {
          if (node.tagName === "A") {
            node.setAttribute("target", "_blank");
            node.setAttribute("rel", "noopener");
          }
        },
      },
    });
  },
};
