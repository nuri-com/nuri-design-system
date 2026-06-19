// Babel config for Expo + jest (jest-expo's babel-jest transform reads this).
// Expo's Metro already uses babel-preset-expo internally; declaring it here is
// the standard form and is what jest-expo needs to transform RN/TSX under test.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
