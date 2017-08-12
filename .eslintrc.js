/**
 * @fileoverview eslint configuration file.
 * @author Alvin Lin (alvin@omgimanerd.tech)
 */
module.exports = {
  'env': {
    'browser': true,
    'es6': true,
    'node': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'sourceType': 'module'
  },
  'rules': {
    // Possible Errors
    'no-await-in-loop': 'warn',
    'no-extra-parens': ['error', 'all'],
    'no-prototype-builtins': 'error',
    'no-template-curly-in-string': 'error',
    'valid-jsdoc': ['warn', {
      'requireReturn': false,
      'requireReturnType': true,
      'requireReturnDescription': false
    }],

    // Best Practices
    'array-callback-return': 'warn',
    'block-scoped-var': 'warn',
    'class-methods-use-this': 'warn',
    'curly': ['warn', 'all'],
    'dot-location': ['warn', 'object'],
    'dot-notation': ['error', {
      'allowKeywords': true
    }],
    'eqeqeq': ['error', 'always'],
    'no-div-regex': 'warn',
    'no-else-return': 'warn',
    'no-empty-function': 'warn',
    'no-eq-null': 'error',
    'no-eval': 'warn',
    'no-extend-native': 'warn',
    'no-extra-bind': 'warn',
    'no-extra-label': 'warn',
    'no-floating-decimal': 'error',
    'no-implicit-coercion': ['warn', {
      'boolean': false
    }],
    'no-implicit-globals': 'warn',
    'no-implied-eval': 'error',
    'no-iterator': 'warn',
    'no-labels': 'warn',
    'no-lone-blocks': 'warn',
    'no-loop-func': 'warn',
    'no-multi-spaces': 'warn',
    'no-multi-str': 'warn',
    'no-new': 'warn',
    'no-new-func': 'warn',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'warn',
    'no-param-reassign': 'warn',
    'no-proto': 'warn',
    'no-return-assign': 'error',
    'no-return-await': 'warn',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'warn',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-expressions': 'warn',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'no-void': 'error',
    'no-with': 'error',
    'prefer-promise-reject-errors': 'error',
    'radix': 'warn',
    'require-await': 'error',
    'vars-on-top': 'warn',
    'wrap-iife': ['error', 'outside'],

    // Variables
    'init-declarations': ['error', 'always'],
    'no-catch-shadow': 'error',
    'no-label-var': 'error',
    'no-restricted-globals': 'warn',
    'no-shadow': 'warn',
    'no-shadow-restricted-names': 'error',
    'no-undef-init': 'warn',
    'no-undefined': 'error',
    'no-use-before-define': 'error',

    // Node.js and CommonJS
    'global-require': 'warn',
    'handle-callback-err': 'error',
    'no-buffer-constructor': 'error',
    'no-mixed-requires': ['warn', {
      'grouping': true,
      'allowCall': false
    }],
    'no-new-require': 'warn',
    'no-path-concat': 'warn',
    'no-process-exit': 'warn',
    'no-sync': 'error',

    // Stylistic Issues
    'array-bracket-spacing': ['warn', 'never'],
    'block-spacing': ['warn', 'always'],
    'brace-style': ['warn', '1tbs', {
      'allowSingleLine': true
    }],
    'camelcase': 'warn',
    'capitalized-comments': ['warn', 'always'],
    'comma-dangle': ['warn', 'never'],
    'comma-spacing': 'warn',
    'comma-style': ['warn', 'last'],
    'computed-property-spacing': ['warn', 'never'],
    'consistent-this': 'warn',
    'eol-last': ['warn', 'always'],
    'func-call-spacing': ['warn', 'never'],
    'func-name-matching': ['warn', 'always'],
    'func-names': ['warn', 'never'],
    'func-style': ['warn', 'declaration', {
      'allowArrowFunctions': true
    }],
    'indent': ['warn', 2],
    'key-spacing': ['warn', {
      'mode': 'strict'
    }],
    'keyword-spacing': 'warn',
    'line-comment-position': ['warn', 'above'],
    'linebreak-style': ['error', 'unix'],
    'max-len': ['warn', {
      'code': 80
    }],
    'multiline-ternary': ['warn', 'never'],
    'new-cap': ['warn', {
      'capIsNew': false,
    }],
    'new-parens': 'warn',
    'no-array-constructor': 'warn',
    'no-inline-comments': 'warn',
    'no-lonely-if': 'warn',
    'no-mixed-spaces-and-tabs': 'error',
    'no-multiple-empty-lines': ['warn', {
      'max': 2,
      'maxEOF': 0,
      'maxBOF': 0
    }],
    'no-nested-ternary': 'warn',
    'no-new-object': 'warn',
    'no-tabs': 'error',
    'no-trailing-spaces': 'warn',
    'no-underscore-dangle': 'warn',
    'no-unneeded-ternary': 'warn',
    'no-whitespace-before-property': 'warn',
    'object-curly-newline': ['warn', {
      'consistent': true,
    }],
    'object-curly-spacing': ['warn', 'always'],
    'object-property-newline': ['warn', {
      'allowMultiplePropertiesPerLine': true
    }],
    'operator-assignment': ['warn', 'always'],
    'operator-linebreak': ['warn', 'after'],
    'padded-blocks': ['warn', 'never'],
    'quote-props': ['warn', 'as-needed', {
      'keywords': true
    }],
    'quotes': ['warn', 'single'],
    'require-jsdoc': ['warn', {
      'require': {
        'FunctionDeclaration': true,
        'MethodDefinition': true,
        'ClassDeclaration': true,
        'ArrowFunctionExpression': true
      }
    }],
    'semi': ['warn', 'never'],
    'semi-spacing': 'warn',
    'semi-style': ['warn', 'last'],
    'space-before-blocks': ['warn', 'always'],
    'space-before-function-paren': ['warn', 'never'],
    'space-in-parens': ['warn', 'never'],
    'space-infix-ops': 'warn',
    'space-unary-ops': ['warn', {
      'words': true,
      'nonwords': false
    }],
    'spaced-comment': ['warn', 'always'],
    'switch-colon-spacing': 'warn',
    'template-tag-spacing': 'warn',

    // ECMAScript 6
    'arrow-parens': ['warn', 'as-needed'],
    'arrow-spacing': 'warn',
    'generator-star-spacing': ['warn', 'after'],
    'no-confusing-arrow': ['error', {
      'allowParens': false
    }],
    'no-duplicate-imports': 'error',
    'no-useless-computed-key': 'warn',
    'no-useless-rename': 'error',
    'no-var': 'warn',
    'object-shorthand': ['warn', 'consistent-as-needed'],
    'prefer-arrow-callback': 'warn',
    'prefer-const': 'warn',
    'prefer-numeric-literals': 'warn',
    'prefer-rest-params': 'warn',
    'prefer-spread': 'warn',
    'prefer-template': 'warn',
    'rest-spread-spacing': 'warn',
    'sort-imports': 'warn',
    'symbol-description': 'warn',
    'template-curly-spacing': 'warn',
    'yield-star-spacing': ['warn', 'after']
  }
}
