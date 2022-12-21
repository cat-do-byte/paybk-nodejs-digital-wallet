module.exports = {
	env: {
		es2021: true,
		node: true,
	},
	extends: ['standard-with-typescript', 'plugin:prettier/recommended', 'plugin:import/errors'],
	overrides: [],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'prettier', 'import'],
	rules: {
		'prettier/prettier': 'error',
		'import/extension': 'off',
	},
};
