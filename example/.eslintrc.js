module.exports = {
  extends: "../.eslintrc.js",
  rules: {
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }
    ],
    "no-nested-ternary": "off",
    "react/button-has-type": "off",
    "consistent-return": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "react/jsx-props-no-spreading": "off",
    "no-alert": "off"
  },
  globals: {
    JSX: true
  }
}
