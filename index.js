var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'gulp-seajs-r';

var regdefine = /^\s*define\((.*)function\s*\(\s*(require)?/mg;
var regdefineparam = /\s*(["']\w+["'])\s*(?:\s*,\s*)\[/;
var regrequire = /require\(\s*([^\(\)]+)\s*\)/g;
var txtsuffix = ['txt','html','htm','tpl'];


// plugin level function (dealing with files)
function exports(options) {
  var formatPath;
  if(options && options.formatPath){
      formatPath = options.formatPath;
  }

  var cachemods = {};

  function replaceContent(content,filepath,suffix){
      var m;
      if(formatPath){
          filepath = formatPath(filepath);
      }
      if(txtsuffix.indexOf(suffix) > -1){
          content = content.replace(/^\s+|\r|\n|\s+$/g,'').replace(/>\s+</g,'><').replace(/'/mg,"\\'");
          content = 'define("'+filepath+'",\''+content+'\')'; 
      }else if(m = regdefine.exec(content)){
          
          if(!m[1] || !regdefineparam.exec(content)){
              var deps = [];
              if(m[2]){
                  content.replace(regrequire,function(a,b){
                      deps.push(b);
                  });
              }
              content = content.replace(regdefine,'define("'+filepath+'",['+deps.join(',')+'],function(require');
          }
      }
      return content;
  }

  var each = function(file, enc, cb) {

    if(file.isNull()){
      cb();
      return;
    }
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return cb();
    }


    // make sure the file goes through the next gulp plugin
    
    // tell the stream engine that we are done with this file
    var suffix = file.relative.split('.').pop();
    if(file.contents){
        var content = replaceContent(file.contents.toString(),file.relative,suffix);
        file.contents = new Buffer(content);
    }
    this.push(file);
    cb();
  };


  // creating a stream through which each file will pass
  var stream = through.obj(each);

  // returning the file stream
  return stream;
};

// exporting the plugin main function
module.exports = exports;