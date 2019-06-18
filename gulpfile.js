const gulp = require('gulp');
const nodemon = require('gulp-nodemon');

gulp.task('default', () =>
  nodemon({
    exec: 'node --inspect',
    script: 'src/index.js',
    watch: ['src/*/**', 'src/*', 'app/config.json'],
    ext: 'js'
  })
);