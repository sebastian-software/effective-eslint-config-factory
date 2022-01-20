{
  "plugins": [
    [
      "@babel/transform-runtime",
      {
        "corejs": 3
      }
    ]
  ],
  "presets": [
    [
      "@babel/env",
      {
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ],
    [
      "@babel/typescript",
      {
        "allExtensions": true,
        "isTSX": true
      }
    ]
  ]
}
