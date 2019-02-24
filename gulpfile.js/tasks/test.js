import gulp from 'gulp'
import cucumber from 'gulp-cucumber'

export function test({ watch = false }) {
  function fn () {
    return gulp
      .src('features/**/*.feature')
      .pipe(cucumber({
        support: 'build/features/support/world.js',
        steps: 'build/features/steps/**/*.js',
        format: 'summary',
        emitErrors: !watch
      }))
  }
  fn.displayName = 'test-features'
  return fn
}

gulp.task('test', test)
