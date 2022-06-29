import { SourcePriorityTable } from "./types"

export const ruleBasedSourcePriority: SourcePriorityTable = {
  "accessor-pairs": {
    use: "kentdodds",
    comment:
      "Class member checks are enabled by default. Effectively both XO and Kent are identical."
  },
  "array-callback-return": { use: "cra", comment: "Common in most presets" },
  camelcase: {
    use: "xo-typescript",
    comment:
      "XO enforces camelCase properties, style heavy and controversial, but good thing to follow in 95% of code."
  },
  complexity: {
    use: "xo",
    comment:
      "Configured to 20 (default), Kent/XO only, feels like a good default."
  },
  "default-case": {
    use: "cra",
    comment: "Allows exception in CRA - probably a good idea."
  },
  eqeqeq: { use: "cra", comment: "Smart mode enabled in CRA" },
  "func-name-matching": {
    use: "kentdodds",
    comment: "Enabled but without property descriptor (rarely used)"
  },
  "func-names": {
    use: "kentdodds",
    comment: "Prefer better debug-ability when enabled"
  },
  "max-depth": {
    use: "xo",
    comment: "Configured to 4 (default), Kent/XO effectively identical"
  },
  "max-nested-callbacks": {
    use: "xo",
    comment: "In Kent (7) and XO (4), stricter in XO (4). Default is 10."
  },
  "max-params": {
    use: "xo",
    comment: "In Kent (7) and XO (4), stricter in XO (4). Default is 10."
  },
  "max-statements-per-line": {
    use: "xo",
    comment: "In Kent and XO, Kent defines a max=1 which is already the default"
  },
  "new-cap": {
    use: "kentdodds",
    comment: "In Kent and XO, XO defines options which are already the default"
  },
  "no-cond-assign": {
    use: "eslint",
    comment: "Effectively identical in most presets."
  },
  "no-empty": {
    use: "eslint",
    comment: "Effectively identical in most presets."
  },
  "no-labels": {
    use: "xo",
    comment:
      "Same for Kent, without exceptions for loops (enabled in CRA... for whatever reason)."
  },
  "no-restricted-globals": {
    use: "cra",
    comment:
      "Richest collection in CRA, others only enable it, without any config."
  },
  "no-return-assign": {
    use: "kentdodds",
    comment: "Same in XO, otherwise unconfigured"
  },
  "no-self-assign": {
    use: "eslint",
    comment: "Effectively same value in all presets"
  },
  "no-undef": {
    use: "xo",
    comment: "Typeof is enabled in XO only, which is a valid use case"
  },
  "no-unsafe-negation": {
    use: "eslint",
    comment: "Explicit is better, as in most presets"
  },
  "no-unsafe-optional-chaining": {
    use: "xo",
    comment: "Like in most presets, but only XO prevent arithmetic operations"
  },
  //"no-use-before-define":{use:"off", comment: "Disabled in most presets (CRA only)"},
  "no-useless-computed-key": {
    use: "xo",
    comment: "Like in most presets, but only XO extends to classes"
  },
  "no-useless-rename": { use: "xo", comment: "As in most presets" },
  "no-void": {
    use: "xo-typescript",
    comment: "Use undefined seems more accessible like in XO"
  },
  "no-warning-comments": {
    use: "off",
    comment:
      "Off in most presets, controversial, might help to mark future tasks as a valid reason"
  },
  "object-shorthand": {
    use: "kentdodds",
    comment:
      "Properties only for Kent, XO enabled for all things incl. functions which might be hard to read, consistent-as-needed would also be a good candidate"
  },
  "one-var": {
    use: "xo",
    comment:
      "Prefer readability, controversial as mainly formatting related, but also helps code accessibility"
  },
  "prefer-arrow-callback": {
    use: "xo",
    comment: "Kent and XO effectively idential, both allow named functions"
  },
  "prefer-const": {
    use: "xo",
    comment: "XO has fine tuned setting for destructing"
  },
  strict: {
    use: "kentdodds",
    comment:
      "Source format is ESM in most code bases, still useful as auto-detected"
  },
  "valid-typeof": { use: "eslint", comment: "Common in most presets" },

  "@typescript-eslint/ban-ts-comment": {
    use: "xo-typescript",
    comment: "XO allows exceptions which are a good idea"
  },
  "@typescript-eslint/ban-types": {
    use: "xo-typescript",
    comment: "Best collection of types to ban is in XO"
  },
  "@typescript-eslint/no-empty-interface": {
    use: "xo-typescript",
    comment: ""
  },
  "@typescript-eslint/no-extraneous-class": {
    use: "xo-typescript",
    comment: ""
  },
  "@typescript-eslint/no-floating-promises": {
    use: "xo-typescript",
    comment: ""
  },
  "@typescript-eslint/no-misused-promises": {
    use: "xo-typescript",
    comment: ""
  },
  "@typescript-eslint/no-this-alias": { use: "xo-typescript", comment: "" },
  "@typescript-eslint/no-throw-literal": { use: "xo-typescript", comment: "" },
  // "@typescript-eslint/no-use-before-define":{use:"off", comment: "Not that relevant in todays world"},
  "@typescript-eslint/restrict-plus-operands": {
    use: "xo-typescript",
    comment: ""
  },
  "@typescript-eslint/restrict-template-expressions": {
    use: "xo-typescript",
    comment: ""
  },
  "@typescript-eslint/triple-slash-reference": {
    use: "ts",
    comment: "Effectively identical in all presets"
  },
  "@typescript-eslint/no-unused-vars": {
    use: "kentdodds",
    comment: "Seemingly good relaxation of the standard behavior."
  },
  "@typescript-eslint/unified-signatures": {
    use: "xo-typescript",
    comment: "Allow relaxed behavior offered by XO."
  },

  "import/named": {
    use: "import",
    comment: "Follow the plugin hint for usage in TS projects"
  },
  "import/namespace": {
    use: "xo-typescript",
    comment: "Should be solved by TS compiler already"
  },
  "import/no-duplicates": {
    use: "xo-typescript",
    comment: "Solved by @typescript-eslint/no-duplicate-imports already!"
  },

  "jsx-a11y/alt-text": {
    use: "jsx",
    comment: "Effectively identical in all presets"
  },
  "jsx-a11y/anchor-has-content": {
    use: "jsx",
    comment: "Effectively identical in all presets"
  },
  "jsx-a11y/anchor-is-valid": {
    use: "cra",
    comment: "Slightly adjusted version in CRA seems good"
  },
  "jsx-a11y/aria-role": {
    use: "cra",
    comment: "Slightly adjusted version in CRA seems good"
  },
  "jsx-a11y/control-has-associated-label": {
    use: "off",
    comment: "Disabled in JSX-A11Y, too, tricky with custom components"
  },
  "jsx-a11y/heading-has-content": {
    use: "jsx",
    comment: "Effectively identical in all presets"
  },
  "jsx-a11y/interactive-supports-focus": {
    use: "jsx",
    comment: "Follow plugin author recommendation"
  },
  "jsx-a11y/label-has-associated-control": {
    use: "off",
    comment: "Disabled in CRA, too, tricky with custom components"
  },
  "jsx-a11y/media-has-caption": {
    use: "jsx",
    comment: "Effectively identical in all presets"
  },
  "jsx-a11y/no-autofocus": {
    use: "off",
    comment: "Disabled in CRA, too. Not that relevant I guess."
  },
  "jsx-a11y/no-distracting-elements": {
    use: "jsx",
    comment: "Effectively identical in all presets"
  },
  "jsx-a11y/no-interactive-element-to-noninteractive-role": {
    use: "jsx",
    comment: "Follow plugin author recommendation"
  },
  "jsx-a11y/no-noninteractive-element-interactions": {
    use: "jsx",
    comment: "Follow plugin author recommendation"
  },
  "jsx-a11y/no-noninteractive-element-to-interactive-role": {
    use: "jsx",
    comment: "Follow plugin author recommendation"
  },
  "jsx-a11y/no-noninteractive-tabindex": {
    use: "jsx",
    comment: "Follow plugin author recommendation"
  },
  "jsx-a11y/no-static-element-interactions": {
    use: "jsx",
    comment: "Follow plugin author recommendation"
  },

  "react/button-has-type": {
    use: "xo-react",
    comment: "Effectively identical in all presets"
  },
  "react/function-component-definition": {
    use: "airbnb-react",
    comment: "Old school: prefer real inspectable functions"
  },
  "react/default-props-match-prop-types": {
    use: "off",
    comment: "TS mode: Do not care about prop-types"
  },
  "react/jsx-boolean-value": {
    use: "xo-react",
    comment:
      "Effectively identical in all presets: the default value of this option is 'never'"
  },
  "react/jsx-curly-brace-presence": {
    use: "xo-react",
    comment: "Reduce clutter, formatting related"
  },
  "react/jsx-filename-extension": {
    use: "off",
    comment:
      "None of them really makes sense. It has to be .tsx in our cases, but that's enforced by TSC already I guess."
  },
  "react/jsx-key": {
    use: "xo-react",
    comment: "Again a fine tuned variant over the default ones in other presets"
  },
  "react/jsx-no-bind": {
    use: "xo-react",
    comment:
      "Generally disallowed but supports arrow functions (for convenience)"
  },
  "react/jsx-no-duplicate-props": {
    use: "xo-react",
    comment:
      "Wrong casing is typically a typo... should be checked by TS anyway... but the case-related issue is valid."
  },
  "react/jsx-no-script-url": {
    use: "off",
    comment:
      "Old style stuff... no place in modern FE development. Natively prevented by ReactJS nowadays."
  },
  "react/jsx-no-target-blank": {
    use: "xo-react",
    comment: "Fine-tuned in XO to check spreads as well"
  },
  "react/jsx-pascal-case": {
    use: "kentdodds",
    comment:
      "Disabling all-caps like in XO. Formatting related. Wonder why one would use it e.g. `URL`?"
  },
  "react/no-string-refs": {
    use: "xo-react",
    comment: "Fine-tuned in XO to prevent template strings as well"
  },
  "react/no-unsafe": {
    use: "kentdodds",
    comment:
      "Also disabled in strict-mode which should be standard for new developments"
  },
  "react/no-unstable-nested-components": {
    use: "kentdodds",
    comment:
      "That's indeed looking like a common issue in code bases. Good find."
  },
  "react/no-unused-prop-types": {
    use: "off",
    comment: "TS mode: Do not care about prop-types"
  },
  "react/prop-types": {
    use: "off",
    comment: "TS mode: Do not care about prop-types"
  },
  "react/require-default-props": {
    use: "off",
    comment: "TS mode: Do not care about prop-types"
  },
  "react/state-in-constructor": {
    use: "xo-react",
    comment:
      "Traditional classes, but pretty tricky if not detected... therefor enabled"
  },
  "react/static-property-placement": {
    use: "off",
    comment:
      "Relevant for traditional classes only... edge case in todays code bases"
  },
  "react/style-prop-object": {
    use: "cra",
    comment:
      "XO is right about FormattedNumber, but this might change in React-Intl as well... or one uses a different lib."
  },

  "unicorn/no-null": { use: "unicorn", comment: "" }
}
