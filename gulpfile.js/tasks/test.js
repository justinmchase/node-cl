import gulp from 'gulp'
import cucumber from 'gulp-cucumber'

export function test() {
  return gulp
    .src('features/**/*.feature')
    .pipe(cucumber({
      support: 'features/support/world.js',
      steps: 'features/steps/**/*.js',
      format: 'summary',
      emitErrors: false
    }))
}

gulp.task('test', test)
