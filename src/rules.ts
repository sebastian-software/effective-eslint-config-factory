import { SourcePriorityTable } from "./types"

export const ruleBasedSourcePriority: SourcePriorityTable = {
  "accessor-pairs": "kentdodds", // XO enforces classes as well which seems like a so-so idea as one might offer get-only accessors
  "array-callback-return": "cra", // Common in most presets
  camelcase: "xo", // XO enforces camelCase properties, style heavy and controversial, but good thing to follow in 95% of code.
  complexity: "kentdodds", // Configured to 20, Kent only
  "default-case": "cra", // Also: kentdodds, allows exception in CRA
  eqeqeq: "cra", // Smart mode enabled in CRA
  "func-name-matching": "kentdodds", // Enabled but without property descriptor (rarely used)
  "func-names": "kentdodds", // Prefer better debug-ability
  "max-depth": "kentdodds", // Configured to 4, Kent only
  "max-nested-callbacks": "xo", // In Kent and XO, stricter in XO
  "max-params": "xo", // In Kent and XO, stricter in XO
  "max-statements-per-line": "xo", // In Kent and XO, Kent defines a max=1 which is already the default
  "new-cap": "kentdodds", // In Kent and XO, XO defines options which are already the default
  "no-cond-assign": "eslint", // As in most presets, except Kent
  "no-empty": "eslint", // As in most presets
  "no-labels": "xo", // Same for Kent, without exceptions for loops (enabled in CRA... for whatever reason)
  "no-restricted-globals": "cra", // Best richest set from CRA, others only enable it, without config
  "no-return-assign": "kentdodds", // Same in XO, otherwise unconfigured
  "no-self-assign": "eslint", // Effectively same value in all presets
  "no-undef": "xo", // Typeof is enabled in XO only, which is a valid use case
  "no-unsafe-negation": "eslint", // Explicit is better, as in most presets
  "no-unsafe-optional-chaining": "xo", // Like in most presets, but only XO prevent arithmetic operations
  //"no-use-before-define": "off", // Disabled in most presets (CRA only)
  "no-useless-computed-key": "xo", // Like in most presets, but only XO extends to classes
  "no-useless-rename": "xo", // As in most presets
  "no-void": "xo-typescript", // Use undefined seems more accessible like in XO
  //"no-warning-comments": "off", // Off in most presets, controversial, might help to mark future tasks as a valid reason
  "object-shorthand": "kentdodds", // Properties only for Kent, XO enabled for all things incl. functions which might be hard to read, consistent-as-needed would also be a good candidate
  "one-var": "xo", // Prefer readability, controversial as mainly formatting related, but also helps code accessibility
  "prefer-arrow-callback": "xo", // Kent and XO effectively idential, both allow named functions
  "prefer-const": "xo", // XO has fine tuned setting for destructing
  strict: "kentdodds", // Source format is ESM in most code bases, still useful as auto-detected
  "valid-typeof": "eslint", // Common in most presets

  "@typescript-eslint/ban-ts-comment": "xo-typescript", // XO allows exceptions which are a good idea
  "@typescript-eslint/ban-types": "xo-typescript", // Best collection of types to ban is in XO
  "@typescript-eslint/no-empty-interface": "xo-typescript",
  "@typescript-eslint/no-extraneous-class": "xo-typescript",
  "@typescript-eslint/no-floating-promises": "xo-typescript",
  "@typescript-eslint/no-misused-promises": "xo-typescript",
  "@typescript-eslint/no-this-alias": "xo-typescript",
  "@typescript-eslint/no-throw-literal": "xo-typescript",
  "@typescript-eslint/no-unused-vars": "xo-typescript",
  // "@typescript-eslint/no-use-before-define": "off", // Not that relevant in todays world
  "@typescript-eslint/restrict-plus-operands": "xo-typescript",
  "@typescript-eslint/restrict-template-expressions": "xo-typescript",
  "@typescript-eslint/triple-slash-reference": "ts", // Effectively identical in all presets

  "import/named": "import", // Follow the plugin hint for usage in TS projects
  "import/namespace": "xo-typescript", // Should be solved by TS compiler already

  "jsx-a11y/alt-text": "jsx", // Effectively identical in all presets
  "jsx-a11y/anchor-has-content": "jsx", // Effectively identical in all presets
  "jsx-a11y/anchor-is-valid": "cra", // Slightly adjusted version in CRA seems good
  "jsx-a11y/aria-role": "cra", // Slightly adjusted version in CRA seems good
  // "jsx-a11y/control-has-associated-label": "off", // Disabled in jsx, too, tricky with custom components
  "jsx-a11y/heading-has-content": "jsx", // Effectively identical in all presets
  "jsx-a11y/interactive-supports-focus": "jsx", // Follow plugin author recommendation
  // "jsx-a11y/label-has-associated-control": "off", // Disabled in cra, too, tricky with custom components
  "jsx-a11y/media-has-caption": "jsx", // Effectively identical in all presets
  // "jsx-a11y/no-autofocus": "off", // Disabled in cra, too. Not that relevant I guess.
  "jsx-a11y/no-distracting-elements": "jsx", // Effectively identical in all presets
  "jsx-a11y/no-interactive-element-to-noninteractive-role": "jsx", // Follow plugin author recommendation
  "jsx-a11y/no-noninteractive-element-interactions": "jsx", // Follow plugin author recommendation
  "jsx-a11y/no-noninteractive-element-to-interactive-role": "jsx", // Follow plugin author recommendation
  "jsx-a11y/no-noninteractive-tabindex": "jsx", // Follow plugin author recommendation
  "jsx-a11y/no-static-element-interactions": "jsx", // Follow plugin author recommendation

  "react/button-has-type": "xo-react", // Effectively identical in all presets
  "react/function-component-definition": "airbnb-react", // Old school: prefer real inspectable functions
  // "react/default-props-match-prop-types": "off", // TS mode: Do not care about prop-types
  "react/jsx-boolean-value": "xo-react", // Effectively identical in all presets: the default value of this option is "never"
  "react/jsx-curly-brace-presence": "xo-react", // Reduce clutter, formatting related
  "react/jsx-filename-extension": "kentdodds", // Respect .ts/.tsx
  "react/jsx-key": "xo-react", // Again a fine tuned variant over the default ones in other presets
  "react/jsx-no-bind": "xo-react", // Generally disallowed but supports arrow functions (for convenience)
  "react/jsx-no-duplicate-props": "xo-react", // Wrong casing is typically a typo... should be checked by TS anyway...
  "react/jsx-no-script-url": "kentdodds", // Old style stuff... no place in modern FE development
  "react/jsx-no-target-blank": "xo-react", // Fine-tuned in XO to check spreads as well
  "react/jsx-pascal-case": "kentdodds", // Disabling all-caps like in XO as well
  "react/no-string-refs": "xo-react", // Fine-tuned in XO to prevent template strings as well
  "react/no-unsafe": "kentdodds", // Also disabled in strict-mode which should be standard for new developments
  "react/no-unstable-nested-components": "kentdodds", // That's indeed looking like a common issue in code bases. Good find.
  // "react/no-unused-prop-types": "off", // TS mode: Do not care about prop-types
  // "react/prefer-es6-class": "off", // Seems to be about old classes to ES6 classes, but we prefer functional components anyway
  // "react/prop-types": "off", // TS mode: Do not care about prop-types
  // "react/require-default-props": "off", // TS mode: Do not care about prop-types
  // "react/sort-comp": "off", // Relevant for traditional classes only... edge case in todays code bases
  "react/state-in-constructor": "xo-react", // Traditional classes, but pretty tricky if not detected... therefor enabled
  // "react/static-property-placement": "off", // Relevant for traditional classes only... edge case in todays code bases
  "react/style-prop-object": "cra", // XO is right about FormattedNumber, but this might change in React-Intl as well... or one uses a different lib.

  "unicorn/no-null": "xo-typescript" // Disabled as not relevant in TS projects
}

