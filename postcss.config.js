module.exports = ({ file, options, env }) => ({
  plugins: {
      'postcss-normalize': {},
      'postcss-preset-env': {},
      'cssnano': {}
    }
});