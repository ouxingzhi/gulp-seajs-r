var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'gulp-seajs-r';

// plugin level function (dealing with files)
function exports(options) {

  var base = '',
      alias = {},
      paths = {},
      map = [],
      vars = {};
  if(!options) options = {};
  if(options.base){
      base = options.base;
  }
  if(opitons.alias){
      alias = options.alias;
  }
  if(opitons.paths){
      paths = options.paths;
  }
  if(options.map){
      map = options.map;
  }
  if(options.vars){
      vars = options.vars;
  }

  var onStart = function(file, enc, cb) {

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
    console.log(file.relative)
    cb();
  };

  var onEnd = function(){
    console.log('end',through.obj.length);
  }

  // creating a stream through which each file will pass
  var stream = through.obj(onStart,onEnd);

  // returning the file stream
  return stream;
};

// exporting the plugin main function
module.exports = exports;