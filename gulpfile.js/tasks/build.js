
import gulp from 'gulp'
import babel from 'gulp-babel'
import sourcemaps from 'gulp-sourcemaps'

function _content({ app, ext = '.*' }) {
  function fn () {
    return gulp
      .src(`${app}/**/*${ext}`)
      .pipe(gulp.dest(`build/${app}`))
  }
  fn.displayName = `content-${app}`
  return fn
}

function _build({ app }) {
  function fn () {
    return gulp
      .src(`${app}/**/*.js`)
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(`build/${app}`))
  }

  fn.displayName = `build-${app}`
  return fn
}

export const build = gulp.parallel([
  _build({ app: 'lib' }),
  _build({ app: 'features' }),
  _content({ app: 'features', ext: '.feature' }),
  _content({ app: 'features/targets', ext: '.yml' }),
  _content({ app: 'examples' })
])

gulp.task('build', build)
