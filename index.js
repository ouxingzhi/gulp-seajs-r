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

  var base = '.',
      alias = {},
      paths = {},
      map = [],
      vars = {};
  if(!options) options = {};
  if(options.base){
      base = options.base;
  }
  if(options.alias){
      alias = options.alias;
  }
  if(options.paths){
      paths = options.paths;
  }
  if(options.map){
      map = options.map;
  }
  if(options.vars){
      vars = options.vars;
  }

  var cachemods = {};

  function replaceContent(content,filepath,suffix){
      var m;
      if(txtsuffix.indexOf(suffix) > -1){

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
    this.push(file);
    // tell the stream engine that we are done with this file
    if(file.contents){
        var content = replaceContent(file.contents.toString(),file.relative);
        console.log(content);
    }
    
    cb();
  };

  var onEnd = function(){
    console.log('end',through.obj.length);
  }

  // creating a stream through which each file will pass
  var stream = through.obj(each,onEnd);

  // returning the file stream
  return stream;
};

// exporting the plugin main function
module.exports = exports;