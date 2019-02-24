import gulp from 'gulp'
import uncache from 'gulp-require-uncache'
import { test } from './test'
import { build } from './build'

function clearCache () {
  async function fn () {
    const src = [
      'build/features/**/*.js',
      'build/lib/**/*.js'
    ]
    return gulp
      .src(src)
      .pipe(uncache())
  }
  fn.displayName = 'clear-cache'
  return fn
}

function watch () {
  const src = [
    'lib/**/*',
    'features/**/*',
    'examples/**/*'
  ]  
  const steps = gulp.series(
    build,
    clearCache(),
    test({ watch: true })
  )
  gulp.watch(src, steps)
  return steps()
}

gulp.task('watch', watch)
