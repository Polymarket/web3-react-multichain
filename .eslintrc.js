module.exports = {
  extends: "airbnb-base-typescript-prettier",
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "_",
        varsIgnorePattern: "_",
      },
    ],
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        ts: "never",
      },
    ],
    "import/prefer-default-export": "off",
    "prefer-destructuring": "off",
    "prefer-template": "off",
    "@typescript-eslint/no-shadow": "off",
    "max-classes-per-file": "off",
    "no-console": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
    "no-shadow": "off",
    "no-bitwise": "off"
  },
};
