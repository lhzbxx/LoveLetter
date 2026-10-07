module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module'
  },
  extends: 'airbnb-base',
  'rules': {
    'no-console': 0,
    'no-underscore-dangle': ['error', {
      'allowAfterThis': true,
    }]
  }
}
