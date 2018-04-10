const gulp = require('gulp');
const babel = require('gulp-babel');
const fs = require('fs');
const srcModule = 'src/main.js';
const distModule = 'dist';

gulp.task('build', () =>
	gulp.src('src/**/*.js')
		.pipe(babel({
			presets: ['env']
		}))
		.pipe(gulp.dest(distModule))
);