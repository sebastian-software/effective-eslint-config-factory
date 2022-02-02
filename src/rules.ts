import { SourcePriorityTable } from "./types"

export const ruleBasedSourcePriority: SourcePriorityTable = {
  "accessor-pairs": "kentdodds", // XO enforces classes as well which seems like a so-so idea as one might offer get-only accessors
  "array-callback-return": "cra", // common in most presets
  "camelcase": "xo", // XO enforces camelCase properties, style heavy and controversial, but good thing to follow in 95% of code.
  complexity: "kentdodds", // configured to 20, Kent only
  "default-case": "cra", // also: kentdodds, allows exception in CRA
  eqeqeq: "cra", // smart mode enabled in CRA
  "func-name-matching": "kentdodds", // enabled but without property descriptor (rarely used)
  "func-names": "kentdodds", // prefer better debug-ability
  "max-depth": "kentdodds", // configured to 4, Kent only
  "max-nested-callbacks": "xo", // in Kent and XO, stricter in XO
  "max-params": "xo", // in Kent and XO, stricter in XO
  "max-statements-per-line": "xo", // in Kent and XO, Kent defines a max=1 which is already the default
  "new-cap": "kentdodds", // in Kent and XO, XO defines options which are already the default
  "no-cond-assign": "eslint", // as in most presets, except Kent
  "no-empty": "eslint", // as in most presets
  "no-labels": "xo", // same for Kent, without exceptions for loops (enabled in CRA... for whatever reason)
  "no-restricted-globals": "cra", // best richest set from CRA, others only enable it, without config
  "no-return-assign": "kentdodds", // same in XO, otherwise unconfigured
  "no-self-assign": "eslint", // effectively same value in all presets
  "no-undef": "xo", // typeof is enabled in XO only, which is a valid use case
  "no-unsafe-negation": "eslint", // explicit is better, as in most presets
  "no-unsafe-optional-chaining": "xo", // like in most presets, but only XO prevent arithmetic operations
  "no-use-before-define": "off", // disabled in most presets (CRA only)
  "no-useless-computed-key": "xo", // like in most presets, but only XO extends to classes
  "no-useless-rename": "xo", // as in most presets
  "no-void": "xo-typescript", // use undefined seems more accessible like in XO
  "no-warning-comments": "off", // off in most presets, controversial, might help to mark future tasks as a valid reason
  "object-shorthand": "kentdodds", // properties only for Kent, XO enabled for all things incl. functions which might be hard to read, consistent-as-needed would also be a good candidate
  "one-var": "xo", // prefer readability, controversial as mainly formatting related, but also helps code accessibility
  "prefer-arrow-callback": "xo", // Kent and XO effectively idential, both allow named functions
  "prefer-const": "xo", // XO has fine tuned setting for destructing
  "strict": "kentdodds", // source format is ESM in most code bases, still useful as auto-detected
  "valid-typeof": "eslint", // common in most presets

  // "@typescript-eslint/ban-types": "xo-typescript", // best collection of types to ban is in XO
  // "@typescript-eslint/ban-ts-comment": "xo-typescript", // XO allows exceptions which are a good idea
  // "@typescript-eslint/array-type": "xo-typescript", // Prefer simple arrays as in XO

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
  "react/no-did-mount-set-state": "off",

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
