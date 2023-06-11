
## Building

Build settings in the package.json file, need to be correct 
make the build correct with both ES Module and CommonJs  
(including correct 'typings' for TypeScript)


### Es Modules vs CommonJS

The 'type' in  package.json most be set to 'module' to allow "normal" imports to work.

But when `"type":"module"` is set, the `"exports"` field most also be set, with both
 CommonJS (`"require"`) and Es Modile (`"default"`) including the `"types"` field for TypeScript to work.


See [typescripts doc on esm-node](https://www.typescriptlang.org/docs/handbook/esm-node.html) for more info.

