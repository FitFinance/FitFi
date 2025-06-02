import eslintPlugin from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: parser,
    },
    plugins: {
      '@typescript-eslint': eslintPlugin,
    },
    rules: {
      '@typescript-eslint/typedef': [
        'error',
        {
          variableDeclaration: true,
          parameter: true,
          propertyDeclaration: true,
          memberVariableDeclaration: true,
          arrowParameter: true,
          objectDestructuring: true,
          arrayDestructuring: true,
        },
      ],
    },
  },
];
