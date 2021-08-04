const gulp = require('gulp');
const {src, dest, series, parallel} = gulp;
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

const rename = require('gulp-rename');


function compile(){
    const tsProject = ts.createProject('tsconfig.json');
    return src('src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(dest('build/'));
}


function exportES5() {
        src('build/**/*.js')
        .pipe(babel({
            presets: ['@babel/preset-env', {
                targets: "defaults"
            }],
        }))
        // .pipe(uglify())
        // .pipe(rename({ extname: 'min.js' }))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/'));
}

function exportModules() {
    return src('build/**/*.js')
        .pipe(babel({
            presets: ['@babel/preset-env', {
                targets: {"esmodules": true}
            }],
        }))
        // .pipe(uglify())
        .pipe(rename({ extname: 'esm.js' }))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/esm/'));
}

function exportES2017() {
    return src('build/**/*.js')
        .pipe(babel({
            presets: ['@babel/preset-es2017'],
        }))
        // .pipe(uglify())
        .pipe(rename({ extname: 'es2017.js' }))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/es2017/'));
}


exports.default = series(compile, exportES5, exportModules);
