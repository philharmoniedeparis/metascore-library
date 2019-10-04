module.exports = ({ file, options, env }) => ({
    plugins: {
        'postcss-preset-env': {},
        'cssnano': {}
      }
  });