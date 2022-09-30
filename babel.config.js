module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  plugins: ["@babel/plugin-proposal-class-properties"],
  env: {
    production: {
      //plugins: ["@interactjs/dev-tools/babel-plugin-prod"],
    },
  },
};
