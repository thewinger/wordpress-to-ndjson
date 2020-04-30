module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        "project": "./tsconfig.json"
    },
    plugins: ['@typescript-eslint'],
    env: {
        browser: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        "prettier",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended"
    ],
    "rules": {
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "prettier/prettier": "error",
    }
};