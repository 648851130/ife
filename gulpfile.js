var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync');
var autoprefixer = require('gulp-autoprefixer');
var now_task = process.argv[4];

gulp.task('serve',['less','lessWatch'],function(){
    var opts = {
        server: {
            baseDir: './' + now_task
        },
        ghostMode: { // these are the defaults t,f,t,t
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'info',
        logPrefix: 'browserSync',
        notify: true,
        reloadDelay: 0 //1000
    };
    browserSync.init(opts);
});

//less-->css
gulp.task('less', function () {
    return gulp.src('./'+now_task+'/*.less')
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 10 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./'+now_task+'/'));
});

gulp.task('lessWatch', function () {
    gulp.watch('./'+now_task+'/*.less', ['less']);
});
