import gulp from 'gulp';
import cleanCSS from 'gulp-clean-css';
import plugins from 'gulp-load-plugins';
import yaml from 'js-yaml';
import fs from 'fs';

const $ = plugins();

const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();

function loadConfig() {
  let ymlFile = fs.readFileSync('gulp.config.yml', 'utf8');
  return yaml.load(ymlFile);
}

function sass() {
  return gulp.src('assets/themes/wix/scss/style.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: "assets/themes/wix/scss/**/*.scss"
    }))
    .on('error', $.sass.logError)
    .pipe($.autoprefixer({
      browsers: COMPATIBILITY
    }))
    .pipe(cleanCSS({debug: true}, function(details) {
      console.log(details.name + ': ' + details.stats.originalSize);
      console.log(details.name + ': ' + details.stats.minifiedSize);
    }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('assets/themes/wix/css'));
}

function watch() {
  //gulp.watch(PATHS.assets, copy);
  gulp.watch('assets/themes/wix/scss/**/*.scss').on('change', gulp.series(sass));
  //gulp.watch('src/assets/js/**/*.js').on('change', gulp.series(javascript, browser.reload));
  //gulp.watch('src/assets/img/**/*').on('change', gulp.series(images, browser.reload));
  // gulp.watch('src/styleguide/**').on('change', gulp.series(styleGuide, browser.reload));
}

gulp.task('css', sass);

gulp.task('watch', watch);
