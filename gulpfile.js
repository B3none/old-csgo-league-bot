const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const fs = require('fs');

const dataDirectory = './app/data/';
const dataFiles = [
  'afk_channel.json',
  'matches.json',
  'queue.json',
  'team_channels.json',
  'text_channels.json',
  'voice_channels.json',
];

gulp.task('default', () => {
  if (!fs.existsSync(dataDirectory)){
    fs.mkdirSync(dataDirectory);
  }

  dataFiles.map(dataFile => {
    let file = dataDirectory + dataFile;
    if (!fs.existsSync(file)) {
      fs.writeFile(file, "{}", err => {
        if (err) {
          console.error(err);
        }
      });
    }
  });

  nodemon({
    script: 'src/index.js',
    watch: ['src/*/**', 'src/*', 'app/config.json'],
    ext: 'js'
  });
});