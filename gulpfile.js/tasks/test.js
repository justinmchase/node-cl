import gulp from 'gulp'
import cucumber from 'gulp-cucumber'

gulp.task('test', () => {
  return gulp
    .src('lib/features/**/*.feature')
    .pipe(cucumber({
      support: 'lib/features/support/world.js',
      steps: 'lib/features/steps/**/*.js',
      format: 'pretty'
    }))
})
