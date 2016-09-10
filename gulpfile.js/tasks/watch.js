import gulp from 'gulp'
import runSequence from 'run-sequence'

gulp.task('watch', () => {
  gulp.watch(['lib/**/*', 'examples/**/*', 'gulpfile.js/**/*'], ['test'])
  runSequence(['test'])
})
