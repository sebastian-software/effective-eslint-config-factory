# _@Effective / ESLint Factory_

[![Sponsored by][sponsor-img]][sponsor] [![Version][npm-version-img]][npm] [![Downloads][npm-downloads-img]][npm] [![Build Status][github-img]][github]

_@Effective / ESLint Factory_ is used to create an efficient flat ESLint config (no extends at runtime) based on the established configs and plugins from Airbnb, Facebook (CRA, React, React Hooks), Sindre Sorhus (XO) and many more... A configuration to bundle everything important of these presets in one preset. Based on TypeScript. With support for Jest. And with a special extended set for React development.

[sponsor]: https://www.sebastian-software.de
[sponsor-img]: https://badgen.net/badge/Sponsored%20by/Sebastian%20Software/c41e54
[npm]: https://www.npmjs.com/package/@effective/eslint-config-factory
[npm-downloads-img]: https://badgen.net/npm/dm/@effective/eslint-config-factory
[npm-version-img]: https://badgen.net/npm/v/@effective/eslint-config-factory
[github]: https://github.com/sebastian-software/effective-eslint-config-factory/actions
[github-img]: https://badgen.net/github/status/sebastian-software/effective-eslint-config-factory?label=tests&icon=github

## Installation

### NPM

```console
$ npm install @effective/eslint-config-factory
```

### Yarn

```console
$ yarn add @effective/eslint-config-factory
```


## Topic specific Linting Plugins

These plugins are not included as they are often focussed on a very narrow scope and could be easily added locally where needed:

- [MDX](https://www.npmjs.com/package/eslint-plugin-mdx)
- [GraphQL](https://www.npmjs.com/package/@graphql-eslint/eslint-plugin)
- [Cypress](https://www.npmjs.com/package/eslint-plugin-cypress)

Install these and follow their recommended settings if required.

## License

[Apache License; Version 2.0, January 2004](http://www.apache.org/licenses/LICENSE-2.0)

## Copyright

<img src="https://cdn.rawgit.com/sebastian-software/sebastian-software-brand/0d4ec9d6/sebastiansoftware-en.svg" alt="Logo of Sebastian Software GmbH, Mainz, Germany" width="460" height="160"/>

Copyright 2022<br/>[Sebastian Software GmbH](https://www.sebastian-software.de)
