

var { watch, src, dest, parallel, series } = require('gulp');
var browserSync = require('browser-sync');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var twig = require('gulp-twig');


// Девсервер
function devServer(cb) {
  var params = {
    watch: true,
    reloadDebounce: 150,
    notify: false,
    server: { baseDir: './build' },
  };

  browserSync.create().init(params);
  cb();
}

// Сборка
function buildPages() {
    return src(['src/pages/*.twig', 'src/pages/*.html'])
    .pipe(twig())
    .pipe(dest('build/'));
}

function buildStyles() {
    return src('src/styles/*.scss')
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      cssnano()
    ]))
    .pipe(dest('build/styles/'));
}

function buildScripts() {
  return src('src/scripts/**/*.js')
    .pipe(dest('build/scripts/'));
}

function buildAssets(cb) {
    // Уберём пока картинки из общего потока
    src(['src/assets/**/*.*', '!src/assets/img/**/*.*'])
      .pipe(dest('build/assets/'));
    src('src/assets/img/**/*.*')
      .pipe(imagemin())
      .pipe(dest('build/assets/img'));
  
    // Раньше функция что-то вовзращала, теперь добавляем вместо этого искусственый колбэк
    // Это нужно, чтобы Галп понимал, когда функция отработала и мог запустить следующие задачи
    cb();
  }

function buildFonts() {
    return src('src/fonts/*.*')
      .pipe(dest('build/fonts/'));
  }
  

// Отслеживание
function watchFiles() {
  watch('src/pages/*.twig', buildPages);
  watch('src/styles/*.scss', buildStyles);
  watch('src/scripts/**/*.js', buildScripts);
  watch('src/assets/**/*.*', buildAssets);
  watch('src/fonts/*.*', buildFonts);
}


exports.default =
  parallel(
    devServer,
    series(
      parallel(buildPages, buildStyles, buildScripts, buildAssets,buildFonts),
      watchFiles
    )
  );

