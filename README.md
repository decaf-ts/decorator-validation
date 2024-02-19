[![Banner](./assets/banner.png)](https://www.glass-h2020.eu/)

![Licence](https://img.shields.io/github/license/TiagoVenceslau/decorator-validation.svg)
![GitHub language count](https://img.shields.io/github/languages/count/TiagoVenceslau/decorator-validation?style=plastic)
![GitHub top language](https://img.shields.io/github/languages/top/TiagoVenceslau/decorator-validation?style=plastic)
[![CodeQL](https://github.com/starnowski/posmulten/workflows/CodeQL/badge.svg)](https://github.com/TiagoVenceslau/decorator-validation/actions?query=workflow%3ACodeQL)


#### Status
[![Build](https://gitlab.com/glass-project1/wallet/decorator-validation/badges/master/pipeline.svg)](http://www.pdmfc.com)

![coverage](https://gitlab.com/glass-project1/wallet/decorator-validation/badges/master/coverage.svg?job=coverage)

![Main](https://github.com/TiagoVenceslau/decorator-validation/actions/workflows/main.yml/badge.svg)
![Docs](https://github.com/TiagoVenceslau/decorator-validation/actions/workflows/docs.yml/badge.svg)



## Simple Model Validation Engine

### Decorator based

Simple implementation of a Typescript decorator based validation system.

Meant to be easily extended, customized and integrated with the browser's input validation mechanisms

Provides access to common features in other languages:
 - Model serialization/deserialization;
 - Model Hashing;
 - Model Equality;
 - TODO: Model Deep Cloning



### Repository Structure

```
decorator-validation
│
│   .gitignore              <-- Defines files ignored to git
│   .gitlab-ci.yml          <-- GitLab CI/CD config file
│   gulpfile.js             <-- Gulp build scripts. used in the 'build' and 'build:prod' npm scripts
│   jest.config.js          <-- Tests Configuration file
│   jsdocs.json             <-- Documentation generation configuration file
│   LICENCE.md              <-- Licence disclamer
│   nodemon.json            <-- Nodemon config file (allows to live test ts files)
│   package.json
│   package-lock.json
│   README.md               <-- Readme File dynamically compiled from 'workdocs' via the 'docs' npm script
│   tsconfig.json           <-- Typescript config file. Is overriden in 'gulpfile.js' 
│
└───bin
│   │   tag_release.sh      <-- Script to help with releases
│   
└───docs
│   │   ...                 <-- Dinamically generated folder, containing the compiled documentation for this repository. generated via the 'docs' npm script
│   
└───src
│   │   ...                 <-- Source code for this repository
│   
└───tests
│   │   ...                 <-- Test sources for this repository
│   
└───workdocs                <-- Folder with all pre-compiled documentation
|    │   ...
|    │   Readme.md           <-- Entry point to the README.md   
|
└───dist
|    |  ...                 <-- Dinamically generated folder containing the bundles for distribution
|
└───lib
    |   ...                 <-- Dinamically generated folder containing the compiled code
```

### Repository Languages

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![ShellScript](https://img.shields.io/badge/Shell_Script-121011?style=for-the-badge&logo=gnu-bash&logoColor=white)


### Related


### Social

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://pt.linkedin.com/in/tiagovenceslau)
