module.exports = {
  extends: [
    '@sigmasms/eslint-config-backend/typescript'
  ],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir : __dirname, 
    ecmaVersion: 2018,
    sourceType: 'module',
  }
}