export const ruleBasedSourcePriorityOld: SourcePriorityTable = {
  // Additional "except-parens" was used in some, but that's the default anyway
  "no-cond-assign": "eslint",

  // Some allow empty-catch, but that's not really useful anyway
  "no-empty": "eslint",

  // Some allow in loops but I most often not saw any good use or even need
  "no-labels": "xo-typescript",

  // Typical error... even if some relax it for props
  "no-self-assign": "eslint",

  // Disabled per typescript-eslint recommendation: https://github.com/typescript-eslint/typescript-eslint/blob/e26e43ffba96f6d46198b22f1c8dd5c814db2652/docs/getting-started/linting/FAQ.md#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
  "no-undef": "xo-typescript",

  // Best list of affected globals is built into CRA
  "no-restricted-globals": "cra",

  // Good idea to prevent accidental issues
  "no-unsafe-optional-chaining": "eslint",

  // Sensible default for starters, no good reason to do otherwise as senior
  "no-use-before-define": "cra",

  // Checking classes as well in XO
  "no-useless-computed-key": "xo-typescript",

  // Really useless. Prevent on all levels.
  "no-useless-rename": "xo-typescript",

  // Sensible to be a littler stricter here as in XO
  "valid-typeof": "xo-typescript",

  // Prefer the simple-array style.
  "@typescript-eslint/array-type": "xo-typescript",

  // Nice to allow ts-expect with description
  "@typescript-eslint/ban-ts-comment": "xo-typescript",

  // Very good extension and hints of different ban types
  "@typescript-eslint/ban-types": "xo-typescript",

  // ObjectLiteralTypeAssertions is a win for sure
  "@typescript-eslint/consistent-type-assertions": "xo-typescript",

  // Allow single extends
  "@typescript-eslint/no-empty-interface": "xo-typescript",

  // Some good limitations in XO
  "@typescript-eslint/no-extraneous-class": "xo-typescript",

  // Relaxing IIFEs in XO
  "@typescript-eslint/no-floating-promises": "xo-typescript",

  // XO disables void return checks for making event handling easier, not sure
  // what an example here looks like. I guess the risk of misuse is higher than
  // this convenience benefit.
  "@typescript-eslint/no-misused-promises": "ts",

  // Allow destructuring for convenience - that's also not really an alias
  "@typescript-eslint/no-this-alias": "xo-typescript",
  "@typescript-eslint/no-unused-vars": "xo-typescript",
  "@typescript-eslint/restrict-plus-operands": "xo-typescript",
  "@typescript-eslint/restrict-template-expressions": "xo-typescript",
  "@typescript-eslint/triple-slash-reference": "xo-typescript",

  // Using basic rule config from CRA
  "jsx-a11y/alt-text": "cra",
  "jsx-a11y/anchor-has-content": "cra",
  "jsx-a11y/anchor-is-valid": "cra",
  "jsx-a11y/aria-role": "cra",
  "jsx-a11y/autocomplete-valid": "airbnb-react",
  "jsx-a11y/no-autofocus": "airbnb-react",

  // Tricky with custom components... therefore disabled
  "jsx-a11y/control-has-associated-label": "jsx",
  "jsx-a11y/heading-has-content": "jsx",
  "jsx-a11y/interactive-supports-focus": "jsx",
  "jsx-a11y/media-has-caption": "jsx",

  "no-unsafe-negation": "xo-typescript",
  eqeqeq: "cra",
  "default-case": "cra",
  "array-callback-return": "cra",

  "jsx-a11y/no-interactive-element-to-noninteractive-role": "jsx",
  "jsx-a11y/no-noninteractive-element-interactions": "jsx",
  "jsx-a11y/no-distracting-elements": "jsx",
  "jsx-a11y/no-noninteractive-tabindex": "jsx",
  "jsx-a11y/no-noninteractive-element-to-interactive-role": "jsx",
  "jsx-a11y/label-has-associated-control": "jsx",

  "react/button-has-type": "xo-react",
  "react/boolean-prop-naming": "xo-react",

  "react/display-name": "react",

  // Prop Types are legacy React. We use TS.
  "react/prop-types": "off",
  "react/default-props-match-prop-types": "off",
  "react/no-unused-prop-types": "off",

  // Legacy class-based React
  "react/sort-comp": "airbnb-react",
  "react/prefer-es6-class": "airbnb-react",
  "react/state-in-constructor": "airbnb-react",

  "react/require-default-props": "xo-react",
  "react/jsx-no-bind": "xo-react",

  "react/jsx-curly-brace-presence": "xo-react",
  "react/jsx-boolean-value": "xo-react",

  // Prefer function declarations over arrow functions for all things
  "react/function-component-definition": "airbnb-react",

  // Ignoring the case is a good idea as this might be a typo
  "react/jsx-no-duplicate-props": "xo-react",

  // Combination of airbnb-react and xo-react
  "react/jsx-no-target-blank": [
    "error",
    {
      enforceDynamicLinks: "always",
      warnOnSpreadAttributes: true,
      forms: true
    }
  ],

  // Not sure about what's the reason to allow all-caps in CRA/Airbnb
  "react/jsx-pascal-case": "xo-react",

  // Future error in React >= 16.9
  "react/jsx-no-script-url": "xo-react",

  // Nice concept to bring some harmony into prop order. Interesting that
  // this the only preset containing such a rule definition.
  "react/jsx-sort-props": "xo-react",

  // Disabled effectively everywhere except Airbnb
  "react/no-direct-mutation-state": "react",
  "react/no-string-refs": "react",

  // Mostly focused on old API design of React
  "react/no-unsafe": "react",

  // Good style, good find by XO
  "react/prefer-read-only-props": "xo-react",

  // Stricter and following the upcoming default. Fine.
  "react/jsx-key": "xo-react",

  // Practically common-sense to prevent this.
  "react/style-prop-object": "cra",

  // This unicorn rule is solved by TypeScript
  "unicorn/no-null": "xo-typescript",

  "react/static-property-placement": "xo-react",

  "jsx-a11y/no-static-element-interactions": "jsx"
}
