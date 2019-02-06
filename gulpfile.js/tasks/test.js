import gulp from 'gulp'
import cucumber from 'gulp-cucumber'

export function test() {
  return gulp
    .src('lib/features/**/*.feature')
    .pipe(cucumber({
      support: 'lib/features/support/world.js',
      steps: 'lib/features/steps/**/*.js',
      format: 'summary',
      emitErrors: false
    }))
}

gulp.task('test', test)
