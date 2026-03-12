module.exports = {
    env: { node: true, es6: true, browser: true, jest: true },
    extends: ["eslint:recommended", "google", "prettier"],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./jsconfig.json",
        ecmaFeatures: { jsx: true, modules: true, experimentalObjectRestSpread: true }
    },
    ignorePatterns: ["node_modules/", "out/"],
    plugins: ["import", "unused-imports", "prettier"],
    rules: {
        "spaced-comment": "off",
        "space-before-function-paren": "off",
        "no-invalid-this": "off",
        "import/no-anonymous-default-export": "off",
        "import/newline-after-import": ["error", { count: 1 }],
        "operator-linebreak": [1, "after", { overrides: { "?": "ignore", ":": "ignore" } }],
        "prettier/prettier": ["warn"],
        "newline-before-return": "warn",
        "camelcase": "off",
        "new-cap": "off",
        "max-len": "off",
        "quotes": "off",
        "indent": "off",
        "require-jsdoc": "off",
        "no-empty": "off",
        "no-useless-escape": "off",
        "no-constant-condition": ["error", { checkLoops: false }],
        "object-curly-spacing": ["error", "always"],
        "comma-dangle": ["error", "never"],
        "arrow-parens": ["error", "as-needed"],
        "unused-imports/no-unused-imports": "error"
    }
};
