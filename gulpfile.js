const gulp = require('gulp');
const nodemon = require('gulp-nodemon');

gulp.task('default', () =>
  nodemon({
    script: 'src/index.js',
    watch: ['src/*/**', 'src/*'],
    ext: 'js'
  })
);