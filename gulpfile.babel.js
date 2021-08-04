const gulp = require('gulp');
const {src, dest, series, parallel} = gulp;
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require('gulp-rename');

const tsProject = ts.createProject('tsconfig.json');

function exportModules() {
    return src('src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(babel({
            presets: [['@babel/preset-env', {
                targets: {"esmodules": true}
            }]]
        }))
        // .pipe(uglify())
        .pipe(rename({ extname: '.esm.js' }))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/esm/'));
}

function exportDefault() {
    return src('src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(babel({
            presets: [
                [
                    "@babel/env",
                    {

                        "useBuiltIns": "usage",
                        "corejs": "core-js@3"
                    }
                ]
            ]
        }))
        // .pipe(uglify())
        .pipe(rename({ extname: '.js' }))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/'));
}

// exports.default = function() {
//     return src('src/**/*.ts')
//         .pipe(sourcemaps.init())
//         .pipe(tsProject())
//         .pipe(babel({
//             presets: [['@babel/preset-env', {
//                 targets: "defaults"
//             }]],
//         }))
//         // .pipe(uglify())
//         // .pipe(rename({ extname: '.min.js' }))
//         .pipe(sourcemaps.write())
//         .pipe(dest('build/'));
// }


exports.default = exportDefault;