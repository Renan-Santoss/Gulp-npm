// Adiciona os modulos intalados
const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer").default;
const browserSync = require("browser-sync").create();
const concat = require("gulp-concat");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");

// Função para compilar o SASS e adicionar prefixos automaticamente
function styles() {
  return src(["css/scss/**/*.scss", "!css/scss/**/_*.scss"])
    .pipe(sass({ style: "compressed" }).on("error", sass.logError))
    .pipe(autoprefixer({ overrideBrowserslist: ["last 2 versions"] }))
    .pipe(dest("css/"))
    .pipe(browserSync.stream());
}

function serve(done) {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  }, done);
}

function watchFiles() {
  watch("css/scss/**/*.scss", styles);
  watch("js/main/**/*.js", mainJS);
  watch("js/plugins/**/*.js", pluginsJS);
  watch("js/main.js").on("change", browserSync.reload);
  watch("*.html").on("change", browserSync.reload);
}

function mainJS() {
  return src("js/main/**/*.js")
    .pipe(
      babel({
        presets: [["@babel/preset-env", { targets: { ie: "11" } }]],
      }),
    )
    .pipe(uglify())
    .pipe(concat("main.js"))
    .pipe(dest("js/"))
    .pipe(browserSync.stream());
}

function pluginsJS() {
  return src([
      "node_modules/jquery/dist/jquery.min.js",
      "node_modules/moment/min/moment.min.js",
      "js/plugins/*.js",
    ])
    .pipe(concat("plugins.js"))
    .pipe(dest("js/"))
    .pipe(browserSync.stream());
}

const build = parallel(styles, mainJS, pluginsJS);

exports.styles = styles;
exports.mainJS = mainJS;
exports.pluginsJS = pluginsJS;
exports.build = build;
exports.watch = watchFiles;
exports.default = series(build, parallel(serve, watchFiles));
