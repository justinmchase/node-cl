import gulp from 'gulp'
import { test } from './test'

function watch () {
  gulp.watch(['lib/**/*', 'examples/**/*', 'gulpfile.js/**/*'], test)
  return test()
}

gulp.task('watch', watch)
