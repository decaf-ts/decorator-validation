/**
 * This file is meant to Load all @GlassProject dependencies after OpenDSU
 * has been loaded to confirm no circular imports are found
 */
try {
    const path = require('path');
    const {Model, Validators, Decorators} = require(path.join(process.cwd(), "lib"));

    if (!Validators || !Decorators || !Model)
        throw new Error("could not load from lib");

    console.log("Lib Loaded after OpenDSU")
} catch (e) {
    throw (e);
}
