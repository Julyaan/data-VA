// CSV parser for node.js that handles all standard CSV parsing and 
// returns the data elements in a single 'data' event emmitter. 
// Currently the only exported function is each(filename, option),
// where filename is the file to process and options can have any 
// of the following:
//
//    strDelimiter: The string to use for delimiting data elements.
//    headers:      If the first line of the file represents headers. 
//                  Setting this will convert the translated array into
//                  an object with the headers as attributes and the
//                  values assigned. 
//    readAmount:   Number of bytes to read before parsing and processing.
//
//  重写了readmore函数，原函数调用了fs的旧接口，现在fs读文件时用buffer存储
//
//
var fs = require("fs"),
    util = require("util"),
    events = require("events"),
    iconv = require('iconv-lite');

// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
	// Check to see if the delimiter is defined. If not,
	// then default to comma.
	strDelimiter = (strDelimiter || ",");

	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp(
		(
			// Delimiters.
			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

			// Quoted fields.
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

			// Standard fields.
			"([^\"\\" + strDelimiter + "\\r\\n]*))"
		),
		"gi"
		);


	// Create an array to hold our data. Give the array
	// a default empty first row.
	var arrData = [[]];
	// Create an array to hold our individual pattern
	// matching groups.
	var arrMatches = null;
	// Keep looping over the regular expression matches
	// until we can no longer find a match.
	while (arrMatches = objPattern.exec( strData )){
		// Get the delimiter that was found.
		var strMatchedDelimiter = arrMatches[ 1 ];
		// Check to see if the given delimiter has a length
		// (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know
		// that this delimiter is a row delimiter.
		if (
			strMatchedDelimiter.length &&
			(strMatchedDelimiter != strDelimiter)
			){

			// Since we have reached a new row of data,
			// add an empty row to our data array.
			arrData.push( [] );
		}


		// Now that we have our delimiter out of the way,
		// let's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[ 2 ]){

			// We found a quoted value. When we capture
			// this value, unescape any double quotes.
			var strMatchedValue = arrMatches[ 2 ].replace(
				new RegExp( "\"\"", "g" ),
				"\""
				);

		} else {

			// We found a non-quoted value.
			var strMatchedValue = arrMatches[ 3 ];

		}


		// Now that we have our value string, let's add
		// it to the data array.
		arrData[ arrData.length - 1 ].push( strMatchedValue );
	}

	// Return the parsed data.
	return( arrData );
}

exports.each = function (filename, options) {
  options = (options || {});
  var strDelimiter = (options.strDelimiter || ",");
  var headers = null;
  var position = 0;
  var buf = new Buffer(16384); //16*1024字节 即每次处理16MB长度
    var overflow='';//存储溢出16MB的字节
  var readAmount=buf.length;
  var fd = null;
  var stream = new events.EventEmitter(); //对事件的触发和事件监听器功能的封装
  
  var emit_row = function(row) {
    var data = CSVToArray(row)[0]; 
    if (options["headers"]) {
      if (headers == null) {
        headers = data;
      } else {
        var obj = {};
        data.forEach(function(d,i) { obj[headers[i]] = d; });
        data = obj;
      }
    }
    stream.emit("data", data);
  }
  
  var readMore = function() {
      //参数说明： 1.通过fs.open()返回的文件描述符 2.数据写入的缓冲区 3.要从文件中读取的字节数 4.文件读取起始位置
    fs.read(fd, buf, 0, readAmount,position, function(err, bytesRead, buffer) {
        //回调函数参数（错误信息，读取的字节数，缓冲区对象）
      if (err)  {
        console.log("E1");
        stream.emit("error",e);
        fs.close(fd);
      } else {
          var data=buffer.slice(0, bytesRead);
          //console.log("data is :"+data);
          buffer = overflow+iconv.decode(data, 'gbk');
         // console.log("string is :"+buffer);
        position += bytesRead;
        var parts = buffer.split("\n");  //buffer中存的是文件内容，会包含若干回车
        var pl = parts.length;
        if (pl > 1) {
          for( var i = 0; i < (pl - 1); i++) {  //处理前pl-1行的内容，因为第pl行内容被截断了
            emit_row(parts[i]);
          }
            buffer = parts[pl-1];  //清空现有buffer,将被截断的pl行内容存在buffer里
        }
        if (bytesRead == readAmount) { //如果相等，说明文件的内容超出了buffer容量，再次调用readMore()
            overflow=buffer;
            readMore();
        } else {
          if (buffer.length > 0) {
            emit_row(buffer);
          }
          fs.close(fd);
          stream.emit("end")
        }
      }
    });
  };
  
  fs.open(filename, 'r', function (err, _fd) {
    if (err) {
      console.log("Could not open the file: "+filename);
    } else if (_fd) {
      fd = _fd;
      readMore();
    }
  });
    
  return stream;
};
