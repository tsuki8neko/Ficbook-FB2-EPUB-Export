// ==UserScript==
// @name           Ficbook Exporter — FB2, EPUB, TXT and PDF
// @name:ru        Скачивание книг с Фикбука в FB2, EPUB, TXT и PDF
// @name:en        Ficbook Exporter — FB2, EPUB, TXT and PDF
// @namespace      http://tampermonkey.net/
// @version        1.10.0
// @build          2026-10-03 09:23
// @description    Export Ficbook works to FB2, EPUB, TXT and PDF with embedded covers
// @description:en Export Ficbook works to FB2, EPUB, TXT and PDF with embedded covers
// @description:ru Экспорт произведений Фикбука в FB2, EPUB, TXT и PDF со встроенными обложками
// @author         tsuki8neko
// @match          https://ficbook.net/readfic/*
// @match          https://ficbook.net/authors/*
// @match          https://ficbook.net/collections/*
// @match          https://ficbook.net/series/*
// @grant          GM_xmlhttpRequest
// @connect        ficbook.net
// @connect        *.ficbook.net
// @connect        assets.teinon.net
// @connect        *.teinon.net
// @connect        cdnjs.cloudflare.com
// @connect        cdn.jsdelivr.net
// @connect        unpkg.com
// @license        Apache-2.0
// @updateURL      https://raw.githubusercontent.com/tsuki8neko/Ficbook-FB2-EPUB-Export/master/ficbook-export.user.js
// @downloadURL    https://raw.githubusercontent.com/tsuki8neko/Ficbook-FB2-EPUB-Export/master/ficbook-export.user.js
// ==/UserScript==

/******/ var __webpack_modules__ = ({

/***/ 710
(module, __unused_webpack_exports, __webpack_require__) {

/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
*/

!function(e){if(true)module.exports=e();else // removed by dead control flow
{}}(function(){return function s(a,o,h){function u(r,e){if(!o[r]){if(!a[r]){var t=undefined;if(!e&&t)return require(r,!0);if(l)return l(r,!0);var n=new Error("Cannot find module '"+r+"'");throw n.code="MODULE_NOT_FOUND",n}var i=o[r]={exports:{}};a[r][0].call(i.exports,function(e){var t=a[r][1][e];return u(t||e)},i,i.exports,s,a,o,h)}return o[r].exports}for(var l=undefined,e=0;e<h.length;e++)u(h[e]);return u}({1:[function(e,t,r){"use strict";var d=e("./utils"),c=e("./support"),p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";r.encode=function(e){for(var t,r,n,i,s,a,o,h=[],u=0,l=e.length,f=l,c="string"!==d.getTypeOf(e);u<e.length;)f=l-u,n=c?(t=e[u++],r=u<l?e[u++]:0,u<l?e[u++]:0):(t=e.charCodeAt(u++),r=u<l?e.charCodeAt(u++):0,u<l?e.charCodeAt(u++):0),i=t>>2,s=(3&t)<<4|r>>4,a=1<f?(15&r)<<2|n>>6:64,o=2<f?63&n:64,h.push(p.charAt(i)+p.charAt(s)+p.charAt(a)+p.charAt(o));return h.join("")},r.decode=function(e){var t,r,n,i,s,a,o=0,h=0,u="data:";if(e.substr(0,u.length)===u)throw new Error("Invalid base64 input, it looks like a data url.");var l,f=3*(e=e.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(e.charAt(e.length-1)===p.charAt(64)&&f--,e.charAt(e.length-2)===p.charAt(64)&&f--,f%1!=0)throw new Error("Invalid base64 input, bad content length.");for(l=c.uint8array?new Uint8Array(0|f):new Array(0|f);o<e.length;)t=p.indexOf(e.charAt(o++))<<2|(i=p.indexOf(e.charAt(o++)))>>4,r=(15&i)<<4|(s=p.indexOf(e.charAt(o++)))>>2,n=(3&s)<<6|(a=p.indexOf(e.charAt(o++))),l[h++]=t,64!==s&&(l[h++]=r),64!==a&&(l[h++]=n);return l}},{"./support":30,"./utils":32}],2:[function(e,t,r){"use strict";var n=e("./external"),i=e("./stream/DataWorker"),s=e("./stream/Crc32Probe"),a=e("./stream/DataLengthProbe");function o(e,t,r,n,i){this.compressedSize=e,this.uncompressedSize=t,this.crc32=r,this.compression=n,this.compressedContent=i}o.prototype={getContentWorker:function(){var e=new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")),t=this;return e.on("end",function(){if(this.streamInfo.data_length!==t.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),e},getCompressedWorker:function(){return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},o.createWorkerFrom=function(e,t,r){return e.pipe(new s).pipe(new a("uncompressedSize")).pipe(t.compressWorker(r)).pipe(new a("compressedSize")).withStreamInfo("compression",t)},t.exports=o},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(e,t,r){"use strict";var n=e("./stream/GenericWorker");r.STORE={magic:"\0\0",compressWorker:function(){return new n("STORE compression")},uncompressWorker:function(){return new n("STORE decompression")}},r.DEFLATE=e("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(e,t,r){"use strict";var n=e("./utils");var o=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t){return void 0!==e&&e.length?"string"!==n.getTypeOf(e)?function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t[a])];return-1^e}(0|t,e,e.length,0):function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t.charCodeAt(a))];return-1^e}(0|t,e,e.length,0):0}},{"./utils":32}],5:[function(e,t,r){"use strict";r.base64=!1,r.binary=!1,r.dir=!1,r.createFolders=!0,r.date=null,r.compression=null,r.compressionOptions=null,r.comment=null,r.unixPermissions=null,r.dosPermissions=null},{}],6:[function(e,t,r){"use strict";var n=null;n="undefined"!=typeof Promise?Promise:e("lie"),t.exports={Promise:n}},{lie:37}],7:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,i=e("pako"),s=e("./utils"),a=e("./stream/GenericWorker"),o=n?"uint8array":"array";function h(e,t){a.call(this,"FlateWorker/"+e),this._pako=null,this._pakoAction=e,this._pakoOptions=t,this.meta={}}r.magic="\b\0",s.inherits(h,a),h.prototype.processChunk=function(e){this.meta=e.meta,null===this._pako&&this._createPako(),this._pako.push(s.transformTo(o,e.data),!1)},h.prototype.flush=function(){a.prototype.flush.call(this),null===this._pako&&this._createPako(),this._pako.push([],!0)},h.prototype.cleanUp=function(){a.prototype.cleanUp.call(this),this._pako=null},h.prototype._createPako=function(){this._pako=new i[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var t=this;this._pako.onData=function(e){t.push({data:e,meta:t.meta})}},r.compressWorker=function(e){return new h("Deflate",e)},r.uncompressWorker=function(){return new h("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(e,t,r){"use strict";function A(e,t){var r,n="";for(r=0;r<t;r++)n+=String.fromCharCode(255&e),e>>>=8;return n}function n(e,t,r,n,i,s){var a,o,h=e.file,u=e.compression,l=s!==O.utf8encode,f=I.transformTo("string",s(h.name)),c=I.transformTo("string",O.utf8encode(h.name)),d=h.comment,p=I.transformTo("string",s(d)),m=I.transformTo("string",O.utf8encode(d)),_=c.length!==h.name.length,g=m.length!==d.length,b="",v="",y="",w=h.dir,k=h.date,x={crc32:0,compressedSize:0,uncompressedSize:0};t&&!r||(x.crc32=e.crc32,x.compressedSize=e.compressedSize,x.uncompressedSize=e.uncompressedSize);var S=0;t&&(S|=8),l||!_&&!g||(S|=2048);var z=0,C=0;w&&(z|=16),"UNIX"===i?(C=798,z|=function(e,t){var r=e;return e||(r=t?16893:33204),(65535&r)<<16}(h.unixPermissions,w)):(C=20,z|=function(e){return 63&(e||0)}(h.dosPermissions)),a=k.getUTCHours(),a<<=6,a|=k.getUTCMinutes(),a<<=5,a|=k.getUTCSeconds()/2,o=k.getUTCFullYear()-1980,o<<=4,o|=k.getUTCMonth()+1,o<<=5,o|=k.getUTCDate(),_&&(v=A(1,1)+A(B(f),4)+c,b+="up"+A(v.length,2)+v),g&&(y=A(1,1)+A(B(p),4)+m,b+="uc"+A(y.length,2)+y);var E="";return E+="\n\0",E+=A(S,2),E+=u.magic,E+=A(a,2),E+=A(o,2),E+=A(x.crc32,4),E+=A(x.compressedSize,4),E+=A(x.uncompressedSize,4),E+=A(f.length,2),E+=A(b.length,2),{fileRecord:R.LOCAL_FILE_HEADER+E+f+b,dirRecord:R.CENTRAL_FILE_HEADER+A(C,2)+E+A(p.length,2)+"\0\0\0\0"+A(z,4)+A(n,4)+f+b+p}}var I=e("../utils"),i=e("../stream/GenericWorker"),O=e("../utf8"),B=e("../crc32"),R=e("../signature");function s(e,t,r,n){i.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=t,this.zipPlatform=r,this.encodeFileName=n,this.streamFiles=e,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}I.inherits(s,i),s.prototype.push=function(e){var t=e.meta.percent||0,r=this.entriesCount,n=this._sources.length;this.accumulate?this.contentBuffer.push(e):(this.bytesWritten+=e.data.length,i.prototype.push.call(this,{data:e.data,meta:{currentFile:this.currentFile,percent:r?(t+100*(r-n-1))/r:100}}))},s.prototype.openedSource=function(e){this.currentSourceOffset=this.bytesWritten,this.currentFile=e.file.name;var t=this.streamFiles&&!e.file.dir;if(t){var r=n(e,t,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:r.fileRecord,meta:{percent:0}})}else this.accumulate=!0},s.prototype.closedSource=function(e){this.accumulate=!1;var t=this.streamFiles&&!e.file.dir,r=n(e,t,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(r.dirRecord),t)this.push({data:function(e){return R.DATA_DESCRIPTOR+A(e.crc32,4)+A(e.compressedSize,4)+A(e.uncompressedSize,4)}(e),meta:{percent:100}});else for(this.push({data:r.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},s.prototype.flush=function(){for(var e=this.bytesWritten,t=0;t<this.dirRecords.length;t++)this.push({data:this.dirRecords[t],meta:{percent:100}});var r=this.bytesWritten-e,n=function(e,t,r,n,i){var s=I.transformTo("string",i(n));return R.CENTRAL_DIRECTORY_END+"\0\0\0\0"+A(e,2)+A(e,2)+A(t,4)+A(r,4)+A(s.length,2)+s}(this.dirRecords.length,r,e,this.zipComment,this.encodeFileName);this.push({data:n,meta:{percent:100}})},s.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},s.prototype.registerPrevious=function(e){this._sources.push(e);var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.closedSource(t.previous.streamInfo),t._sources.length?t.prepareNextSource():t.end()}),e.on("error",function(e){t.error(e)}),this},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},s.prototype.error=function(e){var t=this._sources;if(!i.prototype.error.call(this,e))return!1;for(var r=0;r<t.length;r++)try{t[r].error(e)}catch(e){}return!0},s.prototype.lock=function(){i.prototype.lock.call(this);for(var e=this._sources,t=0;t<e.length;t++)e[t].lock()},t.exports=s},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(e,t,r){"use strict";var u=e("../compressions"),n=e("./ZipFileWorker");r.generateWorker=function(e,a,t){var o=new n(a.streamFiles,t,a.platform,a.encodeFileName),h=0;try{e.forEach(function(e,t){h++;var r=function(e,t){var r=e||t,n=u[r];if(!n)throw new Error(r+" is not a valid compression method !");return n}(t.options.compression,a.compression),n=t.options.compressionOptions||a.compressionOptions||{},i=t.dir,s=t.date;t._compressWorker(r,n).withStreamInfo("file",{name:e,dir:i,date:s,comment:t.comment||"",unixPermissions:t.unixPermissions,dosPermissions:t.dosPermissions}).pipe(o)}),o.entriesCount=h}catch(e){o.error(e)}return o}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(e,t,r){"use strict";function n(){if(!(this instanceof n))return new n;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var e=new n;for(var t in this)"function"!=typeof this[t]&&(e[t]=this[t]);return e}}(n.prototype=e("./object")).loadAsync=e("./load"),n.support=e("./support"),n.defaults=e("./defaults"),n.version="3.10.1",n.loadAsync=function(e,t){return(new n).loadAsync(e,t)},n.external=e("./external"),t.exports=n},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(e,t,r){"use strict";var u=e("./utils"),i=e("./external"),n=e("./utf8"),s=e("./zipEntries"),a=e("./stream/Crc32Probe"),l=e("./nodejsUtils");function f(n){return new i.Promise(function(e,t){var r=n.decompressed.getContentWorker().pipe(new a);r.on("error",function(e){t(e)}).on("end",function(){r.streamInfo.crc32!==n.decompressed.crc32?t(new Error("Corrupted zip : CRC32 mismatch")):e()}).resume()})}t.exports=function(e,o){var h=this;return o=u.extend(o||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:n.utf8decode}),l.isNode&&l.isStream(e)?i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):u.prepareContent("the loaded zip file",e,!0,o.optimizedBinaryString,o.base64).then(function(e){var t=new s(o);return t.load(e),t}).then(function(e){var t=[i.Promise.resolve(e)],r=e.files;if(o.checkCRC32)for(var n=0;n<r.length;n++)t.push(f(r[n]));return i.Promise.all(t)}).then(function(e){for(var t=e.shift(),r=t.files,n=0;n<r.length;n++){var i=r[n],s=i.fileNameStr,a=u.resolve(i.fileNameStr);h.file(a,i.decompressed,{binary:!0,optimizedBinaryString:!0,date:i.date,dir:i.dir,comment:i.fileCommentStr.length?i.fileCommentStr:null,unixPermissions:i.unixPermissions,dosPermissions:i.dosPermissions,createFolders:o.createFolders}),i.dir||(h.file(a).unsafeOriginalName=s)}return t.zipComment.length&&(h.comment=t.zipComment),h})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../stream/GenericWorker");function s(e,t){i.call(this,"Nodejs stream input adapter for "+e),this._upstreamEnded=!1,this._bindStream(t)}n.inherits(s,i),s.prototype._bindStream=function(e){var t=this;(this._stream=e).pause(),e.on("data",function(e){t.push({data:e,meta:{percent:0}})}).on("error",function(e){t.isPaused?this.generatedError=e:t.error(e)}).on("end",function(){t.isPaused?t._upstreamEnded=!0:t.end()})},s.prototype.pause=function(){return!!i.prototype.pause.call(this)&&(this._stream.pause(),!0)},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},t.exports=s},{"../stream/GenericWorker":28,"../utils":32}],13:[function(e,t,r){"use strict";var i=e("readable-stream").Readable;function n(e,t,r){i.call(this,t),this._helper=e;var n=this;e.on("data",function(e,t){n.push(e)||n._helper.pause(),r&&r(t)}).on("error",function(e){n.emit("error",e)}).on("end",function(){n.push(null)})}e("../utils").inherits(n,i),n.prototype._read=function(){this._helper.resume()},t.exports=n},{"../utils":32,"readable-stream":16}],14:[function(e,t,r){"use strict";t.exports={isNode:"undefined"!=typeof Buffer,newBufferFrom:function(e,t){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(e,t);if("number"==typeof e)throw new Error('The "data" argument must not be a number');return new Buffer(e,t)},allocBuffer:function(e){if(Buffer.alloc)return Buffer.alloc(e);var t=new Buffer(e);return t.fill(0),t},isBuffer:function(e){return Buffer.isBuffer(e)},isStream:function(e){return e&&"function"==typeof e.on&&"function"==typeof e.pause&&"function"==typeof e.resume}}},{}],15:[function(e,t,r){"use strict";function s(e,t,r){var n,i=u.getTypeOf(t),s=u.extend(r||{},f);s.date=s.date||new Date,null!==s.compression&&(s.compression=s.compression.toUpperCase()),"string"==typeof s.unixPermissions&&(s.unixPermissions=parseInt(s.unixPermissions,8)),s.unixPermissions&&16384&s.unixPermissions&&(s.dir=!0),s.dosPermissions&&16&s.dosPermissions&&(s.dir=!0),s.dir&&(e=g(e)),s.createFolders&&(n=_(e))&&b.call(this,n,!0);var a="string"===i&&!1===s.binary&&!1===s.base64;r&&void 0!==r.binary||(s.binary=!a),(t instanceof c&&0===t.uncompressedSize||s.dir||!t||0===t.length)&&(s.base64=!1,s.binary=!0,t="",s.compression="STORE",i="string");var o=null;o=t instanceof c||t instanceof l?t:p.isNode&&p.isStream(t)?new m(e,t):u.prepareContent(e,t,s.binary,s.optimizedBinaryString,s.base64);var h=new d(e,o,s);this.files[e]=h}var i=e("./utf8"),u=e("./utils"),l=e("./stream/GenericWorker"),a=e("./stream/StreamHelper"),f=e("./defaults"),c=e("./compressedObject"),d=e("./zipObject"),o=e("./generate"),p=e("./nodejsUtils"),m=e("./nodejs/NodejsStreamInputAdapter"),_=function(e){"/"===e.slice(-1)&&(e=e.substring(0,e.length-1));var t=e.lastIndexOf("/");return 0<t?e.substring(0,t):""},g=function(e){return"/"!==e.slice(-1)&&(e+="/"),e},b=function(e,t){return t=void 0!==t?t:f.createFolders,e=g(e),this.files[e]||s.call(this,e,null,{dir:!0,createFolders:t}),this.files[e]};function h(e){return"[object RegExp]"===Object.prototype.toString.call(e)}var n={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(e){var t,r,n;for(t in this.files)n=this.files[t],(r=t.slice(this.root.length,t.length))&&t.slice(0,this.root.length)===this.root&&e(r,n)},filter:function(r){var n=[];return this.forEach(function(e,t){r(e,t)&&n.push(t)}),n},file:function(e,t,r){if(1!==arguments.length)return e=this.root+e,s.call(this,e,t,r),this;if(h(e)){var n=e;return this.filter(function(e,t){return!t.dir&&n.test(e)})}var i=this.files[this.root+e];return i&&!i.dir?i:null},folder:function(r){if(!r)return this;if(h(r))return this.filter(function(e,t){return t.dir&&r.test(e)});var e=this.root+r,t=b.call(this,e),n=this.clone();return n.root=t.name,n},remove:function(r){r=this.root+r;var e=this.files[r];if(e||("/"!==r.slice(-1)&&(r+="/"),e=this.files[r]),e&&!e.dir)delete this.files[r];else for(var t=this.filter(function(e,t){return t.name.slice(0,r.length)===r}),n=0;n<t.length;n++)delete this.files[t[n].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(e){var t,r={};try{if((r=u.extend(e||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:i.utf8encode})).type=r.type.toLowerCase(),r.compression=r.compression.toUpperCase(),"binarystring"===r.type&&(r.type="string"),!r.type)throw new Error("No output type specified.");u.checkSupport(r.type),"darwin"!==r.platform&&"freebsd"!==r.platform&&"linux"!==r.platform&&"sunos"!==r.platform||(r.platform="UNIX"),"win32"===r.platform&&(r.platform="DOS");var n=r.comment||this.comment||"";t=o.generateWorker(this,r,n)}catch(e){(t=new l("error")).error(e)}return new a(t,r.type||"string",r.mimeType)},generateAsync:function(e,t){return this.generateInternalStream(e).accumulate(t)},generateNodeStream:function(e,t){return(e=e||{}).type||(e.type="nodebuffer"),this.generateInternalStream(e).toNodejsStream(t)}};t.exports=n},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(e,t,r){"use strict";t.exports=e("stream")},{stream:void 0}],17:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e);for(var t=0;t<this.data.length;t++)e[t]=255&e[t]}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data[this.zero+e]},i.prototype.lastIndexOfSignature=function(e){for(var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.length-4;0<=s;--s)if(this.data[s]===t&&this.data[s+1]===r&&this.data[s+2]===n&&this.data[s+3]===i)return s-this.zero;return-1},i.prototype.readAndCheckSignature=function(e){var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.readData(4);return t===s[0]&&r===s[1]&&n===s[2]&&i===s[3]},i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return[];var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],18:[function(e,t,r){"use strict";var n=e("../utils");function i(e){this.data=e,this.length=e.length,this.index=0,this.zero=0}i.prototype={checkOffset:function(e){this.checkIndex(this.index+e)},checkIndex:function(e){if(this.length<this.zero+e||e<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+e+"). Corrupted zip ?")},setIndex:function(e){this.checkIndex(e),this.index=e},skip:function(e){this.setIndex(this.index+e)},byteAt:function(){},readInt:function(e){var t,r=0;for(this.checkOffset(e),t=this.index+e-1;t>=this.index;t--)r=(r<<8)+this.byteAt(t);return this.index+=e,r},readString:function(e){return n.transformTo("string",this.readData(e))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var e=this.readInt(4);return new Date(Date.UTC(1980+(e>>25&127),(e>>21&15)-1,e>>16&31,e>>11&31,e>>5&63,(31&e)<<1))}},t.exports=i},{"../utils":32}],19:[function(e,t,r){"use strict";var n=e("./Uint8ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data.charCodeAt(this.zero+e)},i.prototype.lastIndexOfSignature=function(e){return this.data.lastIndexOf(e)-this.zero},i.prototype.readAndCheckSignature=function(e){return e===this.readData(4)},i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],21:[function(e,t,r){"use strict";var n=e("./ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return new Uint8Array(0);var t=this.data.subarray(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./ArrayReader":17}],22:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../support"),s=e("./ArrayReader"),a=e("./StringReader"),o=e("./NodeBufferReader"),h=e("./Uint8ArrayReader");t.exports=function(e){var t=n.getTypeOf(e);return n.checkSupport(t),"string"!==t||i.uint8array?"nodebuffer"===t?new o(e):i.uint8array?new h(n.transformTo("uint8array",e)):new s(n.transformTo("array",e)):new a(e)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(e,t,r){"use strict";r.LOCAL_FILE_HEADER="PK",r.CENTRAL_FILE_HEADER="PK",r.CENTRAL_DIRECTORY_END="PK",r.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",r.ZIP64_CENTRAL_DIRECTORY_END="PK",r.DATA_DESCRIPTOR="PK\b"},{}],24:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../utils");function s(e){n.call(this,"ConvertWorker to "+e),this.destType=e}i.inherits(s,n),s.prototype.processChunk=function(e){this.push({data:i.transformTo(this.destType,e.data),meta:e.meta})},t.exports=s},{"../utils":32,"./GenericWorker":28}],25:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../crc32");function s(){n.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}e("../utils").inherits(s,n),s.prototype.processChunk=function(e){this.streamInfo.crc32=i(e.data,this.streamInfo.crc32||0),this.push(e)},t.exports=s},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataLengthProbe for "+e),this.propName=e,this.withStreamInfo(e,0)}n.inherits(s,i),s.prototype.processChunk=function(e){if(e){var t=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=t+e.data.length}i.prototype.processChunk.call(this,e)},t.exports=s},{"../utils":32,"./GenericWorker":28}],27:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataWorker");var t=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,e.then(function(e){t.dataIsReady=!0,t.data=e,t.max=e&&e.length||0,t.type=n.getTypeOf(e),t.isPaused||t._tickAndRepeat()},function(e){t.error(e)})}n.inherits(s,i),s.prototype.cleanUp=function(){i.prototype.cleanUp.call(this),this.data=null},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,n.delay(this._tickAndRepeat,[],this)),!0)},s.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(n.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},s.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var e=null,t=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":e=this.data.substring(this.index,t);break;case"uint8array":e=this.data.subarray(this.index,t);break;case"array":case"nodebuffer":e=this.data.slice(this.index,t)}return this.index=t,this.push({data:e,meta:{percent:this.max?this.index/this.max*100:0}})},t.exports=s},{"../utils":32,"./GenericWorker":28}],28:[function(e,t,r){"use strict";function n(e){this.name=e||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}n.prototype={push:function(e){this.emit("data",e)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(e){this.emit("error",e)}return!0},error:function(e){return!this.isFinished&&(this.isPaused?this.generatedError=e:(this.isFinished=!0,this.emit("error",e),this.previous&&this.previous.error(e),this.cleanUp()),!0)},on:function(e,t){return this._listeners[e].push(t),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(e,t){if(this._listeners[e])for(var r=0;r<this._listeners[e].length;r++)this._listeners[e][r].call(this,t)},pipe:function(e){return e.registerPrevious(this)},registerPrevious:function(e){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=e.streamInfo,this.mergeStreamInfo(),this.previous=e;var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.end()}),e.on("error",function(e){t.error(e)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var e=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),e=!0),this.previous&&this.previous.resume(),!e},flush:function(){},processChunk:function(e){this.push(e)},withStreamInfo:function(e,t){return this.extraStreamInfo[e]=t,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var e in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,e)&&(this.streamInfo[e]=this.extraStreamInfo[e])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var e="Worker "+this.name;return this.previous?this.previous+" -> "+e:e}},t.exports=n},{}],29:[function(e,t,r){"use strict";var h=e("../utils"),i=e("./ConvertWorker"),s=e("./GenericWorker"),u=e("../base64"),n=e("../support"),a=e("../external"),o=null;if(n.nodestream)try{o=e("../nodejs/NodejsStreamOutputAdapter")}catch(e){}function l(e,o){return new a.Promise(function(t,r){var n=[],i=e._internalType,s=e._outputType,a=e._mimeType;e.on("data",function(e,t){n.push(e),o&&o(t)}).on("error",function(e){n=[],r(e)}).on("end",function(){try{var e=function(e,t,r){switch(e){case"blob":return h.newBlob(h.transformTo("arraybuffer",t),r);case"base64":return u.encode(t);default:return h.transformTo(e,t)}}(s,function(e,t){var r,n=0,i=null,s=0;for(r=0;r<t.length;r++)s+=t[r].length;switch(e){case"string":return t.join("");case"array":return Array.prototype.concat.apply([],t);case"uint8array":for(i=new Uint8Array(s),r=0;r<t.length;r++)i.set(t[r],n),n+=t[r].length;return i;case"nodebuffer":return Buffer.concat(t);default:throw new Error("concat : unsupported type '"+e+"'")}}(i,n),a);t(e)}catch(e){r(e)}n=[]}).resume()})}function f(e,t,r){var n=t;switch(t){case"blob":case"arraybuffer":n="uint8array";break;case"base64":n="string"}try{this._internalType=n,this._outputType=t,this._mimeType=r,h.checkSupport(n),this._worker=e.pipe(new i(n)),e.lock()}catch(e){this._worker=new s("error"),this._worker.error(e)}}f.prototype={accumulate:function(e){return l(this,e)},on:function(e,t){var r=this;return"data"===e?this._worker.on(e,function(e){t.call(r,e.data,e.meta)}):this._worker.on(e,function(){h.delay(t,arguments,r)}),this},resume:function(){return h.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(e){if(h.checkSupport("nodestream"),"nodebuffer"!==this._outputType)throw new Error(this._outputType+" is not supported by this method");return new o(this,{objectMode:"nodebuffer"!==this._outputType},e)}},t.exports=f},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(e,t,r){"use strict";if(r.base64=!0,r.array=!0,r.string=!0,r.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,r.nodebuffer="undefined"!=typeof Buffer,r.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)r.blob=!1;else{var n=new ArrayBuffer(0);try{r.blob=0===new Blob([n],{type:"application/zip"}).size}catch(e){try{var i=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);i.append(n),r.blob=0===i.getBlob("application/zip").size}catch(e){r.blob=!1}}}try{r.nodestream=!!e("readable-stream").Readable}catch(e){r.nodestream=!1}},{"readable-stream":16}],31:[function(e,t,s){"use strict";for(var o=e("./utils"),h=e("./support"),r=e("./nodejsUtils"),n=e("./stream/GenericWorker"),u=new Array(256),i=0;i<256;i++)u[i]=252<=i?6:248<=i?5:240<=i?4:224<=i?3:192<=i?2:1;u[254]=u[254]=1;function a(){n.call(this,"utf-8 decode"),this.leftOver=null}function l(){n.call(this,"utf-8 encode")}s.utf8encode=function(e){return h.nodebuffer?r.newBufferFrom(e,"utf-8"):function(e){var t,r,n,i,s,a=e.length,o=0;for(i=0;i<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),o+=r<128?1:r<2048?2:r<65536?3:4;for(t=h.uint8array?new Uint8Array(o):new Array(o),i=s=0;s<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t}(e)},s.utf8decode=function(e){return h.nodebuffer?o.transformTo("nodebuffer",e).toString("utf-8"):function(e){var t,r,n,i,s=e.length,a=new Array(2*s);for(t=r=0;t<s;)if((n=e[t++])<128)a[r++]=n;else if(4<(i=u[n]))a[r++]=65533,t+=i-1;else{for(n&=2===i?31:3===i?15:7;1<i&&t<s;)n=n<<6|63&e[t++],i--;1<i?a[r++]=65533:n<65536?a[r++]=n:(n-=65536,a[r++]=55296|n>>10&1023,a[r++]=56320|1023&n)}return a.length!==r&&(a.subarray?a=a.subarray(0,r):a.length=r),o.applyFromCharCode(a)}(e=o.transformTo(h.uint8array?"uint8array":"array",e))},o.inherits(a,n),a.prototype.processChunk=function(e){var t=o.transformTo(h.uint8array?"uint8array":"array",e.data);if(this.leftOver&&this.leftOver.length){if(h.uint8array){var r=t;(t=new Uint8Array(r.length+this.leftOver.length)).set(this.leftOver,0),t.set(r,this.leftOver.length)}else t=this.leftOver.concat(t);this.leftOver=null}var n=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}(t),i=t;n!==t.length&&(h.uint8array?(i=t.subarray(0,n),this.leftOver=t.subarray(n,t.length)):(i=t.slice(0,n),this.leftOver=t.slice(n,t.length))),this.push({data:s.utf8decode(i),meta:e.meta})},a.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:s.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},s.Utf8DecodeWorker=a,o.inherits(l,n),l.prototype.processChunk=function(e){this.push({data:s.utf8encode(e.data),meta:e.meta})},s.Utf8EncodeWorker=l},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(e,t,a){"use strict";var o=e("./support"),h=e("./base64"),r=e("./nodejsUtils"),u=e("./external");function n(e){return e}function l(e,t){for(var r=0;r<e.length;++r)t[r]=255&e.charCodeAt(r);return t}e("setimmediate"),a.newBlob=function(t,r){a.checkSupport("blob");try{return new Blob([t],{type:r})}catch(e){try{var n=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return n.append(t),n.getBlob(r)}catch(e){throw new Error("Bug : can't construct the Blob.")}}};var i={stringifyByChunk:function(e,t,r){var n=[],i=0,s=e.length;if(s<=r)return String.fromCharCode.apply(null,e);for(;i<s;)"array"===t||"nodebuffer"===t?n.push(String.fromCharCode.apply(null,e.slice(i,Math.min(i+r,s)))):n.push(String.fromCharCode.apply(null,e.subarray(i,Math.min(i+r,s)))),i+=r;return n.join("")},stringifyByChar:function(e){for(var t="",r=0;r<e.length;r++)t+=String.fromCharCode(e[r]);return t},applyCanBeUsed:{uint8array:function(){try{return o.uint8array&&1===String.fromCharCode.apply(null,new Uint8Array(1)).length}catch(e){return!1}}(),nodebuffer:function(){try{return o.nodebuffer&&1===String.fromCharCode.apply(null,r.allocBuffer(1)).length}catch(e){return!1}}()}};function s(e){var t=65536,r=a.getTypeOf(e),n=!0;if("uint8array"===r?n=i.applyCanBeUsed.uint8array:"nodebuffer"===r&&(n=i.applyCanBeUsed.nodebuffer),n)for(;1<t;)try{return i.stringifyByChunk(e,r,t)}catch(e){t=Math.floor(t/2)}return i.stringifyByChar(e)}function f(e,t){for(var r=0;r<e.length;r++)t[r]=e[r];return t}a.applyFromCharCode=s;var c={};c.string={string:n,array:function(e){return l(e,new Array(e.length))},arraybuffer:function(e){return c.string.uint8array(e).buffer},uint8array:function(e){return l(e,new Uint8Array(e.length))},nodebuffer:function(e){return l(e,r.allocBuffer(e.length))}},c.array={string:s,array:n,arraybuffer:function(e){return new Uint8Array(e).buffer},uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(e)}},c.arraybuffer={string:function(e){return s(new Uint8Array(e))},array:function(e){return f(new Uint8Array(e),new Array(e.byteLength))},arraybuffer:n,uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(new Uint8Array(e))}},c.uint8array={string:s,array:function(e){return f(e,new Array(e.length))},arraybuffer:function(e){return e.buffer},uint8array:n,nodebuffer:function(e){return r.newBufferFrom(e)}},c.nodebuffer={string:s,array:function(e){return f(e,new Array(e.length))},arraybuffer:function(e){return c.nodebuffer.uint8array(e).buffer},uint8array:function(e){return f(e,new Uint8Array(e.length))},nodebuffer:n},a.transformTo=function(e,t){if(t=t||"",!e)return t;a.checkSupport(e);var r=a.getTypeOf(t);return c[r][e](t)},a.resolve=function(e){for(var t=e.split("/"),r=[],n=0;n<t.length;n++){var i=t[n];"."===i||""===i&&0!==n&&n!==t.length-1||(".."===i?r.pop():r.push(i))}return r.join("/")},a.getTypeOf=function(e){return"string"==typeof e?"string":"[object Array]"===Object.prototype.toString.call(e)?"array":o.nodebuffer&&r.isBuffer(e)?"nodebuffer":o.uint8array&&e instanceof Uint8Array?"uint8array":o.arraybuffer&&e instanceof ArrayBuffer?"arraybuffer":void 0},a.checkSupport=function(e){if(!o[e.toLowerCase()])throw new Error(e+" is not supported by this platform")},a.MAX_VALUE_16BITS=65535,a.MAX_VALUE_32BITS=-1,a.pretty=function(e){var t,r,n="";for(r=0;r<(e||"").length;r++)n+="\\x"+((t=e.charCodeAt(r))<16?"0":"")+t.toString(16).toUpperCase();return n},a.delay=function(e,t,r){setImmediate(function(){e.apply(r||null,t||[])})},a.inherits=function(e,t){function r(){}r.prototype=t.prototype,e.prototype=new r},a.extend=function(){var e,t,r={};for(e=0;e<arguments.length;e++)for(t in arguments[e])Object.prototype.hasOwnProperty.call(arguments[e],t)&&void 0===r[t]&&(r[t]=arguments[e][t]);return r},a.prepareContent=function(r,e,n,i,s){return u.Promise.resolve(e).then(function(n){return o.blob&&(n instanceof Blob||-1!==["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(n)))&&"undefined"!=typeof FileReader?new u.Promise(function(t,r){var e=new FileReader;e.onload=function(e){t(e.target.result)},e.onerror=function(e){r(e.target.error)},e.readAsArrayBuffer(n)}):n}).then(function(e){var t=a.getTypeOf(e);return t?("arraybuffer"===t?e=a.transformTo("uint8array",e):"string"===t&&(s?e=h.decode(e):n&&!0!==i&&(e=function(e){return l(e,o.uint8array?new Uint8Array(e.length):new Array(e.length))}(e))),e):u.Promise.reject(new Error("Can't read the data of '"+r+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),i=e("./utils"),s=e("./signature"),a=e("./zipEntry"),o=e("./support");function h(e){this.files=[],this.loadOptions=e}h.prototype={checkSignature:function(e){if(!this.reader.readAndCheckSignature(e)){this.reader.index-=4;var t=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+i.pretty(t)+", expected "+i.pretty(e)+")")}},isSignature:function(e,t){var r=this.reader.index;this.reader.setIndex(e);var n=this.reader.readString(4)===t;return this.reader.setIndex(r),n},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var e=this.reader.readData(this.zipCommentLength),t=o.uint8array?"uint8array":"array",r=i.transformTo(t,e);this.zipComment=this.loadOptions.decodeFileName(r)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var e,t,r,n=this.zip64EndOfCentralSize-44;0<n;)e=this.reader.readInt(2),t=this.reader.readInt(4),r=this.reader.readData(t),this.zip64ExtensibleData[e]={id:e,length:t,value:r}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var e,t;for(e=0;e<this.files.length;e++)t=this.files[e],this.reader.setIndex(t.localHeaderOffset),this.checkSignature(s.LOCAL_FILE_HEADER),t.readLocalPart(this.reader),t.handleUTF8(),t.processAttributes()},readCentralDir:function(){var e;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);)(e=new a({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(e);if(this.centralDirRecords!==this.files.length&&0!==this.centralDirRecords&&0===this.files.length)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var e=this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);if(e<0)throw!this.isSignature(0,s.LOCAL_FILE_HEADER)?new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html"):new Error("Corrupted zip: can't find end of central directory");this.reader.setIndex(e);var t=e;if(this.checkSignature(s.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===i.MAX_VALUE_16BITS||this.diskWithCentralDirStart===i.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===i.MAX_VALUE_16BITS||this.centralDirRecords===i.MAX_VALUE_16BITS||this.centralDirSize===i.MAX_VALUE_32BITS||this.centralDirOffset===i.MAX_VALUE_32BITS){if(this.zip64=!0,(e=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(e),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,s.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var r=this.centralDirOffset+this.centralDirSize;this.zip64&&(r+=20,r+=12+this.zip64EndOfCentralSize);var n=t-r;if(0<n)this.isSignature(t,s.CENTRAL_FILE_HEADER)||(this.reader.zero=n);else if(n<0)throw new Error("Corrupted zip: missing "+Math.abs(n)+" bytes.")},prepareReader:function(e){this.reader=n(e)},load:function(e){this.prepareReader(e),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},t.exports=h},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),s=e("./utils"),i=e("./compressedObject"),a=e("./crc32"),o=e("./utf8"),h=e("./compressions"),u=e("./support");function l(e,t){this.options=e,this.loadOptions=t}l.prototype={isEncrypted:function(){return 1==(1&this.bitFlag)},useUTF8:function(){return 2048==(2048&this.bitFlag)},readLocalPart:function(e){var t,r;if(e.skip(22),this.fileNameLength=e.readInt(2),r=e.readInt(2),this.fileName=e.readData(this.fileNameLength),e.skip(r),-1===this.compressedSize||-1===this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if(null===(t=function(e){for(var t in h)if(Object.prototype.hasOwnProperty.call(h,t)&&h[t].magic===e)return h[t];return null}(this.compressionMethod)))throw new Error("Corrupted zip : compression "+s.pretty(this.compressionMethod)+" unknown (inner file : "+s.transformTo("string",this.fileName)+")");this.decompressed=new i(this.compressedSize,this.uncompressedSize,this.crc32,t,e.readData(this.compressedSize))},readCentralPart:function(e){this.versionMadeBy=e.readInt(2),e.skip(2),this.bitFlag=e.readInt(2),this.compressionMethod=e.readString(2),this.date=e.readDate(),this.crc32=e.readInt(4),this.compressedSize=e.readInt(4),this.uncompressedSize=e.readInt(4);var t=e.readInt(2);if(this.extraFieldsLength=e.readInt(2),this.fileCommentLength=e.readInt(2),this.diskNumberStart=e.readInt(2),this.internalFileAttributes=e.readInt(2),this.externalFileAttributes=e.readInt(4),this.localHeaderOffset=e.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");e.skip(t),this.readExtraFields(e),this.parseZIP64ExtraField(e),this.fileComment=e.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var e=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),0==e&&(this.dosPermissions=63&this.externalFileAttributes),3==e&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||"/"!==this.fileNameStr.slice(-1)||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var e=n(this.extraFields[1].value);this.uncompressedSize===s.MAX_VALUE_32BITS&&(this.uncompressedSize=e.readInt(8)),this.compressedSize===s.MAX_VALUE_32BITS&&(this.compressedSize=e.readInt(8)),this.localHeaderOffset===s.MAX_VALUE_32BITS&&(this.localHeaderOffset=e.readInt(8)),this.diskNumberStart===s.MAX_VALUE_32BITS&&(this.diskNumberStart=e.readInt(4))}},readExtraFields:function(e){var t,r,n,i=e.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});e.index+4<i;)t=e.readInt(2),r=e.readInt(2),n=e.readData(r),this.extraFields[t]={id:t,length:r,value:n};e.setIndex(i)},handleUTF8:function(){var e=u.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=o.utf8decode(this.fileName),this.fileCommentStr=o.utf8decode(this.fileComment);else{var t=this.findExtraFieldUnicodePath();if(null!==t)this.fileNameStr=t;else{var r=s.transformTo(e,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(r)}var n=this.findExtraFieldUnicodeComment();if(null!==n)this.fileCommentStr=n;else{var i=s.transformTo(e,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(i)}}},findExtraFieldUnicodePath:function(){var e=this.extraFields[28789];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:a(this.fileName)!==t.readInt(4)?null:o.utf8decode(t.readData(e.length-5))}return null},findExtraFieldUnicodeComment:function(){var e=this.extraFields[25461];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:a(this.fileComment)!==t.readInt(4)?null:o.utf8decode(t.readData(e.length-5))}return null}},t.exports=l},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(e,t,r){"use strict";function n(e,t,r){this.name=e,this.dir=r.dir,this.date=r.date,this.comment=r.comment,this.unixPermissions=r.unixPermissions,this.dosPermissions=r.dosPermissions,this._data=t,this._dataBinary=r.binary,this.options={compression:r.compression,compressionOptions:r.compressionOptions}}var s=e("./stream/StreamHelper"),i=e("./stream/DataWorker"),a=e("./utf8"),o=e("./compressedObject"),h=e("./stream/GenericWorker");n.prototype={internalStream:function(e){var t=null,r="string";try{if(!e)throw new Error("No output type specified.");var n="string"===(r=e.toLowerCase())||"text"===r;"binarystring"!==r&&"text"!==r||(r="string"),t=this._decompressWorker();var i=!this._dataBinary;i&&!n&&(t=t.pipe(new a.Utf8EncodeWorker)),!i&&n&&(t=t.pipe(new a.Utf8DecodeWorker))}catch(e){(t=new h("error")).error(e)}return new s(t,r,"")},async:function(e,t){return this.internalStream(e).accumulate(t)},nodeStream:function(e,t){return this.internalStream(e||"nodebuffer").toNodejsStream(t)},_compressWorker:function(e,t){if(this._data instanceof o&&this._data.compression.magic===e.magic)return this._data.getCompressedWorker();var r=this._decompressWorker();return this._dataBinary||(r=r.pipe(new a.Utf8EncodeWorker)),o.createWorkerFrom(r,e,t)},_decompressWorker:function(){return this._data instanceof o?this._data.getContentWorker():this._data instanceof h?this._data:new i(this._data)}};for(var u=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],l=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},f=0;f<u.length;f++)n.prototype[u[f]]=l;t.exports=n},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(e,l,t){(function(t){"use strict";var r,n,e=t.MutationObserver||t.WebKitMutationObserver;if(e){var i=0,s=new e(u),a=t.document.createTextNode("");s.observe(a,{characterData:!0}),r=function(){a.data=i=++i%2}}else if(t.setImmediate||void 0===t.MessageChannel)r="document"in t&&"onreadystatechange"in t.document.createElement("script")?function(){var e=t.document.createElement("script");e.onreadystatechange=function(){u(),e.onreadystatechange=null,e.parentNode.removeChild(e),e=null},t.document.documentElement.appendChild(e)}:function(){setTimeout(u,0)};else{var o=new t.MessageChannel;o.port1.onmessage=u,r=function(){o.port2.postMessage(0)}}var h=[];function u(){var e,t;n=!0;for(var r=h.length;r;){for(t=h,h=[],e=-1;++e<r;)t[e]();r=h.length}n=!1}l.exports=function(e){1!==h.push(e)||n||r()}}).call(this,"undefined"!=typeof __webpack_require__.g?__webpack_require__.g:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],37:[function(e,t,r){"use strict";var i=e("immediate");function u(){}var l={},s=["REJECTED"],a=["FULFILLED"],n=["PENDING"];function o(e){if("function"!=typeof e)throw new TypeError("resolver must be a function");this.state=n,this.queue=[],this.outcome=void 0,e!==u&&d(this,e)}function h(e,t,r){this.promise=e,"function"==typeof t&&(this.onFulfilled=t,this.callFulfilled=this.otherCallFulfilled),"function"==typeof r&&(this.onRejected=r,this.callRejected=this.otherCallRejected)}function f(t,r,n){i(function(){var e;try{e=r(n)}catch(e){return l.reject(t,e)}e===t?l.reject(t,new TypeError("Cannot resolve promise with itself")):l.resolve(t,e)})}function c(e){var t=e&&e.then;if(e&&("object"==typeof e||"function"==typeof e)&&"function"==typeof t)return function(){t.apply(e,arguments)}}function d(t,e){var r=!1;function n(e){r||(r=!0,l.reject(t,e))}function i(e){r||(r=!0,l.resolve(t,e))}var s=p(function(){e(i,n)});"error"===s.status&&n(s.value)}function p(e,t){var r={};try{r.value=e(t),r.status="success"}catch(e){r.status="error",r.value=e}return r}(t.exports=o).prototype.finally=function(t){if("function"!=typeof t)return this;var r=this.constructor;return this.then(function(e){return r.resolve(t()).then(function(){return e})},function(e){return r.resolve(t()).then(function(){throw e})})},o.prototype.catch=function(e){return this.then(null,e)},o.prototype.then=function(e,t){if("function"!=typeof e&&this.state===a||"function"!=typeof t&&this.state===s)return this;var r=new this.constructor(u);this.state!==n?f(r,this.state===a?e:t,this.outcome):this.queue.push(new h(r,e,t));return r},h.prototype.callFulfilled=function(e){l.resolve(this.promise,e)},h.prototype.otherCallFulfilled=function(e){f(this.promise,this.onFulfilled,e)},h.prototype.callRejected=function(e){l.reject(this.promise,e)},h.prototype.otherCallRejected=function(e){f(this.promise,this.onRejected,e)},l.resolve=function(e,t){var r=p(c,t);if("error"===r.status)return l.reject(e,r.value);var n=r.value;if(n)d(e,n);else{e.state=a,e.outcome=t;for(var i=-1,s=e.queue.length;++i<s;)e.queue[i].callFulfilled(t)}return e},l.reject=function(e,t){e.state=s,e.outcome=t;for(var r=-1,n=e.queue.length;++r<n;)e.queue[r].callRejected(t);return e},o.resolve=function(e){if(e instanceof this)return e;return l.resolve(new this(u),e)},o.reject=function(e){var t=new this(u);return l.reject(t,e)},o.all=function(e){var r=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var n=e.length,i=!1;if(!n)return this.resolve([]);var s=new Array(n),a=0,t=-1,o=new this(u);for(;++t<n;)h(e[t],t);return o;function h(e,t){r.resolve(e).then(function(e){s[t]=e,++a!==n||i||(i=!0,l.resolve(o,s))},function(e){i||(i=!0,l.reject(o,e))})}},o.race=function(e){var t=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var r=e.length,n=!1;if(!r)return this.resolve([]);var i=-1,s=new this(u);for(;++i<r;)a=e[i],t.resolve(a).then(function(e){n||(n=!0,l.resolve(s,e))},function(e){n||(n=!0,l.reject(s,e))});var a;return s}},{immediate:36}],38:[function(e,t,r){"use strict";var n={};(0,e("./lib/utils/common").assign)(n,e("./lib/deflate"),e("./lib/inflate"),e("./lib/zlib/constants")),t.exports=n},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(e,t,r){"use strict";var a=e("./zlib/deflate"),o=e("./utils/common"),h=e("./utils/strings"),i=e("./zlib/messages"),s=e("./zlib/zstream"),u=Object.prototype.toString,l=0,f=-1,c=0,d=8;function p(e){if(!(this instanceof p))return new p(e);this.options=o.assign({level:f,method:d,chunkSize:16384,windowBits:15,memLevel:8,strategy:c,to:""},e||{});var t=this.options;t.raw&&0<t.windowBits?t.windowBits=-t.windowBits:t.gzip&&0<t.windowBits&&t.windowBits<16&&(t.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new s,this.strm.avail_out=0;var r=a.deflateInit2(this.strm,t.level,t.method,t.windowBits,t.memLevel,t.strategy);if(r!==l)throw new Error(i[r]);if(t.header&&a.deflateSetHeader(this.strm,t.header),t.dictionary){var n;if(n="string"==typeof t.dictionary?h.string2buf(t.dictionary):"[object ArrayBuffer]"===u.call(t.dictionary)?new Uint8Array(t.dictionary):t.dictionary,(r=a.deflateSetDictionary(this.strm,n))!==l)throw new Error(i[r]);this._dict_set=!0}}function n(e,t){var r=new p(t);if(r.push(e,!0),r.err)throw r.msg||i[r.err];return r.result}p.prototype.push=function(e,t){var r,n,i=this.strm,s=this.options.chunkSize;if(this.ended)return!1;n=t===~~t?t:!0===t?4:0,"string"==typeof e?i.input=h.string2buf(e):"[object ArrayBuffer]"===u.call(e)?i.input=new Uint8Array(e):i.input=e,i.next_in=0,i.avail_in=i.input.length;do{if(0===i.avail_out&&(i.output=new o.Buf8(s),i.next_out=0,i.avail_out=s),1!==(r=a.deflate(i,n))&&r!==l)return this.onEnd(r),!(this.ended=!0);0!==i.avail_out&&(0!==i.avail_in||4!==n&&2!==n)||("string"===this.options.to?this.onData(h.buf2binstring(o.shrinkBuf(i.output,i.next_out))):this.onData(o.shrinkBuf(i.output,i.next_out)))}while((0<i.avail_in||0===i.avail_out)&&1!==r);return 4===n?(r=a.deflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===l):2!==n||(this.onEnd(l),!(i.avail_out=0))},p.prototype.onData=function(e){this.chunks.push(e)},p.prototype.onEnd=function(e){e===l&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Deflate=p,r.deflate=n,r.deflateRaw=function(e,t){return(t=t||{}).raw=!0,n(e,t)},r.gzip=function(e,t){return(t=t||{}).gzip=!0,n(e,t)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(e,t,r){"use strict";var c=e("./zlib/inflate"),d=e("./utils/common"),p=e("./utils/strings"),m=e("./zlib/constants"),n=e("./zlib/messages"),i=e("./zlib/zstream"),s=e("./zlib/gzheader"),_=Object.prototype.toString;function a(e){if(!(this instanceof a))return new a(e);this.options=d.assign({chunkSize:16384,windowBits:0,to:""},e||{});var t=this.options;t.raw&&0<=t.windowBits&&t.windowBits<16&&(t.windowBits=-t.windowBits,0===t.windowBits&&(t.windowBits=-15)),!(0<=t.windowBits&&t.windowBits<16)||e&&e.windowBits||(t.windowBits+=32),15<t.windowBits&&t.windowBits<48&&0==(15&t.windowBits)&&(t.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new i,this.strm.avail_out=0;var r=c.inflateInit2(this.strm,t.windowBits);if(r!==m.Z_OK)throw new Error(n[r]);this.header=new s,c.inflateGetHeader(this.strm,this.header)}function o(e,t){var r=new a(t);if(r.push(e,!0),r.err)throw r.msg||n[r.err];return r.result}a.prototype.push=function(e,t){var r,n,i,s,a,o,h=this.strm,u=this.options.chunkSize,l=this.options.dictionary,f=!1;if(this.ended)return!1;n=t===~~t?t:!0===t?m.Z_FINISH:m.Z_NO_FLUSH,"string"==typeof e?h.input=p.binstring2buf(e):"[object ArrayBuffer]"===_.call(e)?h.input=new Uint8Array(e):h.input=e,h.next_in=0,h.avail_in=h.input.length;do{if(0===h.avail_out&&(h.output=new d.Buf8(u),h.next_out=0,h.avail_out=u),(r=c.inflate(h,m.Z_NO_FLUSH))===m.Z_NEED_DICT&&l&&(o="string"==typeof l?p.string2buf(l):"[object ArrayBuffer]"===_.call(l)?new Uint8Array(l):l,r=c.inflateSetDictionary(this.strm,o)),r===m.Z_BUF_ERROR&&!0===f&&(r=m.Z_OK,f=!1),r!==m.Z_STREAM_END&&r!==m.Z_OK)return this.onEnd(r),!(this.ended=!0);h.next_out&&(0!==h.avail_out&&r!==m.Z_STREAM_END&&(0!==h.avail_in||n!==m.Z_FINISH&&n!==m.Z_SYNC_FLUSH)||("string"===this.options.to?(i=p.utf8border(h.output,h.next_out),s=h.next_out-i,a=p.buf2string(h.output,i),h.next_out=s,h.avail_out=u-s,s&&d.arraySet(h.output,h.output,i,s,0),this.onData(a)):this.onData(d.shrinkBuf(h.output,h.next_out)))),0===h.avail_in&&0===h.avail_out&&(f=!0)}while((0<h.avail_in||0===h.avail_out)&&r!==m.Z_STREAM_END);return r===m.Z_STREAM_END&&(n=m.Z_FINISH),n===m.Z_FINISH?(r=c.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===m.Z_OK):n!==m.Z_SYNC_FLUSH||(this.onEnd(m.Z_OK),!(h.avail_out=0))},a.prototype.onData=function(e){this.chunks.push(e)},a.prototype.onEnd=function(e){e===m.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=d.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Inflate=a,r.inflate=o,r.inflateRaw=function(e,t){return(t=t||{}).raw=!0,o(e,t)},r.ungzip=o},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;r.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var r=t.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var n in r)r.hasOwnProperty(n)&&(e[n]=r[n])}}return e},r.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var i={arraySet:function(e,t,r,n,i){if(t.subarray&&e.subarray)e.set(t.subarray(r,r+n),i);else for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){var t,r,n,i,s,a;for(t=n=0,r=e.length;t<r;t++)n+=e[t].length;for(a=new Uint8Array(n),t=i=0,r=e.length;t<r;t++)s=e[t],a.set(s,i),i+=s.length;return a}},s={arraySet:function(e,t,r,n,i){for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){return[].concat.apply([],e)}};r.setTyped=function(e){e?(r.Buf8=Uint8Array,r.Buf16=Uint16Array,r.Buf32=Int32Array,r.assign(r,i)):(r.Buf8=Array,r.Buf16=Array,r.Buf32=Array,r.assign(r,s))},r.setTyped(n)},{}],42:[function(e,t,r){"use strict";var h=e("./common"),i=!0,s=!0;try{String.fromCharCode.apply(null,[0])}catch(e){i=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(e){s=!1}for(var u=new h.Buf8(256),n=0;n<256;n++)u[n]=252<=n?6:248<=n?5:240<=n?4:224<=n?3:192<=n?2:1;function l(e,t){if(t<65537&&(e.subarray&&s||!e.subarray&&i))return String.fromCharCode.apply(null,h.shrinkBuf(e,t));for(var r="",n=0;n<t;n++)r+=String.fromCharCode(e[n]);return r}u[254]=u[254]=1,r.string2buf=function(e){var t,r,n,i,s,a=e.length,o=0;for(i=0;i<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),o+=r<128?1:r<2048?2:r<65536?3:4;for(t=new h.Buf8(o),i=s=0;s<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t},r.buf2binstring=function(e){return l(e,e.length)},r.binstring2buf=function(e){for(var t=new h.Buf8(e.length),r=0,n=t.length;r<n;r++)t[r]=e.charCodeAt(r);return t},r.buf2string=function(e,t){var r,n,i,s,a=t||e.length,o=new Array(2*a);for(r=n=0;r<a;)if((i=e[r++])<128)o[n++]=i;else if(4<(s=u[i]))o[n++]=65533,r+=s-1;else{for(i&=2===s?31:3===s?15:7;1<s&&r<a;)i=i<<6|63&e[r++],s--;1<s?o[n++]=65533:i<65536?o[n++]=i:(i-=65536,o[n++]=55296|i>>10&1023,o[n++]=56320|1023&i)}return l(o,n)},r.utf8border=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}},{"./common":41}],43:[function(e,t,r){"use strict";t.exports=function(e,t,r,n){for(var i=65535&e|0,s=e>>>16&65535|0,a=0;0!==r;){for(r-=a=2e3<r?2e3:r;s=s+(i=i+t[n++]|0)|0,--a;);i%=65521,s%=65521}return i|s<<16|0}},{}],44:[function(e,t,r){"use strict";t.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(e,t,r){"use strict";var o=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t[a])];return-1^e}},{}],46:[function(e,t,r){"use strict";var h,c=e("../utils/common"),u=e("./trees"),d=e("./adler32"),p=e("./crc32"),n=e("./messages"),l=0,f=4,m=0,_=-2,g=-1,b=4,i=2,v=8,y=9,s=286,a=30,o=19,w=2*s+1,k=15,x=3,S=258,z=S+x+1,C=42,E=113,A=1,I=2,O=3,B=4;function R(e,t){return e.msg=n[t],t}function T(e){return(e<<1)-(4<e?9:0)}function D(e){for(var t=e.length;0<=--t;)e[t]=0}function F(e){var t=e.state,r=t.pending;r>e.avail_out&&(r=e.avail_out),0!==r&&(c.arraySet(e.output,t.pending_buf,t.pending_out,r,e.next_out),e.next_out+=r,t.pending_out+=r,e.total_out+=r,e.avail_out-=r,t.pending-=r,0===t.pending&&(t.pending_out=0))}function N(e,t){u._tr_flush_block(e,0<=e.block_start?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,F(e.strm)}function U(e,t){e.pending_buf[e.pending++]=t}function P(e,t){e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=255&t}function L(e,t){var r,n,i=e.max_chain_length,s=e.strstart,a=e.prev_length,o=e.nice_match,h=e.strstart>e.w_size-z?e.strstart-(e.w_size-z):0,u=e.window,l=e.w_mask,f=e.prev,c=e.strstart+S,d=u[s+a-1],p=u[s+a];e.prev_length>=e.good_match&&(i>>=2),o>e.lookahead&&(o=e.lookahead);do{if(u[(r=t)+a]===p&&u[r+a-1]===d&&u[r]===u[s]&&u[++r]===u[s+1]){s+=2,r++;do{}while(u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&s<c);if(n=S-(c-s),s=c-S,a<n){if(e.match_start=t,o<=(a=n))break;d=u[s+a-1],p=u[s+a]}}}while((t=f[t&l])>h&&0!=--i);return a<=e.lookahead?a:e.lookahead}function j(e){var t,r,n,i,s,a,o,h,u,l,f=e.w_size;do{if(i=e.window_size-e.lookahead-e.strstart,e.strstart>=f+(f-z)){for(c.arraySet(e.window,e.window,f,f,0),e.match_start-=f,e.strstart-=f,e.block_start-=f,t=r=e.hash_size;n=e.head[--t],e.head[t]=f<=n?n-f:0,--r;);for(t=r=f;n=e.prev[--t],e.prev[t]=f<=n?n-f:0,--r;);i+=f}if(0===e.strm.avail_in)break;if(a=e.strm,o=e.window,h=e.strstart+e.lookahead,u=i,l=void 0,l=a.avail_in,u<l&&(l=u),r=0===l?0:(a.avail_in-=l,c.arraySet(o,a.input,a.next_in,l,h),1===a.state.wrap?a.adler=d(a.adler,o,l,h):2===a.state.wrap&&(a.adler=p(a.adler,o,l,h)),a.next_in+=l,a.total_in+=l,l),e.lookahead+=r,e.lookahead+e.insert>=x)for(s=e.strstart-e.insert,e.ins_h=e.window[s],e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+x-1])&e.hash_mask,e.prev[s&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=s,s++,e.insert--,!(e.lookahead+e.insert<x)););}while(e.lookahead<z&&0!==e.strm.avail_in)}function Z(e,t){for(var r,n;;){if(e.lookahead<z){if(j(e),e.lookahead<z&&t===l)return A;if(0===e.lookahead)break}if(r=0,e.lookahead>=x&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!==r&&e.strstart-r<=e.w_size-z&&(e.match_length=L(e,r)),e.match_length>=x)if(n=u._tr_tally(e,e.strstart-e.match_start,e.match_length-x),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=x){for(e.match_length--;e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart,0!=--e.match_length;);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else n=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(n&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=e.strstart<x-1?e.strstart:x-1,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}function W(e,t){for(var r,n,i;;){if(e.lookahead<z){if(j(e),e.lookahead<z&&t===l)return A;if(0===e.lookahead)break}if(r=0,e.lookahead>=x&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=x-1,0!==r&&e.prev_length<e.max_lazy_match&&e.strstart-r<=e.w_size-z&&(e.match_length=L(e,r),e.match_length<=5&&(1===e.strategy||e.match_length===x&&4096<e.strstart-e.match_start)&&(e.match_length=x-1)),e.prev_length>=x&&e.match_length<=e.prev_length){for(i=e.strstart+e.lookahead-x,n=u._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-x),e.lookahead-=e.prev_length-1,e.prev_length-=2;++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!=--e.prev_length;);if(e.match_available=0,e.match_length=x-1,e.strstart++,n&&(N(e,!1),0===e.strm.avail_out))return A}else if(e.match_available){if((n=u._tr_tally(e,0,e.window[e.strstart-1]))&&N(e,!1),e.strstart++,e.lookahead--,0===e.strm.avail_out)return A}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(n=u._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<x-1?e.strstart:x-1,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}function M(e,t,r,n,i){this.good_length=e,this.max_lazy=t,this.nice_length=r,this.max_chain=n,this.func=i}function H(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=v,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new c.Buf16(2*w),this.dyn_dtree=new c.Buf16(2*(2*a+1)),this.bl_tree=new c.Buf16(2*(2*o+1)),D(this.dyn_ltree),D(this.dyn_dtree),D(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new c.Buf16(k+1),this.heap=new c.Buf16(2*s+1),D(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new c.Buf16(2*s+1),D(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function G(e){var t;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=i,(t=e.state).pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap?C:E,e.adler=2===t.wrap?0:1,t.last_flush=l,u._tr_init(t),m):R(e,_)}function K(e){var t=G(e);return t===m&&function(e){e.window_size=2*e.w_size,D(e.head),e.max_lazy_match=h[e.level].max_lazy,e.good_match=h[e.level].good_length,e.nice_match=h[e.level].nice_length,e.max_chain_length=h[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=x-1,e.match_available=0,e.ins_h=0}(e.state),t}function Y(e,t,r,n,i,s){if(!e)return _;var a=1;if(t===g&&(t=6),n<0?(a=0,n=-n):15<n&&(a=2,n-=16),i<1||y<i||r!==v||n<8||15<n||t<0||9<t||s<0||b<s)return R(e,_);8===n&&(n=9);var o=new H;return(e.state=o).strm=e,o.wrap=a,o.gzhead=null,o.w_bits=n,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=i+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+x-1)/x),o.window=new c.Buf8(2*o.w_size),o.head=new c.Buf16(o.hash_size),o.prev=new c.Buf16(o.w_size),o.lit_bufsize=1<<i+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new c.Buf8(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=t,o.strategy=s,o.method=r,K(e)}h=[new M(0,0,0,0,function(e,t){var r=65535;for(r>e.pending_buf_size-5&&(r=e.pending_buf_size-5);;){if(e.lookahead<=1){if(j(e),0===e.lookahead&&t===l)return A;if(0===e.lookahead)break}e.strstart+=e.lookahead,e.lookahead=0;var n=e.block_start+r;if((0===e.strstart||e.strstart>=n)&&(e.lookahead=e.strstart-n,e.strstart=n,N(e,!1),0===e.strm.avail_out))return A;if(e.strstart-e.block_start>=e.w_size-z&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):(e.strstart>e.block_start&&(N(e,!1),e.strm.avail_out),A)}),new M(4,4,8,4,Z),new M(4,5,16,8,Z),new M(4,6,32,32,Z),new M(4,4,16,16,W),new M(8,16,32,32,W),new M(8,16,128,128,W),new M(8,32,128,256,W),new M(32,128,258,1024,W),new M(32,258,258,4096,W)],r.deflateInit=function(e,t){return Y(e,t,v,15,8,0)},r.deflateInit2=Y,r.deflateReset=K,r.deflateResetKeep=G,r.deflateSetHeader=function(e,t){return e&&e.state?2!==e.state.wrap?_:(e.state.gzhead=t,m):_},r.deflate=function(e,t){var r,n,i,s;if(!e||!e.state||5<t||t<0)return e?R(e,_):_;if(n=e.state,!e.output||!e.input&&0!==e.avail_in||666===n.status&&t!==f)return R(e,0===e.avail_out?-5:_);if(n.strm=e,r=n.last_flush,n.last_flush=t,n.status===C)if(2===n.wrap)e.adler=0,U(n,31),U(n,139),U(n,8),n.gzhead?(U(n,(n.gzhead.text?1:0)+(n.gzhead.hcrc?2:0)+(n.gzhead.extra?4:0)+(n.gzhead.name?8:0)+(n.gzhead.comment?16:0)),U(n,255&n.gzhead.time),U(n,n.gzhead.time>>8&255),U(n,n.gzhead.time>>16&255),U(n,n.gzhead.time>>24&255),U(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),U(n,255&n.gzhead.os),n.gzhead.extra&&n.gzhead.extra.length&&(U(n,255&n.gzhead.extra.length),U(n,n.gzhead.extra.length>>8&255)),n.gzhead.hcrc&&(e.adler=p(e.adler,n.pending_buf,n.pending,0)),n.gzindex=0,n.status=69):(U(n,0),U(n,0),U(n,0),U(n,0),U(n,0),U(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),U(n,3),n.status=E);else{var a=v+(n.w_bits-8<<4)<<8;a|=(2<=n.strategy||n.level<2?0:n.level<6?1:6===n.level?2:3)<<6,0!==n.strstart&&(a|=32),a+=31-a%31,n.status=E,P(n,a),0!==n.strstart&&(P(n,e.adler>>>16),P(n,65535&e.adler)),e.adler=1}if(69===n.status)if(n.gzhead.extra){for(i=n.pending;n.gzindex<(65535&n.gzhead.extra.length)&&(n.pending!==n.pending_buf_size||(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending!==n.pending_buf_size));)U(n,255&n.gzhead.extra[n.gzindex]),n.gzindex++;n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),n.gzindex===n.gzhead.extra.length&&(n.gzindex=0,n.status=73)}else n.status=73;if(73===n.status)if(n.gzhead.name){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.name.length?255&n.gzhead.name.charCodeAt(n.gzindex++):0,U(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.gzindex=0,n.status=91)}else n.status=91;if(91===n.status)if(n.gzhead.comment){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.comment.length?255&n.gzhead.comment.charCodeAt(n.gzindex++):0,U(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.status=103)}else n.status=103;if(103===n.status&&(n.gzhead.hcrc?(n.pending+2>n.pending_buf_size&&F(e),n.pending+2<=n.pending_buf_size&&(U(n,255&e.adler),U(n,e.adler>>8&255),e.adler=0,n.status=E)):n.status=E),0!==n.pending){if(F(e),0===e.avail_out)return n.last_flush=-1,m}else if(0===e.avail_in&&T(t)<=T(r)&&t!==f)return R(e,-5);if(666===n.status&&0!==e.avail_in)return R(e,-5);if(0!==e.avail_in||0!==n.lookahead||t!==l&&666!==n.status){var o=2===n.strategy?function(e,t){for(var r;;){if(0===e.lookahead&&(j(e),0===e.lookahead)){if(t===l)return A;break}if(e.match_length=0,r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,r&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}(n,t):3===n.strategy?function(e,t){for(var r,n,i,s,a=e.window;;){if(e.lookahead<=S){if(j(e),e.lookahead<=S&&t===l)return A;if(0===e.lookahead)break}if(e.match_length=0,e.lookahead>=x&&0<e.strstart&&(n=a[i=e.strstart-1])===a[++i]&&n===a[++i]&&n===a[++i]){s=e.strstart+S;do{}while(n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&i<s);e.match_length=S-(s-i),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=x?(r=u._tr_tally(e,1,e.match_length-x),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),r&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}(n,t):h[n.level].func(n,t);if(o!==O&&o!==B||(n.status=666),o===A||o===O)return 0===e.avail_out&&(n.last_flush=-1),m;if(o===I&&(1===t?u._tr_align(n):5!==t&&(u._tr_stored_block(n,0,0,!1),3===t&&(D(n.head),0===n.lookahead&&(n.strstart=0,n.block_start=0,n.insert=0))),F(e),0===e.avail_out))return n.last_flush=-1,m}return t!==f?m:n.wrap<=0?1:(2===n.wrap?(U(n,255&e.adler),U(n,e.adler>>8&255),U(n,e.adler>>16&255),U(n,e.adler>>24&255),U(n,255&e.total_in),U(n,e.total_in>>8&255),U(n,e.total_in>>16&255),U(n,e.total_in>>24&255)):(P(n,e.adler>>>16),P(n,65535&e.adler)),F(e),0<n.wrap&&(n.wrap=-n.wrap),0!==n.pending?m:1)},r.deflateEnd=function(e){var t;return e&&e.state?(t=e.state.status)!==C&&69!==t&&73!==t&&91!==t&&103!==t&&t!==E&&666!==t?R(e,_):(e.state=null,t===E?R(e,-3):m):_},r.deflateSetDictionary=function(e,t){var r,n,i,s,a,o,h,u,l=t.length;if(!e||!e.state)return _;if(2===(s=(r=e.state).wrap)||1===s&&r.status!==C||r.lookahead)return _;for(1===s&&(e.adler=d(e.adler,t,l,0)),r.wrap=0,l>=r.w_size&&(0===s&&(D(r.head),r.strstart=0,r.block_start=0,r.insert=0),u=new c.Buf8(r.w_size),c.arraySet(u,t,l-r.w_size,r.w_size,0),t=u,l=r.w_size),a=e.avail_in,o=e.next_in,h=e.input,e.avail_in=l,e.next_in=0,e.input=t,j(r);r.lookahead>=x;){for(n=r.strstart,i=r.lookahead-(x-1);r.ins_h=(r.ins_h<<r.hash_shift^r.window[n+x-1])&r.hash_mask,r.prev[n&r.w_mask]=r.head[r.ins_h],r.head[r.ins_h]=n,n++,--i;);r.strstart=n,r.lookahead=x-1,j(r)}return r.strstart+=r.lookahead,r.block_start=r.strstart,r.insert=r.lookahead,r.lookahead=0,r.match_length=r.prev_length=x-1,r.match_available=0,e.next_in=o,e.input=h,e.avail_in=a,r.wrap=s,m},r.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(e,t,r){"use strict";t.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(e,t,r){"use strict";t.exports=function(e,t){var r,n,i,s,a,o,h,u,l,f,c,d,p,m,_,g,b,v,y,w,k,x,S,z,C;r=e.state,n=e.next_in,z=e.input,i=n+(e.avail_in-5),s=e.next_out,C=e.output,a=s-(t-e.avail_out),o=s+(e.avail_out-257),h=r.dmax,u=r.wsize,l=r.whave,f=r.wnext,c=r.window,d=r.hold,p=r.bits,m=r.lencode,_=r.distcode,g=(1<<r.lenbits)-1,b=(1<<r.distbits)-1;e:do{p<15&&(d+=z[n++]<<p,p+=8,d+=z[n++]<<p,p+=8),v=m[d&g];t:for(;;){if(d>>>=y=v>>>24,p-=y,0===(y=v>>>16&255))C[s++]=65535&v;else{if(!(16&y)){if(0==(64&y)){v=m[(65535&v)+(d&(1<<y)-1)];continue t}if(32&y){r.mode=12;break e}e.msg="invalid literal/length code",r.mode=30;break e}w=65535&v,(y&=15)&&(p<y&&(d+=z[n++]<<p,p+=8),w+=d&(1<<y)-1,d>>>=y,p-=y),p<15&&(d+=z[n++]<<p,p+=8,d+=z[n++]<<p,p+=8),v=_[d&b];r:for(;;){if(d>>>=y=v>>>24,p-=y,!(16&(y=v>>>16&255))){if(0==(64&y)){v=_[(65535&v)+(d&(1<<y)-1)];continue r}e.msg="invalid distance code",r.mode=30;break e}if(k=65535&v,p<(y&=15)&&(d+=z[n++]<<p,(p+=8)<y&&(d+=z[n++]<<p,p+=8)),h<(k+=d&(1<<y)-1)){e.msg="invalid distance too far back",r.mode=30;break e}if(d>>>=y,p-=y,(y=s-a)<k){if(l<(y=k-y)&&r.sane){e.msg="invalid distance too far back",r.mode=30;break e}if(S=c,(x=0)===f){if(x+=u-y,y<w){for(w-=y;C[s++]=c[x++],--y;);x=s-k,S=C}}else if(f<y){if(x+=u+f-y,(y-=f)<w){for(w-=y;C[s++]=c[x++],--y;);if(x=0,f<w){for(w-=y=f;C[s++]=c[x++],--y;);x=s-k,S=C}}}else if(x+=f-y,y<w){for(w-=y;C[s++]=c[x++],--y;);x=s-k,S=C}for(;2<w;)C[s++]=S[x++],C[s++]=S[x++],C[s++]=S[x++],w-=3;w&&(C[s++]=S[x++],1<w&&(C[s++]=S[x++]))}else{for(x=s-k;C[s++]=C[x++],C[s++]=C[x++],C[s++]=C[x++],2<(w-=3););w&&(C[s++]=C[x++],1<w&&(C[s++]=C[x++]))}break}}break}}while(n<i&&s<o);n-=w=p>>3,d&=(1<<(p-=w<<3))-1,e.next_in=n,e.next_out=s,e.avail_in=n<i?i-n+5:5-(n-i),e.avail_out=s<o?o-s+257:257-(s-o),r.hold=d,r.bits=p}},{}],49:[function(e,t,r){"use strict";var I=e("../utils/common"),O=e("./adler32"),B=e("./crc32"),R=e("./inffast"),T=e("./inftrees"),D=1,F=2,N=0,U=-2,P=1,n=852,i=592;function L(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function s(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new I.Buf16(320),this.work=new I.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function a(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=P,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new I.Buf32(n),t.distcode=t.distdyn=new I.Buf32(i),t.sane=1,t.back=-1,N):U}function o(e){var t;return e&&e.state?((t=e.state).wsize=0,t.whave=0,t.wnext=0,a(e)):U}function h(e,t){var r,n;return e&&e.state?(n=e.state,t<0?(r=0,t=-t):(r=1+(t>>4),t<48&&(t&=15)),t&&(t<8||15<t)?U:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=r,n.wbits=t,o(e))):U}function u(e,t){var r,n;return e?(n=new s,(e.state=n).window=null,(r=h(e,t))!==N&&(e.state=null),r):U}var l,f,c=!0;function j(e){if(c){var t;for(l=new I.Buf32(512),f=new I.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(T(D,e.lens,0,288,l,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;T(F,e.lens,0,32,f,0,e.work,{bits:5}),c=!1}e.lencode=l,e.lenbits=9,e.distcode=f,e.distbits=5}function Z(e,t,r,n){var i,s=e.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new I.Buf8(s.wsize)),n>=s.wsize?(I.arraySet(s.window,t,r-s.wsize,s.wsize,0),s.wnext=0,s.whave=s.wsize):(n<(i=s.wsize-s.wnext)&&(i=n),I.arraySet(s.window,t,r-n,i,s.wnext),(n-=i)?(I.arraySet(s.window,t,r-n,n,0),s.wnext=n,s.whave=s.wsize):(s.wnext+=i,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=i))),0}r.inflateReset=o,r.inflateReset2=h,r.inflateResetKeep=a,r.inflateInit=function(e){return u(e,15)},r.inflateInit2=u,r.inflate=function(e,t){var r,n,i,s,a,o,h,u,l,f,c,d,p,m,_,g,b,v,y,w,k,x,S,z,C=0,E=new I.Buf8(4),A=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return U;12===(r=e.state).mode&&(r.mode=13),a=e.next_out,i=e.output,h=e.avail_out,s=e.next_in,n=e.input,o=e.avail_in,u=r.hold,l=r.bits,f=o,c=h,x=N;e:for(;;)switch(r.mode){case P:if(0===r.wrap){r.mode=13;break}for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(2&r.wrap&&35615===u){E[r.check=0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0),l=u=0,r.mode=2;break}if(r.flags=0,r.head&&(r.head.done=!1),!(1&r.wrap)||(((255&u)<<8)+(u>>8))%31){e.msg="incorrect header check",r.mode=30;break}if(8!=(15&u)){e.msg="unknown compression method",r.mode=30;break}if(l-=4,k=8+(15&(u>>>=4)),0===r.wbits)r.wbits=k;else if(k>r.wbits){e.msg="invalid window size",r.mode=30;break}r.dmax=1<<k,e.adler=r.check=1,r.mode=512&u?10:12,l=u=0;break;case 2:for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(r.flags=u,8!=(255&r.flags)){e.msg="unknown compression method",r.mode=30;break}if(57344&r.flags){e.msg="unknown header flags set",r.mode=30;break}r.head&&(r.head.text=u>>8&1),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=3;case 3:for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.head&&(r.head.time=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,E[2]=u>>>16&255,E[3]=u>>>24&255,r.check=B(r.check,E,4,0)),l=u=0,r.mode=4;case 4:for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.head&&(r.head.xflags=255&u,r.head.os=u>>8),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=5;case 5:if(1024&r.flags){for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.length=u,r.head&&(r.head.extra_len=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0}else r.head&&(r.head.extra=null);r.mode=6;case 6:if(1024&r.flags&&(o<(d=r.length)&&(d=o),d&&(r.head&&(k=r.head.extra_len-r.length,r.head.extra||(r.head.extra=new Array(r.head.extra_len)),I.arraySet(r.head.extra,n,s,d,k)),512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,r.length-=d),r.length))break e;r.length=0,r.mode=7;case 7:if(2048&r.flags){if(0===o)break e;for(d=0;k=n[s+d++],r.head&&k&&r.length<65536&&(r.head.name+=String.fromCharCode(k)),k&&d<o;);if(512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,k)break e}else r.head&&(r.head.name=null);r.length=0,r.mode=8;case 8:if(4096&r.flags){if(0===o)break e;for(d=0;k=n[s+d++],r.head&&k&&r.length<65536&&(r.head.comment+=String.fromCharCode(k)),k&&d<o;);if(512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,k)break e}else r.head&&(r.head.comment=null);r.mode=9;case 9:if(512&r.flags){for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u!==(65535&r.check)){e.msg="header crc mismatch",r.mode=30;break}l=u=0}r.head&&(r.head.hcrc=r.flags>>9&1,r.head.done=!0),e.adler=r.check=0,r.mode=12;break;case 10:for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}e.adler=r.check=L(u),l=u=0,r.mode=11;case 11:if(0===r.havedict)return e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,2;e.adler=r.check=1,r.mode=12;case 12:if(5===t||6===t)break e;case 13:if(r.last){u>>>=7&l,l-=7&l,r.mode=27;break}for(;l<3;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}switch(r.last=1&u,l-=1,3&(u>>>=1)){case 0:r.mode=14;break;case 1:if(j(r),r.mode=20,6!==t)break;u>>>=2,l-=2;break e;case 2:r.mode=17;break;case 3:e.msg="invalid block type",r.mode=30}u>>>=2,l-=2;break;case 14:for(u>>>=7&l,l-=7&l;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if((65535&u)!=(u>>>16^65535)){e.msg="invalid stored block lengths",r.mode=30;break}if(r.length=65535&u,l=u=0,r.mode=15,6===t)break e;case 15:r.mode=16;case 16:if(d=r.length){if(o<d&&(d=o),h<d&&(d=h),0===d)break e;I.arraySet(i,n,s,d,a),o-=d,s+=d,h-=d,a+=d,r.length-=d;break}r.mode=12;break;case 17:for(;l<14;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(r.nlen=257+(31&u),u>>>=5,l-=5,r.ndist=1+(31&u),u>>>=5,l-=5,r.ncode=4+(15&u),u>>>=4,l-=4,286<r.nlen||30<r.ndist){e.msg="too many length or distance symbols",r.mode=30;break}r.have=0,r.mode=18;case 18:for(;r.have<r.ncode;){for(;l<3;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.lens[A[r.have++]]=7&u,u>>>=3,l-=3}for(;r.have<19;)r.lens[A[r.have++]]=0;if(r.lencode=r.lendyn,r.lenbits=7,S={bits:r.lenbits},x=T(0,r.lens,0,19,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid code lengths set",r.mode=30;break}r.have=0,r.mode=19;case 19:for(;r.have<r.nlen+r.ndist;){for(;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(b<16)u>>>=_,l-=_,r.lens[r.have++]=b;else{if(16===b){for(z=_+2;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u>>>=_,l-=_,0===r.have){e.msg="invalid bit length repeat",r.mode=30;break}k=r.lens[r.have-1],d=3+(3&u),u>>>=2,l-=2}else if(17===b){for(z=_+3;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}l-=_,k=0,d=3+(7&(u>>>=_)),u>>>=3,l-=3}else{for(z=_+7;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}l-=_,k=0,d=11+(127&(u>>>=_)),u>>>=7,l-=7}if(r.have+d>r.nlen+r.ndist){e.msg="invalid bit length repeat",r.mode=30;break}for(;d--;)r.lens[r.have++]=k}}if(30===r.mode)break;if(0===r.lens[256]){e.msg="invalid code -- missing end-of-block",r.mode=30;break}if(r.lenbits=9,S={bits:r.lenbits},x=T(D,r.lens,0,r.nlen,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid literal/lengths set",r.mode=30;break}if(r.distbits=6,r.distcode=r.distdyn,S={bits:r.distbits},x=T(F,r.lens,r.nlen,r.ndist,r.distcode,0,r.work,S),r.distbits=S.bits,x){e.msg="invalid distances set",r.mode=30;break}if(r.mode=20,6===t)break e;case 20:r.mode=21;case 21:if(6<=o&&258<=h){e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,R(e,c),a=e.next_out,i=e.output,h=e.avail_out,s=e.next_in,n=e.input,o=e.avail_in,u=r.hold,l=r.bits,12===r.mode&&(r.back=-1);break}for(r.back=0;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(g&&0==(240&g)){for(v=_,y=g,w=b;g=(C=r.lencode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,r.length=b,0===g){r.mode=26;break}if(32&g){r.back=-1,r.mode=12;break}if(64&g){e.msg="invalid literal/length code",r.mode=30;break}r.extra=15&g,r.mode=22;case 22:if(r.extra){for(z=r.extra;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.length+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}r.was=r.length,r.mode=23;case 23:for(;g=(C=r.distcode[u&(1<<r.distbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(0==(240&g)){for(v=_,y=g,w=b;g=(C=r.distcode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,64&g){e.msg="invalid distance code",r.mode=30;break}r.offset=b,r.extra=15&g,r.mode=24;case 24:if(r.extra){for(z=r.extra;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.offset+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}if(r.offset>r.dmax){e.msg="invalid distance too far back",r.mode=30;break}r.mode=25;case 25:if(0===h)break e;if(d=c-h,r.offset>d){if((d=r.offset-d)>r.whave&&r.sane){e.msg="invalid distance too far back",r.mode=30;break}p=d>r.wnext?(d-=r.wnext,r.wsize-d):r.wnext-d,d>r.length&&(d=r.length),m=r.window}else m=i,p=a-r.offset,d=r.length;for(h<d&&(d=h),h-=d,r.length-=d;i[a++]=m[p++],--d;);0===r.length&&(r.mode=21);break;case 26:if(0===h)break e;i[a++]=r.length,h--,r.mode=21;break;case 27:if(r.wrap){for(;l<32;){if(0===o)break e;o--,u|=n[s++]<<l,l+=8}if(c-=h,e.total_out+=c,r.total+=c,c&&(e.adler=r.check=r.flags?B(r.check,i,c,a-c):O(r.check,i,c,a-c)),c=h,(r.flags?u:L(u))!==r.check){e.msg="incorrect data check",r.mode=30;break}l=u=0}r.mode=28;case 28:if(r.wrap&&r.flags){for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u!==(4294967295&r.total)){e.msg="incorrect length check",r.mode=30;break}l=u=0}r.mode=29;case 29:x=1;break e;case 30:x=-3;break e;case 31:return-4;case 32:default:return U}return e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,(r.wsize||c!==e.avail_out&&r.mode<30&&(r.mode<27||4!==t))&&Z(e,e.output,e.next_out,c-e.avail_out)?(r.mode=31,-4):(f-=e.avail_in,c-=e.avail_out,e.total_in+=f,e.total_out+=c,r.total+=c,r.wrap&&c&&(e.adler=r.check=r.flags?B(r.check,i,c,e.next_out-c):O(r.check,i,c,e.next_out-c)),e.data_type=r.bits+(r.last?64:0)+(12===r.mode?128:0)+(20===r.mode||15===r.mode?256:0),(0==f&&0===c||4===t)&&x===N&&(x=-5),x)},r.inflateEnd=function(e){if(!e||!e.state)return U;var t=e.state;return t.window&&(t.window=null),e.state=null,N},r.inflateGetHeader=function(e,t){var r;return e&&e.state?0==(2&(r=e.state).wrap)?U:((r.head=t).done=!1,N):U},r.inflateSetDictionary=function(e,t){var r,n=t.length;return e&&e.state?0!==(r=e.state).wrap&&11!==r.mode?U:11===r.mode&&O(1,t,n,0)!==r.check?-3:Z(e,t,n,n)?(r.mode=31,-4):(r.havedict=1,N):U},r.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(e,t,r){"use strict";var D=e("../utils/common"),F=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],N=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],U=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],P=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];t.exports=function(e,t,r,n,i,s,a,o){var h,u,l,f,c,d,p,m,_,g=o.bits,b=0,v=0,y=0,w=0,k=0,x=0,S=0,z=0,C=0,E=0,A=null,I=0,O=new D.Buf16(16),B=new D.Buf16(16),R=null,T=0;for(b=0;b<=15;b++)O[b]=0;for(v=0;v<n;v++)O[t[r+v]]++;for(k=g,w=15;1<=w&&0===O[w];w--);if(w<k&&(k=w),0===w)return i[s++]=20971520,i[s++]=20971520,o.bits=1,0;for(y=1;y<w&&0===O[y];y++);for(k<y&&(k=y),b=z=1;b<=15;b++)if(z<<=1,(z-=O[b])<0)return-1;if(0<z&&(0===e||1!==w))return-1;for(B[1]=0,b=1;b<15;b++)B[b+1]=B[b]+O[b];for(v=0;v<n;v++)0!==t[r+v]&&(a[B[t[r+v]]++]=v);if(d=0===e?(A=R=a,19):1===e?(A=F,I-=257,R=N,T-=257,256):(A=U,R=P,-1),b=y,c=s,S=v=E=0,l=-1,f=(C=1<<(x=k))-1,1===e&&852<C||2===e&&592<C)return 1;for(;;){for(p=b-S,_=a[v]<d?(m=0,a[v]):a[v]>d?(m=R[T+a[v]],A[I+a[v]]):(m=96,0),h=1<<b-S,y=u=1<<x;i[c+(E>>S)+(u-=h)]=p<<24|m<<16|_|0,0!==u;);for(h=1<<b-1;E&h;)h>>=1;if(0!==h?(E&=h-1,E+=h):E=0,v++,0==--O[b]){if(b===w)break;b=t[r+a[v]]}if(k<b&&(E&f)!==l){for(0===S&&(S=k),c+=y,z=1<<(x=b-S);x+S<w&&!((z-=O[x+S])<=0);)x++,z<<=1;if(C+=1<<x,1===e&&852<C||2===e&&592<C)return 1;i[l=E&f]=k<<24|x<<16|c-s|0}}return 0!==E&&(i[c+E]=b-S<<24|64<<16|0),o.bits=k,0}},{"../utils/common":41}],51:[function(e,t,r){"use strict";t.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(e,t,r){"use strict";var i=e("../utils/common"),o=0,h=1;function n(e){for(var t=e.length;0<=--t;)e[t]=0}var s=0,a=29,u=256,l=u+1+a,f=30,c=19,_=2*l+1,g=15,d=16,p=7,m=256,b=16,v=17,y=18,w=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],k=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],x=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],S=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],z=new Array(2*(l+2));n(z);var C=new Array(2*f);n(C);var E=new Array(512);n(E);var A=new Array(256);n(A);var I=new Array(a);n(I);var O,B,R,T=new Array(f);function D(e,t,r,n,i){this.static_tree=e,this.extra_bits=t,this.extra_base=r,this.elems=n,this.max_length=i,this.has_stree=e&&e.length}function F(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t}function N(e){return e<256?E[e]:E[256+(e>>>7)]}function U(e,t){e.pending_buf[e.pending++]=255&t,e.pending_buf[e.pending++]=t>>>8&255}function P(e,t,r){e.bi_valid>d-r?(e.bi_buf|=t<<e.bi_valid&65535,U(e,e.bi_buf),e.bi_buf=t>>d-e.bi_valid,e.bi_valid+=r-d):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=r)}function L(e,t,r){P(e,r[2*t],r[2*t+1])}function j(e,t){for(var r=0;r|=1&e,e>>>=1,r<<=1,0<--t;);return r>>>1}function Z(e,t,r){var n,i,s=new Array(g+1),a=0;for(n=1;n<=g;n++)s[n]=a=a+r[n-1]<<1;for(i=0;i<=t;i++){var o=e[2*i+1];0!==o&&(e[2*i]=j(s[o]++,o))}}function W(e){var t;for(t=0;t<l;t++)e.dyn_ltree[2*t]=0;for(t=0;t<f;t++)e.dyn_dtree[2*t]=0;for(t=0;t<c;t++)e.bl_tree[2*t]=0;e.dyn_ltree[2*m]=1,e.opt_len=e.static_len=0,e.last_lit=e.matches=0}function M(e){8<e.bi_valid?U(e,e.bi_buf):0<e.bi_valid&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0}function H(e,t,r,n){var i=2*t,s=2*r;return e[i]<e[s]||e[i]===e[s]&&n[t]<=n[r]}function G(e,t,r){for(var n=e.heap[r],i=r<<1;i<=e.heap_len&&(i<e.heap_len&&H(t,e.heap[i+1],e.heap[i],e.depth)&&i++,!H(t,n,e.heap[i],e.depth));)e.heap[r]=e.heap[i],r=i,i<<=1;e.heap[r]=n}function K(e,t,r){var n,i,s,a,o=0;if(0!==e.last_lit)for(;n=e.pending_buf[e.d_buf+2*o]<<8|e.pending_buf[e.d_buf+2*o+1],i=e.pending_buf[e.l_buf+o],o++,0===n?L(e,i,t):(L(e,(s=A[i])+u+1,t),0!==(a=w[s])&&P(e,i-=I[s],a),L(e,s=N(--n),r),0!==(a=k[s])&&P(e,n-=T[s],a)),o<e.last_lit;);L(e,m,t)}function Y(e,t){var r,n,i,s=t.dyn_tree,a=t.stat_desc.static_tree,o=t.stat_desc.has_stree,h=t.stat_desc.elems,u=-1;for(e.heap_len=0,e.heap_max=_,r=0;r<h;r++)0!==s[2*r]?(e.heap[++e.heap_len]=u=r,e.depth[r]=0):s[2*r+1]=0;for(;e.heap_len<2;)s[2*(i=e.heap[++e.heap_len]=u<2?++u:0)]=1,e.depth[i]=0,e.opt_len--,o&&(e.static_len-=a[2*i+1]);for(t.max_code=u,r=e.heap_len>>1;1<=r;r--)G(e,s,r);for(i=h;r=e.heap[1],e.heap[1]=e.heap[e.heap_len--],G(e,s,1),n=e.heap[1],e.heap[--e.heap_max]=r,e.heap[--e.heap_max]=n,s[2*i]=s[2*r]+s[2*n],e.depth[i]=(e.depth[r]>=e.depth[n]?e.depth[r]:e.depth[n])+1,s[2*r+1]=s[2*n+1]=i,e.heap[1]=i++,G(e,s,1),2<=e.heap_len;);e.heap[--e.heap_max]=e.heap[1],function(e,t){var r,n,i,s,a,o,h=t.dyn_tree,u=t.max_code,l=t.stat_desc.static_tree,f=t.stat_desc.has_stree,c=t.stat_desc.extra_bits,d=t.stat_desc.extra_base,p=t.stat_desc.max_length,m=0;for(s=0;s<=g;s++)e.bl_count[s]=0;for(h[2*e.heap[e.heap_max]+1]=0,r=e.heap_max+1;r<_;r++)p<(s=h[2*h[2*(n=e.heap[r])+1]+1]+1)&&(s=p,m++),h[2*n+1]=s,u<n||(e.bl_count[s]++,a=0,d<=n&&(a=c[n-d]),o=h[2*n],e.opt_len+=o*(s+a),f&&(e.static_len+=o*(l[2*n+1]+a)));if(0!==m){do{for(s=p-1;0===e.bl_count[s];)s--;e.bl_count[s]--,e.bl_count[s+1]+=2,e.bl_count[p]--,m-=2}while(0<m);for(s=p;0!==s;s--)for(n=e.bl_count[s];0!==n;)u<(i=e.heap[--r])||(h[2*i+1]!==s&&(e.opt_len+=(s-h[2*i+1])*h[2*i],h[2*i+1]=s),n--)}}(e,t),Z(s,u,e.bl_count)}function X(e,t,r){var n,i,s=-1,a=t[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),t[2*(r+1)+1]=65535,n=0;n<=r;n++)i=a,a=t[2*(n+1)+1],++o<h&&i===a||(o<u?e.bl_tree[2*i]+=o:0!==i?(i!==s&&e.bl_tree[2*i]++,e.bl_tree[2*b]++):o<=10?e.bl_tree[2*v]++:e.bl_tree[2*y]++,s=i,u=(o=0)===a?(h=138,3):i===a?(h=6,3):(h=7,4))}function V(e,t,r){var n,i,s=-1,a=t[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),n=0;n<=r;n++)if(i=a,a=t[2*(n+1)+1],!(++o<h&&i===a)){if(o<u)for(;L(e,i,e.bl_tree),0!=--o;);else 0!==i?(i!==s&&(L(e,i,e.bl_tree),o--),L(e,b,e.bl_tree),P(e,o-3,2)):o<=10?(L(e,v,e.bl_tree),P(e,o-3,3)):(L(e,y,e.bl_tree),P(e,o-11,7));s=i,u=(o=0)===a?(h=138,3):i===a?(h=6,3):(h=7,4)}}n(T);var q=!1;function J(e,t,r,n){P(e,(s<<1)+(n?1:0),3),function(e,t,r,n){M(e),n&&(U(e,r),U(e,~r)),i.arraySet(e.pending_buf,e.window,t,r,e.pending),e.pending+=r}(e,t,r,!0)}r._tr_init=function(e){q||(function(){var e,t,r,n,i,s=new Array(g+1);for(n=r=0;n<a-1;n++)for(I[n]=r,e=0;e<1<<w[n];e++)A[r++]=n;for(A[r-1]=n,n=i=0;n<16;n++)for(T[n]=i,e=0;e<1<<k[n];e++)E[i++]=n;for(i>>=7;n<f;n++)for(T[n]=i<<7,e=0;e<1<<k[n]-7;e++)E[256+i++]=n;for(t=0;t<=g;t++)s[t]=0;for(e=0;e<=143;)z[2*e+1]=8,e++,s[8]++;for(;e<=255;)z[2*e+1]=9,e++,s[9]++;for(;e<=279;)z[2*e+1]=7,e++,s[7]++;for(;e<=287;)z[2*e+1]=8,e++,s[8]++;for(Z(z,l+1,s),e=0;e<f;e++)C[2*e+1]=5,C[2*e]=j(e,5);O=new D(z,w,u+1,l,g),B=new D(C,k,0,f,g),R=new D(new Array(0),x,0,c,p)}(),q=!0),e.l_desc=new F(e.dyn_ltree,O),e.d_desc=new F(e.dyn_dtree,B),e.bl_desc=new F(e.bl_tree,R),e.bi_buf=0,e.bi_valid=0,W(e)},r._tr_stored_block=J,r._tr_flush_block=function(e,t,r,n){var i,s,a=0;0<e.level?(2===e.strm.data_type&&(e.strm.data_type=function(e){var t,r=4093624447;for(t=0;t<=31;t++,r>>>=1)if(1&r&&0!==e.dyn_ltree[2*t])return o;if(0!==e.dyn_ltree[18]||0!==e.dyn_ltree[20]||0!==e.dyn_ltree[26])return h;for(t=32;t<u;t++)if(0!==e.dyn_ltree[2*t])return h;return o}(e)),Y(e,e.l_desc),Y(e,e.d_desc),a=function(e){var t;for(X(e,e.dyn_ltree,e.l_desc.max_code),X(e,e.dyn_dtree,e.d_desc.max_code),Y(e,e.bl_desc),t=c-1;3<=t&&0===e.bl_tree[2*S[t]+1];t--);return e.opt_len+=3*(t+1)+5+5+4,t}(e),i=e.opt_len+3+7>>>3,(s=e.static_len+3+7>>>3)<=i&&(i=s)):i=s=r+5,r+4<=i&&-1!==t?J(e,t,r,n):4===e.strategy||s===i?(P(e,2+(n?1:0),3),K(e,z,C)):(P(e,4+(n?1:0),3),function(e,t,r,n){var i;for(P(e,t-257,5),P(e,r-1,5),P(e,n-4,4),i=0;i<n;i++)P(e,e.bl_tree[2*S[i]+1],3);V(e,e.dyn_ltree,t-1),V(e,e.dyn_dtree,r-1)}(e,e.l_desc.max_code+1,e.d_desc.max_code+1,a+1),K(e,e.dyn_ltree,e.dyn_dtree)),W(e),n&&M(e)},r._tr_tally=function(e,t,r){return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255,e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t,e.pending_buf[e.l_buf+e.last_lit]=255&r,e.last_lit++,0===t?e.dyn_ltree[2*r]++:(e.matches++,t--,e.dyn_ltree[2*(A[r]+u+1)]++,e.dyn_dtree[2*N(t)]++),e.last_lit===e.lit_bufsize-1},r._tr_align=function(e){P(e,2,3),L(e,m,z),function(e){16===e.bi_valid?(U(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):8<=e.bi_valid&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}(e)}},{"../utils/common":41}],53:[function(e,t,r){"use strict";t.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(e,t,r){(function(e){!function(r,n){"use strict";if(!r.setImmediate){var i,s,t,a,o=1,h={},u=!1,l=r.document,e=Object.getPrototypeOf&&Object.getPrototypeOf(r);e=e&&e.setTimeout?e:r,i="[object process]"==={}.toString.call(r.process)?function(e){process.nextTick(function(){c(e)})}:function(){if(r.postMessage&&!r.importScripts){var e=!0,t=r.onmessage;return r.onmessage=function(){e=!1},r.postMessage("","*"),r.onmessage=t,e}}()?(a="setImmediate$"+Math.random()+"$",r.addEventListener?r.addEventListener("message",d,!1):r.attachEvent("onmessage",d),function(e){r.postMessage(a+e,"*")}):r.MessageChannel?((t=new MessageChannel).port1.onmessage=function(e){c(e.data)},function(e){t.port2.postMessage(e)}):l&&"onreadystatechange"in l.createElement("script")?(s=l.documentElement,function(e){var t=l.createElement("script");t.onreadystatechange=function(){c(e),t.onreadystatechange=null,s.removeChild(t),t=null},s.appendChild(t)}):function(e){setTimeout(c,0,e)},e.setImmediate=function(e){"function"!=typeof e&&(e=new Function(""+e));for(var t=new Array(arguments.length-1),r=0;r<t.length;r++)t[r]=arguments[r+1];var n={callback:e,args:t};return h[o]=n,i(o),o++},e.clearImmediate=f}function f(e){delete h[e]}function c(e){if(u)setTimeout(c,0,e);else{var t=h[e];if(t){u=!0;try{!function(e){var t=e.callback,r=e.args;switch(r.length){case 0:t();break;case 1:t(r[0]);break;case 2:t(r[0],r[1]);break;case 3:t(r[0],r[1],r[2]);break;default:t.apply(n,r)}}(t)}finally{f(e),u=!1}}}}function d(e){e.source===r&&"string"==typeof e.data&&0===e.data.indexOf(a)&&c(+e.data.slice(a.length))}}("undefined"==typeof self?void 0===e?this:e:self)}).call(this,"undefined"!=typeof __webpack_require__.g?__webpack_require__.g:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[10])(10)});

/***/ }

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/global */
/******/ (() => {
/******/ 	__webpack_require__.g = (function() {
/******/ 		if (typeof globalThis === 'object') return globalThis;
/******/ 		try {
/******/ 			return this || new Function('return this')();
/******/ 		} catch (e) {
/******/ 			if (typeof window === 'object') return window;
/******/ 		}
/******/ 	})();
/******/ })();
/******/ 
/************************************************************************/

;// ./src/core/getTitle.js
function getTitle(doc = document) {
    const node =
        doc.querySelector("h1.heading[itemprop='name']") ||
        doc.querySelector("h1.heading[itemprop='headline']") ||
        doc.querySelector("h1.heading") ||
        doc.querySelector("h1[itemprop='name']");

    return node?.textContent?.trim() || "Фанфик";
}

;// ./src/core/getAuthors.js
function absoluteUrl(value) {
    if (!value) return "";
    const base = location.origin && location.origin !== "null" ? location.origin : "https://ficbook.net";
    try { return new URL(value, base).href; } catch (_) { return value; }
}

function cleanText(value) {
    return String(value || "")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeForRole(value) {
    return cleanText(value)
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/[^a-zа-я0-9]+/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

const ROLE_ALIASES = [
    { role: "автор оригинала", aliases: ["автор оригинала"] },
    { role: "сопереводчик", aliases: ["сопереводчик", "со переводчик", "со переводчица"] },
    { role: "соавтор", aliases: ["соавтор", "со автор", "соавторка", "со авторка"] },
    { role: "переводчик", aliases: ["переводчик", "переводчица"] },
    { role: "бета", aliases: ["бета", "бета ридер", "бетаридер", "бета редактор"] },
    { role: "гамма", aliases: ["гамма", "гамма ридер", "гаммаридер"] },
    { role: "редактор", aliases: ["редактор", "редакторка"] },
    { role: "автор", aliases: ["автор", "авторка"] }
];

function containsRolePhrase(text, phrase) {
    const normalizedText = ` ${normalizeForRole(text)} `;
    const normalizedPhrase = ` ${normalizeForRole(phrase)} `;
    return normalizedPhrase.trim() && normalizedText.includes(normalizedPhrase);
}

function normalizeRole(value, fallback = "") {
    const text = normalizeForRole(value);
    if (!text) return fallback;

    for (const definition of ROLE_ALIASES) {
        if (definition.aliases.some(alias => containsRolePhrase(text, alias))) {
            return definition.role;
        }
    }

    return fallback;
}

function textWithoutPerson(container, personNode) {
    if (!container) return "";

    const full = cleanText(container.textContent);
    const person = cleanText(personNode?.textContent);
    if (!person) return full;

    const index = full.toLowerCase().indexOf(person.toLowerCase());
    if (index < 0) return full;

    return cleanText(`${full.slice(0, index)} ${full.slice(index + person.length)}`);
}

function explicitRoleTexts(container) {
    if (!container?.querySelectorAll) return [];

    const result = [];
    const selectors = [
        "[data-role]",
        "[data-creator-role]",
        "[class*='role']",
        "[class*='creator-role']",
        ".small-text.text-muted",
        ".small-text",
        ".text-muted",
        "small"
    ].join(", ");

    container.querySelectorAll(selectors).forEach(node => {
        const values = [
            node.getAttribute?.("data-role"),
            node.getAttribute?.("data-creator-role"),
            node.getAttribute?.("aria-label"),
            node.getAttribute?.("title"),
            node.textContent
        ];

        values.forEach(value => {
            const text = cleanText(value);
            if (text) result.push(text);
        });
    });

    return result;
}

function nearestRole(link, root) {
    const directValues = [
        link.getAttribute?.("data-role"),
        link.getAttribute?.("data-creator-role"),
        link.getAttribute?.("aria-label"),
        link.getAttribute?.("title")
    ];

    for (const value of directValues) {
        const role = normalizeRole(value);
        if (role) return { role, raw: cleanText(value), source: "link-attribute" };
    }

    const immediateNodes = [
        link.previousElementSibling,
        link.nextElementSibling,
        link.parentElement?.previousElementSibling,
        link.parentElement?.nextElementSibling
    ].filter(Boolean);

    for (const node of immediateNodes) {
        const value = cleanText(node.textContent);
        const role = normalizeRole(value);
        if (role) return { role, raw: value, source: "sibling" };
    }

    let current = link.parentElement;
    let depth = 0;

    while (current && depth < 6) {
        const profileLinks = current.querySelectorAll?.("a[href*='/authors/']") || [];

        // Не читаем общий текст контейнера, в котором уже несколько участников:
        // иначе роль первого человека может ошибочно присвоиться всем остальным.
        if (profileLinks.length <= 1) {
            for (const value of explicitRoleTexts(current)) {
                const role = normalizeRole(value);
                if (role) return { role, raw: value, source: "explicit-node" };
            }

            const value = textWithoutPerson(current, link);
            const role = normalizeRole(value);
            if (role) return { role, raw: value, source: "container-text" };
        }

        if (current === root) break;
        current = current.parentElement;
        depth += 1;
    }

    if (
        link.matches?.("[itemprop='author'], [itemprop='creator']") ||
        link.closest?.("[itemprop='author'], [itemprop='creator']")
    ) {
        return { role: "автор", raw: "itemprop=author/creator", source: "semantic" };
    }

    return { role: "неизвестно", raw: "", source: "unknown" };
}

function identityOf(person) {
    const url = absoluteUrl(person?.url || "")
        .replace(/[?#].*$/, "")
        .replace(/\/$/, "")
        .toLowerCase();
    const name = cleanText(person?.name).toLowerCase();
    return url || name;
}

function addUnique(result, person) {
    const name = cleanText(person?.name);
    if (!name) return;

    const normalized = {
        name,
        url: absoluteUrl(person?.url || ""),
        role: normalizeRole(person?.role) || person?.role || "неизвестно",
        roleRaw: cleanText(person?.roleRaw || ""),
        roleSource: person?.roleSource || "",
        roleUnknown: !person?.role || person?.role === "неизвестно"
    };

    const identity = identityOf(normalized);
    if (!identity) return;

    const samePersonIndexes = result
        .map((item, index) => identityOf(item) === identity ? index : -1)
        .filter(index => index >= 0);

    const exact = samePersonIndexes.find(index => result[index].role === normalized.role);
    if (exact !== undefined) return;

    if (normalized.role === "неизвестно" && samePersonIndexes.length) return;

    const unknownIndex = samePersonIndexes.find(index => result[index].role === "неизвестно");
    if (unknownIndex !== undefined && normalized.role !== "неизвестно") {
        result.splice(unknownIndex, 1, normalized);
        return;
    }

    result.push(normalized);
}

function getHeaderRoots(doc) {
    const title =
        doc.querySelector("h1.heading[itemprop='name']") ||
        doc.querySelector("h1.heading[itemprop='headline']") ||
        doc.querySelector("h1.heading") ||
        doc.querySelector("h1[itemprop='name']") ||
        doc.querySelector("h1");

    const candidates = [
        doc.querySelector(".fanfic-hat-body"),
        doc.querySelector(".fanfic-hat"),
        doc.querySelector("section.chapter-info"),
        doc.querySelector("[itemtype*='CreativeWork']"),
        title?.closest("section"),
        title?.closest("article"),
        title?.parentElement?.parentElement,
        title?.parentElement
    ].filter(Boolean);

    return [...new Set(candidates)];
}

function isExcludedProfileLink(link) {
    if (!link) return true;

    // Ссылки на пользователей встречаются не только в блоке участников произведения.
    // В частности, Ficbook показывает профили людей, которые наградили работу,
    // внутри #rewards/.fanfic-reward-container. Такие ссылки нельзя считать
    // авторами/бетами/гаммами и тем более показывать как "неизвестную роль".
    if (link.matches?.(".reward-giver-name")) return true;

    return !!link.closest?.(
        "#rewards, .fanfic-reward-container, .rewards-modal, " +
        ".comments, .comment, [class*='comment'], nav, footer, " +
        "[class*='recommend'], [class*='review'], [class*='feed']"
    );
}

function collectLegacyCreators(root, result, processedLinks) {
    root.querySelectorAll(".creator-info").forEach(container => {
        const nameNode = container.querySelector(
            ".creator-username, a[href*='/authors/'], [itemprop='author'] a, " +
            "a[itemprop='author'], [itemprop='creator'] a, a[itemprop='creator']"
        );
        if (!nameNode) return;

        if (nameNode.matches?.("a[href*='/authors/']")) processedLinks.add(nameNode);

        const roleCandidates = explicitRoleTexts(container);
        let roleInfo = null;

        for (const value of roleCandidates) {
            const role = normalizeRole(value);
            if (role) {
                roleInfo = { role, raw: value, source: "legacy-explicit" };
                break;
            }
        }

        if (!roleInfo) {
            const value = textWithoutPerson(container, nameNode);
            const role = normalizeRole(value);
            roleInfo = role
                ? { role, raw: value, source: "legacy-container" }
                : { role: "неизвестно", raw: value, source: "legacy-unknown" };
        }

        addUnique(result, {
            name: nameNode.textContent || nameNode.getAttribute?.("title") || "",
            url: nameNode.getAttribute?.("href") || "",
            role: roleInfo.role,
            roleRaw: roleInfo.raw,
            roleSource: roleInfo.source
        });
    });
}

function collectProfileLinks(root, result, processedLinks) {
    root.querySelectorAll("a[href*='/authors/']").forEach(link => {
        if (processedLinks.has(link) || isExcludedProfileLink(link)) return;
        processedLinks.add(link);

        const roleInfo = nearestRole(link, root);
        addUnique(result, {
            name: link.textContent || link.getAttribute("title") || link.getAttribute("aria-label") || "",
            url: link.getAttribute("href"),
            role: roleInfo.role,
            roleRaw: roleInfo.raw,
            roleSource: roleInfo.source
        });
    });
}

function collectJsonLdAuthors(doc, result) {
    doc.querySelectorAll("script[type='application/ld+json']").forEach(script => {
        let data;
        try {
            data = JSON.parse(script.textContent || "null");
        } catch (_) {
            return;
        }

        const queue = Array.isArray(data) ? [...data] : [data];

        while (queue.length) {
            const item = queue.shift();
            if (!item || typeof item !== "object") continue;

            if (Array.isArray(item["@graph"])) queue.push(...item["@graph"]);

            const authors = item.author || item.creator;
            const values = Array.isArray(authors) ? authors : authors ? [authors] : [];

            values.forEach(author => {
                if (typeof author === "string") {
                    addUnique(result, { name: author, role: "автор", roleSource: "json-ld" });
                    return;
                }

                if (!author || typeof author !== "object") return;
                addUnique(result, {
                    name: author.name || author.alternateName || "",
                    url: author.url || author["@id"] || "",
                    role: "автор",
                    roleSource: "json-ld"
                });
            });
        }
    });
}

function collectMetaAuthor(doc, result) {
    const node =
        doc.querySelector("meta[name='author']") ||
        doc.querySelector("meta[property='article:author']");

    const name = cleanText(node?.getAttribute("content"));
    if (name) addUnique(result, { name, role: "автор", roleSource: "meta" });
}

function getAuthors(doc = document) {
    const result = [];
    const processedLinks = new WeakSet();
    const roots = getHeaderRoots(doc);

    // Сначала используем старую структуру Ficbook, если она ещё присутствует.
    roots.forEach(root => collectLegacyCreators(root, result, processedLinks));

    // Затем собираем все профильные ссылки участников и определяем роль по ближайшему
    // тексту/атрибутам. Это переживает смену CSS-классов имени и карточки участника.
    roots.forEach(root => collectProfileLinks(root, result, processedLinks));

    // Если визуальный блок участников полностью не распознан, используем семантические резервы.
    if (!result.length) collectJsonLdAuthors(doc, result);
    if (!result.length) collectMetaAuthor(doc, result);

    const unknown = result.filter(person => person.role === "неизвестно");
    if (unknown.length) {
        console.warn(
            "[Ficbook Exporter] Найдены участники с нераспознанной ролью:",
            unknown.map(person => ({ name: person.name, url: person.url, roleRaw: person.roleRaw }))
        );
    }

    return result;
}

;// ./src/core/getMeta.js
function getMeta_absoluteUrl(value) {
    if (!value) return "";

    const base =
        location.origin && location.origin !== "null"
            ? location.origin
            : "https://ficbook.net";

    try {
        return new URL(value, base).href;
    } catch (_) {
        return value;
    }
}

function uniqueValues(values) {
    return [...new Set(values.filter(Boolean))];
}

function getTagSections(doc) {
    const blocks = Array.from(
        doc.querySelectorAll(
            ".description .mb-10, " +
            ".fanfic-hat-body .mb-10"
        )
    );

    return blocks
        .map(block => {
            const tagsContainer = block.querySelector(".tags");
            if (!tagsContainer) return null;

            const labelNode = block.querySelector("strong");
            const label = labelNode?.textContent
                ?.replace(/\s+/g, " ")
                .trim()
                .replace(/[:：]\s*$/, "");

            if (!label) return null;

            const sectionTags = uniqueValues(
                Array.from(
                    tagsContainer.querySelectorAll("a[href*='/tags/']")
                ).map(link =>
                    link.textContent
                        .replace(/\s+/g, " ")
                        .trim()
                )
            );

            if (!sectionTags.length) return null;

            return {
                label,
                tags: sectionTags
            };
        })
        .filter(Boolean);
}

function getExtraData(doc = document) {
    const findBlock = label =>
        Array.from(
            doc.querySelectorAll(
                ".description .mb-10, " +
                ".fanfic-hat-body .mb-10"
            )
        ).find(node =>
            node.querySelector("strong")
                ?.textContent
                ?.includes(label)
        );

    const extractLinkedValues = block => block
        ? uniqueValues(
            Array.from(block.querySelectorAll("a"))
                .map(link =>
                    link.textContent
                        .replace(/\s+/g, " ")
                        .trim()
                )
        ).join(", ")
        : "";

    const universeBlock = findBlock("Вселенная:");
    const fandomBlock = findBlock("Фэндом:");

    const universe = extractLinkedValues(universeBlock);
    const fandom = extractLinkedValues(fandomBlock);

    const sizeBlock = findBlock("Размер:");
    const sizeText = sizeBlock?.textContent || "";
    const sizeMatch = sizeText.match(/(\d[\d\s\u00a0]*\d|\d)\s*слов/i);

    const size = sizeMatch
        ? sizeMatch[1]
            .replace(/\u00a0/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        : "";

    /*
     * Сохраняем группы меток отдельно:
     *
     * tagSections = [
     *     {
     *         label: "Предупреждения",
     *         tags: ["Похищение", "Счастливый финал"]
     *     },
     *     {
     *         label: "Другие метки",
     *         tags: ["AU", "Hurt/Comfort", "Драма"]
     *     }
     * ]
     */
    const tagSections = getTagSections(doc);

    /*
     * Общий список оставляем для обратной совместимости.
     * Он используется в метаданных EPUB, FB2 и других форматах.
     */
    const tags = uniqueValues(
        tagSections.flatMap(section => section.tags)
    ).join(", ");

    const description = doc.querySelector(
        ".description .js-public-beta-description, " +
        ".fanfic-hat-body .js-public-beta-description"
    )?.textContent?.trim() || "";

    const notes = doc.querySelector(
        ".description .js-public-beta-author-comment, " +
        ".fanfic-hat-body .js-public-beta-author-comment"
    )?.textContent?.trim() || "";

    const otherPublicationBlock = findBlock(
        "Публикация на других ресурсах:"
    );

    let otherPublication = "";

    if (otherPublicationBlock) {
        const clone = otherPublicationBlock.cloneNode(true);
        clone.querySelector("strong")?.remove();

        otherPublication = (clone.textContent || "")
            .replace(/^\s*[:：]?\s*/, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    const pairingBlock =
        findBlock("Пэйринг и персонажи:") ||
        findBlock("Пейринг и персонажи:");

    const pairings = pairingBlock
        ? uniqueValues(
            Array.from(pairingBlock.querySelectorAll("a"))
                .map(link =>
                    link.textContent
                        .replace(/\s+/g, " ")
                        .trim()
                )
        )
        : [];

    return {
        universe,
        fandom,
        size,
        tags,
        tagSections,
        description,
        notes,
        otherPublication,
        pairings
    };
}

function getDirectionRatingStatus(doc = document) {
    const root = doc.querySelector(".fanfic-badges");

    if (!root) {
        return {
            direction: "",
            rating: "",
            status: ""
        };
    }

    const directionNode = root.querySelector("[class*='direction']");

    const direction =
        directionNode?.querySelector("span")?.textContent?.trim() ||
        directionNode?.textContent?.trim() ||
        "";

    const ratingNode = root.querySelector(
        "[class*='ds-label-rating'], " +
        "[class*='badge-rating']"
    );

    const rating = ratingNode?.textContent?.trim() || "";

    const statusNode = root.querySelector(
        "[class*='ds-label-status'], " +
        "[class*='badge-status']"
    );

    const status = statusNode?.textContent?.trim() || "";

    return {
        direction,
        rating,
        status
    };
}

function getOriginalAuthor(doc = document) {
    for (const block of doc.querySelectorAll(".mb-10")) {
        const label =
            block.querySelector("strong")
                ?.textContent
                ?.trim() || "";

        if (!label.startsWith("Автор оригинала")) continue;

        const link = block.querySelector("a");

        return {
            name: link?.textContent?.trim() || "",
            url: getMeta_absoluteUrl(link?.getAttribute("href"))
        };
    }

    return null;
}

function getOriginalWork(doc = document) {
    for (const block of doc.querySelectorAll(".mb-10")) {
        const label =
            block.querySelector("strong")
                ?.textContent
                ?.trim() || "";

        if (!label.startsWith("Оригинал")) continue;

        const link = block.querySelector("a");
        if (!link) return null;

        let url =
            link.href ||
            link.getAttribute("href") ||
            "";

        try {
            const base =
                location.origin && location.origin !== "null"
                    ? location.origin
                    : "https://ficbook.net";

            const parsed = new URL(url, base);

            if (
                parsed.pathname.includes("/away") &&
                parsed.searchParams.has("url")
            ) {
                url = parsed.searchParams.get("url") || "";
            } else {
                url = parsed.href;
            }
        } catch (_) {
            // Оставляем исходную строку, если URL некорректен.
        }

        return { url };
    }

    return null;
}
;// ./src/utils/delay.js
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

;// ./src/utils/escapeXml.js
/** Экранирует текст для XML/XHTML. */
function escapeXml(value = "") {
    return String(value)
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

;// ./src/core/getFootnotes.js


/** Заменяет сноски в тексте на нейтральные placeholder-элементы. */
function extractFootnotes(doc, contentNode, notesMap = {}) {
    const anchors = [...contentNode.querySelectorAll("span.footnote[id]")];
    const notes = [];

    anchors.forEach((anchor, index) => {
        const id = anchor.id;
        const rawHtml = notesMap[id];
        if (!rawHtml) return;

        const number = index + 1;
        const holder = doc.createElement("div");
        holder.innerHTML = String(rawHtml);
        const text = (holder.textContent || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

        const ref = doc.createElement("footnote-ref");
        ref.setAttribute("id", id);
        ref.setAttribute("number", String(number));
        anchor.replaceWith(ref);

        notes.push({ id, number, text, html: escapeXml(text) });
    });

    return notes;
}

;// ./src/utils/network.js


function cancelledError() {
    return new Error("cancelled");
}

function isOffline() {
    return typeof navigator !== "undefined" && navigator.onLine === false;
}

async function waitForOnline({
    isCancelled = () => false,
    onState = () => {}
} = {}) {
    if (!isOffline()) return;

    onState("Нет соединения с интернетом — ждём восстановления…");

    while (isOffline()) {
        if (isCancelled()) throw cancelledError();
        await delay(1000);
    }

    if (isCancelled()) throw cancelledError();
    onState("Соединение восстановлено. Продолжаем…");
    await delay(350);
}

function timeoutError(timeoutMs) {
    const error = new Error(`Запрос не завершился за ${Math.round(timeoutMs / 1000)} секунд.`);
    error.name = "NetworkTimeoutError";
    error.retryable = true;
    return error;
}

async function fetchTextWithRetries(url, {
    credentials = "same-origin",
    isCancelled = () => false,
    onState = () => {},
    maxAttempts = 5,
    retryBaseMs = 1000,
    retryJitterMs = 500,
    requestTimeoutMs = 45000,
    validateText = null
} = {}) {
    let attempt = 1;

    for (;;) {
        if (isCancelled()) throw cancelledError();
        await waitForOnline({ isCancelled, onState });
        if (isCancelled()) throw cancelledError();

        let timeoutId = null;
        const controller = typeof AbortController === "function" ? new AbortController() : null;

        try {
            if (controller && requestTimeoutMs > 0) {
                timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);
            }

            const response = await fetch(url, {
                credentials,
                ...(controller ? { signal: controller.signal } : {})
            });

            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}`);
                error.status = response.status;
                throw error;
            }

            const text = await response.text();
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            if (isCancelled()) throw cancelledError();

            if (typeof validateText === "function") {
                const result = await validateText(text, response);
                if (result === false) {
                    const error = new Error("Получен неполный или некорректный ответ сервера.");
                    error.retryable = true;
                    throw error;
                }
            }

            onState("");
            return { response, text };
        } catch (error) {
            if (timeoutId !== null) clearTimeout(timeoutId);
            if (error?.message === "cancelled" || isCancelled()) throw cancelledError();

            if (error?.name === "AbortError") {
                error = timeoutError(requestTimeoutMs);
            }

            // Если браузер уже знает, что сети нет, не расходуем попытки:
            // ждём восстановления и повторяем тот же запрос.
            if (isOffline()) {
                await waitForOnline({ isCancelled, onState });
                continue;
            }

            const retryableStatus = error?.retryable === true || !error?.status ||
                error.status === 408 || error.status === 425 ||
                error.status === 429 || error.status >= 500;

            if (!retryableStatus || attempt >= maxAttempts) throw error;

            const nextAttempt = attempt + 1;
            onState(`Ошибка сети/сервера. Повтор ${nextAttempt}/${maxAttempts}…`);
            await delay(retryBaseMs * attempt + Math.random() * retryJitterMs);
            attempt = nextAttempt;
        }
    }
}

;// ./src/core/getChapter.js





const MAX_ATTEMPTS = 5;
const BLOCK_TAGS = new Set(["p", "div", "section", "article", "blockquote", "li", "h1", "h2", "h3", "h4"]);

function extractAssignedLiteralAfterMarker(source, marker) {
    const markerIndex = source.indexOf(marker);
    if (markerIndex < 0) return null;

    const equalsIndex = source.indexOf("=", markerIndex + marker.length);
    if (equalsIndex < 0) return null;

    let start = equalsIndex + 1;
    while (start < source.length && /\s/.test(source[start])) start++;
    if (start >= source.length) return null;

    const opening = source[start];
    if (opening !== "{" && opening !== "[") {
        // На случай null/undefined или другого простого литерала.
        const end = source.indexOf(";", start);
        return source.slice(start, end < 0 ? source.length : end).trim() || null;
    }

    const pairs = { "{": "}", "[": "]" };
    const stack = [];
    let quote = null;
    let escaped = false;
    let lineComment = false;
    let blockComment = false;

    for (let i = start; i < source.length; i++) {
        const char = source[i];
        const next = source[i + 1];

        if (lineComment) {
            if (char === "\n") lineComment = false;
            continue;
        }
        if (blockComment) {
            if (char === "*" && next === "/") {
                blockComment = false;
                i++;
            }
            continue;
        }
        if (quote) {
            if (escaped) escaped = false;
            else if (char === "\\") escaped = true;
            else if (char === quote) quote = null;
            continue;
        }

        if (char === "/" && next === "/") {
            lineComment = true;
            i++;
            continue;
        }
        if (char === "/" && next === "*") {
            blockComment = true;
            i++;
            continue;
        }
        if (char === '"' || char === "'" || char === "`") {
            quote = char;
            continue;
        }

        if (char === "{" || char === "[") {
            stack.push(pairs[char]);
            continue;
        }
        if (char === "}" || char === "]") {
            if (!stack.length || stack[stack.length - 1] !== char) return null;
            stack.pop();
            if (!stack.length) return source.slice(start, i + 1);
        }
    }

    return null;
}

/**
 * Безопасный разбор простого JavaScript object literal без eval/new Function.
 * Ficbook стал отдавать textFootnotes с некавыченными ключами, поэтому
 * строгий JSON.parse больше не всегда подходит.
 */
function parseObjectLiteral(source) {
    let index = 0;

    function fail(message) {
        throw new SyntaxError(`${message} at position ${index}`);
    }

    function skipSpace() {
        while (index < source.length) {
            if (/\s/.test(source[index])) {
                index++;
                continue;
            }
            if (source[index] === "/" && source[index + 1] === "/") {
                index += 2;
                while (index < source.length && source[index] !== "\n") index++;
                continue;
            }
            if (source[index] === "/" && source[index + 1] === "*") {
                index += 2;
                const end = source.indexOf("*/", index);
                if (end < 0) fail("Unterminated comment");
                index = end + 2;
                continue;
            }
            break;
        }
    }

    function parseString() {
        const quote = source[index++];
        let value = "";
        while (index < source.length) {
            const char = source[index++];
            if (char === quote) return value;
            if (char !== "\\") {
                value += char;
                continue;
            }

            if (index >= source.length) fail("Unterminated escape");
            const escape = source[index++];
            const simple = {
                n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", v: "\v",
                "0": "\0", "\\": "\\", "'": "'", '"': '"', "`": "`"
            };
            if (Object.prototype.hasOwnProperty.call(simple, escape)) {
                value += simple[escape];
            } else if (escape === "x") {
                const hex = source.slice(index, index + 2);
                if (!/^[0-9a-f]{2}$/i.test(hex)) fail("Invalid hex escape");
                value += String.fromCharCode(parseInt(hex, 16));
                index += 2;
            } else if (escape === "u") {
                if (source[index] === "{") {
                    const close = source.indexOf("}", index + 1);
                    if (close < 0) fail("Invalid Unicode escape");
                    const hex = source.slice(index + 1, close);
                    if (!/^[0-9a-f]+$/i.test(hex)) fail("Invalid Unicode escape");
                    value += String.fromCodePoint(parseInt(hex, 16));
                    index = close + 1;
                } else {
                    const hex = source.slice(index, index + 4);
                    if (!/^[0-9a-f]{4}$/i.test(hex)) fail("Invalid Unicode escape");
                    value += String.fromCharCode(parseInt(hex, 16));
                    index += 4;
                }
            } else if (escape === "\n") {
                // JavaScript line continuation.
            } else if (escape === "\r") {
                if (source[index] === "\n") index++;
            } else {
                // JS допускает экранирование обычного символа: \<char> -> <char>.
                value += escape;
            }
        }
        fail("Unterminated string");
    }

    function parseNumber() {
        const match = source.slice(index).match(/^-?(?:0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/);
        if (!match) fail("Invalid number");
        index += match[0].length;
        return Number(match[0]);
    }

    function parseIdentifier() {
        const match = source.slice(index).match(/^[A-Za-z_$][\w$-]*/);
        if (!match) fail("Expected identifier");
        index += match[0].length;
        return match[0];
    }

    function parseArray() {
        const value = [];
        index++;
        skipSpace();
        if (source[index] === "]") {
            index++;
            return value;
        }
        while (index < source.length) {
            value.push(parseValue());
            skipSpace();
            if (source[index] === ",") {
                index++;
                skipSpace();
                if (source[index] === "]") {
                    index++;
                    return value;
                }
                continue;
            }
            if (source[index] === "]") {
                index++;
                return value;
            }
            fail("Expected ',' or ']'");
        }
        fail("Unterminated array");
    }

    function parseObject() {
        const value = {};
        index++;
        skipSpace();
        if (source[index] === "}") {
            index++;
            return value;
        }

        while (index < source.length) {
            skipSpace();
            let key;
            if (source[index] === '"' || source[index] === "'" || source[index] === "`") {
                key = parseString();
            } else {
                const numberKey = source.slice(index).match(/^-?\d+(?:\.\d+)?/);
                if (numberKey) {
                    key = numberKey[0];
                    index += numberKey[0].length;
                } else {
                    key = parseIdentifier();
                }
            }

            skipSpace();
            if (source[index] !== ":") fail("Expected ':'");
            index++;
            value[String(key)] = parseValue();
            skipSpace();

            if (source[index] === ",") {
                index++;
                skipSpace();
                if (source[index] === "}") {
                    index++;
                    return value;
                }
                continue;
            }
            if (source[index] === "}") {
                index++;
                return value;
            }
            fail("Expected ',' or '}'");
        }
        fail("Unterminated object");
    }

    function parseValue() {
        skipSpace();
        const char = source[index];
        if (char === "{") return parseObject();
        if (char === "[") return parseArray();
        if (char === '"' || char === "'" || char === "`") return parseString();
        if (char === "-" || /\d/.test(char || "")) return parseNumber();

        const identifier = parseIdentifier();
        if (identifier === "true") return true;
        if (identifier === "false") return false;
        if (identifier === "null" || identifier === "undefined") return null;
        return identifier;
    }

    const result = parseValue();
    skipSpace();
    if (index !== source.length) fail("Unexpected trailing input");
    return result;
}

function parseFootnotesMap(source) {
    try {
        return JSON.parse(source);
    } catch (_) {
        return parseObjectLiteral(source);
    }
}

function serializeText(node) {
    if (!node) return "";
    if (node.nodeType === Node.TEXT_NODE) return escapeXml(node.nodeValue || "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const tag = node.tagName.toLowerCase();
    if (["script", "style", "noscript"].includes(tag)) return "";
    if (tag === "br") return "\n";
    if (tag === "footnote-ref") {
        return `<footnote-ref id="${escapeXml(node.getAttribute("id") || "")}" number="${escapeXml(node.getAttribute("number") || "")}"></footnote-ref>`;
    }

    const inner = Array.from(node.childNodes).map(serializeText).join("");
    return BLOCK_TAGS.has(tag) ? `\n${inner}\n` : inner;
}

function normalizeSerializedLine(line) {
    return line
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\s+(<footnote-ref)/g, " $1")
        .replace(/(<\/footnote-ref>)\s+/g, "$1 ")
        .trim();
}

function xmlLineToPlain(line) {
    const withRefs = line.replace(
        /<footnote-ref[^>]*number=["'](\d+)["'][^>]*><\/footnote-ref>/g,
        "[$1]"
    );
    const parsed = new DOMParser().parseFromString(`<root>${withRefs}</root>`, "application/xml");
    return parsed.querySelector("parsererror") ? withRefs.replace(/<[^>]+>/g, "") : parsed.documentElement.textContent;
}

function buildChapterText(contentNode) {
    const serialized = serializeText(contentNode);
    const lines = serialized
        .split(/\n+/)
        .map(normalizeSerializedLine)
        .filter(Boolean);

    return {
        xhtml: lines.map(line => `<p>${line}</p>`).join("\n"),
        plain: lines.map(xmlLineToPlain).join("\n\n")
    };
}

async function getChapter(url, options = {}, attempt = 1) {
    const isCancelled = options.isCancelled || (() => false);
    const onNetworkState = typeof options.onNetworkState === "function"
        ? options.onNetworkState
        : () => {};

    if (isCancelled()) throw new Error("cancelled");

    // Сохраняем защитную задержку перед каждым запросом Ficbook.
    await delay(350 + Math.random() * 250);
    if (isCancelled()) throw new Error("cancelled");

    try {
        const { text: html } = await fetchTextWithRetries(url, {
            credentials: "same-origin",
            isCancelled,
            onState: onNetworkState,
            // Повтор всей главы ниже уже делает до MAX_ATTEMPTS попыток.
            // Здесь нужна прежде всего корректная обработка offline/timeout.
            maxAttempts: 1,
            requestTimeoutMs: 45000
        });

        const looksEmpty =
            !html ||
            html.length < 500 ||
            /cf-browser-verification|Cloudflare|Too Many Requests|<title>\s*(?:429|500|502|503|504)/i.test(html);

        // Если соединение оборвалось посреди ответа, response.text() обычно
        // отклоняется. Дополнительно проверяем закрывающий тег, чтобы не принять
        // редкий усечённый HTTP 200 за полноценную страницу главы.
        const looksTruncated = !/<\/body\s*>/i.test(html) && !/<\/html\s*>/i.test(html);

        if (looksEmpty || looksTruncated) {
            const error = new Error(
                `Не удалось загрузить ${url}: ${looksTruncated ? "ответ сервера оборвался" : "пустой или служебный HTML"}`
            );
            error.retryable = true;
            throw error;
        }

        if (isCancelled()) throw new Error("cancelled");
        const doc = new DOMParser().parseFromString(html, "text/html");
        const title =
            doc.querySelector(".title-area h2, .part-title h3, .part-title h2, .part-title")?.textContent?.trim() ||
            "Глава";

        let contentNode =
            doc.querySelector(".part_text") ||
            doc.querySelector("#content .part_text") ||
            doc.querySelector("[itemprop='articleBody']");

        // Резерв для изменения разметки Ficbook. Он используется только на
        // полноценной HTML-странице и затем дополнительно проверяется на текст.
        if (!contentNode) {
            let best = null;
            let bestScore = 0;
            for (const element of doc.querySelectorAll("div, article, section")) {
                const text = (element.textContent || "").replace(/\s+/g, " ").trim();
                if (text.length < 200) continue;
                const className = String(element.className || "");
                if (/header|footer|menu|nav|comment|promo|settings|captcha|login|auth/i.test(className)) continue;
                if (text.length > bestScore) {
                    best = element;
                    bestScore = text.length;
                }
            }
            contentNode = best;
        }

        if (!contentNode) {
            const error = new Error(`Не найден текст главы: ${url}`);
            error.retryable = true;
            throw error;
        }

        contentNode.querySelectorAll(`
            .js-text-settings,
            .js-text-settings-collapse-button,
            .text_settings,
            .text-settings,
            .text-settings-panel,
            .fanfic-text-promo,
            .copy-button,
            .ad,
            .promo,
            .chapter-time
        `.replace(/\s+/g, " ")).forEach(element => element.remove());

        const visibleText = (contentNode.textContent || "").replace(/\s+/g, " ").trim();
        if (!visibleText) {
            const error = new Error(`Текст главы оказался пустым: ${url}`);
            error.retryable = true;
            throw error;
        }

        let notesMap = {};
        const notesLiteral = extractAssignedLiteralAfterMarker(html, "textFootnotes");
        if (notesLiteral) {
            try {
                notesMap = parseFootnotesMap(notesLiteral);
            } catch (error) {
                console.warn("Не удалось разобрать сноски главы:", url, error);
            }
        }

        const footnotes = extractFootnotes(doc, contentNode, notesMap);
        const { plain, xhtml } = buildChapterText(contentNode);

        if (!plain.trim() || !xhtml.trim()) {
            const error = new Error(`После обработки текст главы оказался пустым: ${url}`);
            error.retryable = true;
            throw error;
        }

        onNetworkState("");
        return { title, plain, xhtml, footnotes };
    } catch (error) {
        if (error?.message === "cancelled" || isCancelled()) throw new Error("cancelled");

        if (attempt < MAX_ATTEMPTS) {
            const nextAttempt = attempt + 1;
            onNetworkState(`Глава не загрузилась полностью. Повтор ${nextAttempt}/${MAX_ATTEMPTS}…`);
            await delay(1100 * attempt + Math.random() * 500);
            return getChapter(url, options, nextAttempt);
        }

        throw error;
    }
}


;// ./src/core/getCover.js
const REAL_COVER_SELECTOR =
    ".fanfic-hat-cover picture img, " +
    ".fanfic-hat-cover img";

/*
 * Кэшируем уже скачанную и нормализованную обложку на время жизни страницы.
 * Это особенно заметно, если пользователь подряд экспортирует одну работу
 * в несколько форматов: повторно CDN и Canvas уже не трогаем.
 */
const normalizedCoverCache = new Map();

function nowMs() {
    return typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
}

function logTiming(label, startedAt) {
    const elapsed = Math.max(0, nowMs() - startedAt);
    console.info(`[Ficbook Exporter] Обложка: ${label} — ${elapsed.toFixed(0)} мс`);
}

function candidateFromNode(node) {
    if (!node) return "";

    /*
     * currentSrc — фактический ресурс, который браузер уже выбрал и
     * загрузил из <picture>/<source>. Используем его первым, чтобы
     * cache-first запрос совпадал с URL уже отображаемой обложки.
     */
    if (node.currentSrc) {
        return node.currentSrc;
    }

    const srcset =
        node.getAttribute("srcset") ||
        node.getAttribute("data-srcset") ||
        "";

    if (srcset) {
        const candidates = srcset
            .split(",")
            .map(part => {
                const [url, descriptor = ""] = part.trim().split(/\s+/, 2);

                const score = descriptor.endsWith("w")
                    ? Number.parseFloat(descriptor)
                    : descriptor.endsWith("x")
                        ? Number.parseFloat(descriptor) * 10000
                        : 0;

                return {
                    url,
                    score: Number.isFinite(score) ? score : 0
                };
            })
            .filter(item => item.url);

        candidates.sort((a, b) => b.score - a.score);

        if (candidates[0]?.url) {
            return candidates[0].url;
        }
    }

    return (
        node.getAttribute("data-src") ||
        node.getAttribute("src") ||
        ""
    );
}

function getCover_absoluteUrl(value, doc = document) {
    if (!value) return "";

    try {
        const fallbackBase =
            location.origin && location.origin !== "null"
                ? location.origin
                : "https://ficbook.net";

        const base =
            doc.baseURI && doc.baseURI !== "about:blank"
                ? doc.baseURI
                : fallbackBase;

        return new URL(value, base).href;
    } catch (_) {
        return "";
    }
}

function isRealFicbookCover(value) {
    if (!value) return false;

    try {
        const url = new URL(value);

        if (!url.pathname.includes("/fanfic-covers/")) {
            return false;
        }

        if (
            /avatar|logo|favicon|placeholder|default|no[-_]?cover/i.test(
                url.pathname
            )
        ) {
            return false;
        }

        return true;
    } catch (_) {
        return false;
    }
}

function findCoverUrl(doc = document) {
    const coverRoot = doc.querySelector(".fanfic-hat-cover");
    if (!coverRoot) return "";

    const image = doc.querySelector(REAL_COVER_SELECTOR);
    if (!image) return "";

    const value = candidateFromNode(image);

    if (!value || value.startsWith("data:")) {
        return "";
    }

    const href = getCover_absoluteUrl(value, doc);

    if (!isRealFicbookCover(href)) {
        return "";
    }

    return href;
}

function headerValue(headers, name) {
    const match = String(headers || "").match(
        new RegExp(`^${name}:\\s*(.+)$`, "im")
    );

    return match?.[1]?.trim() || "";
}

function gmRequestBlob(url) {
    return new Promise((resolve, reject) => {
        const request =
            globalThis.GM_xmlhttpRequest ||
            globalThis.GM?.xmlHttpRequest;

        if (!request) {
            reject(new Error("GM_xmlhttpRequest недоступен"));
            return;
        }

        request({
            method: "GET",
            url,
            responseType: "arraybuffer",
            timeout: 30000,

            onload: response => {
                if (
                    response.status < 200 ||
                    response.status >= 300 ||
                    !response.response
                ) {
                    reject(new Error(`HTTP ${response.status}`));
                    return;
                }

                const contentType =
                    headerValue(
                        response.responseHeaders,
                        "content-type"
                    ) || "application/octet-stream";

                if (!contentType.toLowerCase().startsWith("image/")) {
                    reject(
                        new Error(
                            `Получен неподходящий тип файла: ${contentType}`
                        )
                    );
                    return;
                }

                resolve(
                    new Blob(
                        [response.response],
                        { type: contentType }
                    )
                );
            },

            onerror: () => {
                reject(new Error("Ошибка загрузки обложки"));
            },

            ontimeout: () => {
                reject(new Error("Тайм-аут загрузки обложки"));
            }
        });
    });
}

async function fetchBlob(url) {
    /*
     * assets.teinon.net не разрешает CORS для браузерного fetch со страницы
     * ficbook.net. Поэтому не делаем заведомо неуспешную cache-first попытку:
     * сразу используем GM_xmlhttpRequest, которому CORS не мешает.
     *
     * Кэш нормализованной обложки текущей страницы остаётся выше по цепочке
     * в normalizedCoverCache, поэтому повторный экспорт той же работы всё равно
     * использует уже готовую обложку без сетевого запроса.
     */
    const blob = await gmRequestBlob(url);
    console.info(
        `[Ficbook Exporter] Обложка: GM-запрос — ${blob.size} байт`
    );
    return blob;
}

function loadImage(blob) {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(blob);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);

            reject(
                new Error(
                    "Браузер не смог декодировать изображение"
                )
            );
        };

        image.src = objectUrl;
    });
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            blob => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(
                        new Error(
                            "Не удалось преобразовать обложку"
                        )
                    );
                }
            },
            type,
            quality
        );
    });
}

async function normalizeToJpeg(blob, onStage) {
    onStage("декодирование");
    const decodeStarted = nowMs();
    const image = await loadImage(blob);
    logTiming("декодирование", decodeStarted);

    if (!image.naturalWidth || !image.naturalHeight) {
        throw new Error("Изображение имеет нулевой размер");
    }

    const maxWidth = 1600;
    const maxHeight = 2400;

    const scale = Math.min(
        1,
        maxWidth / image.naturalWidth,
        maxHeight / image.naturalHeight
    );

    const width = Math.max(
        1,
        Math.round(image.naturalWidth * scale)
    );

    const height = Math.max(
        1,
        Math.round(image.naturalHeight * scale)
    );

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {
        alpha: false
    });

    if (!context) {
        throw new Error("Canvas 2D недоступен");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    onStage("JPEG");
    const jpegStarted = nowMs();
    const jpegBlob = await canvasToBlob(
        canvas,
        "image/jpeg",
        0.9
    );
    logTiming("JPEG", jpegStarted);

    return {
        blob: jpegBlob,
        width,
        height
    };
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(reader.error || new Error("Не удалось прочитать обложку"));
        reader.readAsDataURL(blob);
    });
}

async function getNormalizedCover(sourceUrl, onStage) {
    if (normalizedCoverCache.has(sourceUrl)) {
        onStage("кэш");
        console.info("[Ficbook Exporter] Обложка: использован кэш текущей страницы");
        return normalizedCoverCache.get(sourceUrl);
    }

    const promise = (async () => {
        onStage("загрузка");
        const downloadStarted = nowMs();
        const originalBlob = await fetchBlob(sourceUrl);
        logTiming("загрузка", downloadStarted);

        const normalizeStarted = nowMs();
        const normalized = await normalizeToJpeg(originalBlob, onStage);
        logTiming("обработка всего изображения", normalizeStarted);

        return normalized;
    })();

    normalizedCoverCache.set(sourceUrl, promise);

    try {
        return await promise;
    } catch (error) {
        normalizedCoverCache.delete(sourceUrl);
        throw error;
    }
}

async function getCover(doc = document, options = {}) {
    const mode = options.mode || "full";
    const onStage = typeof options.onStage === "function" ? options.onStage : () => {};

    if (mode === "none") return null;

    const sourceUrl = findCoverUrl(doc);
    if (!sourceUrl) return null;

    const totalStarted = nowMs();

    try {
        const normalized = await getNormalizedCover(sourceUrl, onStage);
        const common = {
            sourceUrl,
            blob: normalized.blob,
            mediaType: "image/jpeg",
            fileName: "cover.jpg",
            width: normalized.width,
            height: normalized.height
        };

        if (mode === "epub") {
            onStage("байты EPUB");
            const started = nowMs();
            const bytes = new Uint8Array(await normalized.blob.arrayBuffer());
            logTiming("подготовка EPUB", started);
            logTiming("всего", totalStarted);
            return { ...common, bytes };
        }

        if (mode === "fb2") {
            onStage("Base64 FB2");
            const started = nowMs();
            const dataUrl = await blobToDataUrl(normalized.blob);
            const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
            logTiming("подготовка FB2", started);
            logTiming("всего", totalStarted);
            return { ...common, base64 };
        }

        if (mode === "pdf") {
            onStage("данные PDF");
            const started = nowMs();
            const dataUrl = await blobToDataUrl(normalized.blob);
            logTiming("подготовка PDF", started);
            logTiming("всего", totalStarted);
            return { ...common, dataUrl };
        }

        /* Режим совместимости для сторонних вызовов getCover(). */
        onStage("полная подготовка");
        const started = nowMs();
        const bytes = new Uint8Array(await normalized.blob.arrayBuffer());
        const dataUrl = await blobToDataUrl(normalized.blob);
        const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
        logTiming("полная подготовка", started);
        logTiming("всего", totalStarted);
        return { ...common, bytes, base64, dataUrl };
    } catch (error) {
        console.warn(
            "Обложка найдена, но не добавлена:",
            sourceUrl,
            error
        );

        return null;
    }
}

;// ./src/core/collectBook.js








const workDocumentCache = new Map();

function currentWorkUrl() {
    const url = new URL(location.href);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] !== "readfic" || !parts[1]) throw new Error("Откройте страницу произведения или главы Ficbook.");
    return new URL(`/readfic/${parts[1]}`, url.origin).href;
}

function normalizeRequestedWorkUrl(value) {
    const url = new URL(value, location.origin);
    const parts = url.pathname.split("/").filter(Boolean);
    if (url.origin !== location.origin || parts[0] !== "readfic" || !parts[1]) {
        throw new Error("Некорректная ссылка на произведение Ficbook.");
    }
    return new URL(`/readfic/${parts[1]}`, url.origin).href;
}

async function loadWorkDocument(workUrl, options = {}) {
    const current = new URL(location.href);
    const work = new URL(workUrl);
    if (current.pathname.replace(/\/$/, "") === work.pathname.replace(/\/$/, "")) return document;

    if (!workDocumentCache.has(workUrl)) {
        workDocumentCache.set(workUrl, (async () => {
            const { text: html } = await fetchTextWithRetries(workUrl, {
                credentials: "same-origin",
                isCancelled: options.isCancelled,
                onState: options.onNetworkState,
                maxAttempts: 5,
                retryBaseMs: 1200,
                requestTimeoutMs: 45000,
                validateText: text => {
                    if (!text || text.length < 800) return false;
                    if (!/<\/body\s*>/i.test(text) && !/<\/html\s*>/i.test(text)) return false;
                    if (/cf-browser-verification|Cloudflare|Too Many Requests|<title>\s*(?:429|500|502|503|504)/i.test(text)) {
                        return false;
                    }
                    const probe = new DOMParser().parseFromString(text, "text/html");
                    return !!probe.querySelector(".fanfic-hat-body, h1.heading");
                }
            });
            const doc = new DOMParser().parseFromString(html, "text/html");
            if (!doc.querySelector(".fanfic-hat-body, h1.heading")) {
                throw new Error("Страница произведения загружена, но её структура не распознана.");
            }
            return doc;
        })());
    }

    try {
        return await workDocumentCache.get(workUrl);
    } catch (error) {
        workDocumentCache.delete(workUrl);
        throw error;
    }
}

function isRole(author, role) {
    return author.role === role;
}

function extractSeries(doc) {
    const link = doc.querySelector(".mb-10 a[href^='/series/']");
    if (!link) return null;
    return {
        name: link.textContent?.trim() || "",
        url: new URL(link.getAttribute("href"), location.origin && location.origin !== "null" ? location.origin : "https://ficbook.net").href
    };
}

function extractChapterUrls(doc, workUrl) {
    const urls = Array.from(doc.querySelectorAll(".list-of-fanfic-parts .part-link"))
        .map(link => link.getAttribute("href") || link.href || "")
        .filter(Boolean)
        .map(href => new URL(href, workUrl).href.split("#")[0])
        .filter(href => {
            if (href.includes("/all-parts")) return false;
            const last = new URL(href).pathname.split("/").filter(Boolean).pop();
            return /^\d+$/.test(last || "");
        });

    return [...new Set(urls.length ? urls : [workUrl])];
}

async function loadChapters(urls, onProgress, isCancelled, options = {}) {
    const results = new Array(urls.length).fill(null);
    let pending = urls.map((_, index) => index);
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts && pending.length; attempt++) {
        const failed = [];

        for (const index of pending) {
            if (isCancelled()) throw new Error("cancelled");
            onProgress(index + 1, urls.length);

            if (attempt > 1) await delay(700 + Math.random() * 500);

            try {
                results[index] = {
                    ...(await getChapter(urls[index], {
                        isCancelled,
                        onNetworkState: options.onNetworkState
                    })),
                    url: urls[index],
                    number: index + 1
                };
            } catch (error) {
                if (error.message === "cancelled") throw error;
                console.warn(
                    `Не удалось загрузить главу (попытка ${attempt}/${maxAttempts}):`,
                    urls[index],
                    error
                );
                failed.push(index);
            }
        }

        pending = failed;
    }

    if (pending.length) {
        const failedLines = pending
            .map(index => `${index + 1}. ${urls[index]}`)
            .join("\n");
        const error = new Error(
            `Не удалось загрузить ${pending.length} из ${urls.length} глав после трёх попыток.\n\n` +
            "Файл не создан, чтобы не сохранять неполный текст. Повторите экспорт позже.\n\n" +
            `Проблемные главы:\n${failedLines}`
        );
        error.name = "IncompleteBookError";
        error.failedUrls = pending.map(index => urls[index]);
        throw error;
    }

    return results;
}

function metadataWarnings(doc, meta) {
    const warnings = [];
    const hasTitleNode = !!(
        doc.querySelector("h1.heading[itemprop='name']") ||
        doc.querySelector("h1.heading[itemprop='headline']") ||
        doc.querySelector("h1.heading") ||
        doc.querySelector("h1[itemprop='name']")
    );

    if (!hasTitleNode) warnings.push("не найдено название произведения");
    if (!meta.mainAuthor || meta.mainAuthor.missing) warnings.push("не найден автор");
    if (!meta.fandom && !meta.universe) warnings.push("не найдены фэндом и вселенная");
    if (!meta.direction) warnings.push("не найдена направленность");
    if (!meta.rating) warnings.push("не найден рейтинг");
    if (!meta.status) warnings.push("не найден статус произведения");
    if (!meta.size) warnings.push("не найден размер произведения");
    if (!meta.description) warnings.push("не найдено описание");

    for (const person of meta.unclassifiedParticipants || []) {
        warnings.push(`не удалось определить роль участника: ${person.name}`);
    }

    return warnings;
}

function createMetadataWarningError(warnings) {
    const error = new Error(
        "Некоторые данные произведения не удалось распознать. " +
        "Экспорт можно продолжить после подтверждения пользователя."
    );
    error.name = "MetadataWarningError";
    error.warnings = warnings;
    return error;
}

async function collectBook(onProgress = () => {}, isCancelled = () => false, options = {}) {
    const onStage = typeof options.onStage === "function" ? options.onStage : () => {};
    const workUrl = options.workUrl
        ? normalizeRequestedWorkUrl(options.workUrl)
        : currentWorkUrl();

    onStage("Страница произведения…");
    const doc = await loadWorkDocument(workUrl, {
        isCancelled,
        onNetworkState: options.onNetworkState
    });
    if (isCancelled()) throw new Error("cancelled");

    onStage("Метаданные…");
    const title = getTitle(doc);
    const authors = getAuthors(doc);
    const originalAuthor = getOriginalAuthor(doc);
    const originalWork = getOriginalWork(doc);
    const translators = authors.filter(author => isRole(author, "переводчик"));
    const coTranslators = authors.filter(author => isRole(author, "сопереводчик"));
    const unclassifiedParticipants = authors.filter(author => isRole(author, "неизвестно"));
    const singleUnclassified = unclassifiedParticipants.length === 1
        ? unclassifiedParticipants[0]
        : null;
    const detectedMainAuthor =
        authors.find(author => isRole(author, "автор")) ||
        originalAuthor ||
        translators[0] ||
        coTranslators[0] ||
        singleUnclassified ||
        null;
    const mainAuthor = detectedMainAuthor || {
        name: "Неизвестный автор",
        url: "",
        role: "автор",
        missing: true
    };

    const meta = {
        title,
        authors,
        mainAuthor,
        coauthors: authors.filter(author => isRole(author, "соавтор")),
        translators,
        coTranslators,
        betas: authors.filter(author => isRole(author, "бета")),
        gammas: authors.filter(author => isRole(author, "гамма")),
        editors: authors.filter(author => isRole(author, "редактор")),
        unclassifiedParticipants,
        originalAuthor,
        originalWork,
        ...getExtraData(doc),
        ...getDirectionRatingStatus(doc),
        series: extractSeries(doc),
        sourceUrl: workUrl
    };

    options.onBookInfo?.({
        title: meta.title,
        author: meta.mainAuthor?.name || "Неизвестный автор",
        sourceUrl: workUrl
    });

    const warnings = metadataWarnings(doc, meta);
    meta.warnings = warnings;

    if (warnings.length && !options.allowIncompleteMetadata) {
        throw createMetadataWarningError(warnings);
    }

    if (isCancelled()) throw new Error("cancelled");
    const chapterUrls = extractChapterUrls(doc, workUrl);

    // Обложка и главы идут параллельно. При этом для каждого формата
    // готовим только реально нужное представление картинки. TXT вообще
    // не запускает загрузку обложки.
    const coverMode = options.coverMode || "full";
    let coverReady = coverMode === "none";
    let chaptersReady = false;
    let coverStage = "загрузка";

    const coverPromise = coverMode === "none"
        ? Promise.resolve(null)
        : getCover(doc, {
            mode: coverMode,
            onStage: stage => {
                coverStage = stage;
                if (chaptersReady && !coverReady) {
                    onStage(`Обложка: ${stage}…`);
                }
            }
        }).finally(() => {
            coverReady = true;
        });

    onStage("Подготовка списка глав…");
    const chapters = await loadChapters(chapterUrls, onProgress, isCancelled, {
        onNetworkState: options.onNetworkState
    });
    chaptersReady = true;

    if (!chapters.length) throw new Error("Не удалось загрузить главы произведения.");
    if (!coverReady) onStage(`Обложка: ${coverStage}…`);
    const cover = await coverPromise;
    if (isCancelled()) throw new Error("cancelled");

    return { meta, cover, chapters };
}

;// ./src/utils/generateFileName.js
/** Подготавливает безопасную часть имени файла для Windows/macOS/Linux.
    * Итоговый формат:
    * author_-_title
 */
function sanitizeFilePart(value, fallback = "Без_названия") {
    let result = String(value || "")
        .normalize("NFC")
        .replace(/[\u0000-\u001F\u007F]/g, "")
        .replace(/[\\/:*?"<>|]+/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .replace(/[ ._]+$/g, "")
        .replace(/^[ ._]+/g, "")
        .slice(0, 110);

    if (!result) result = fallback;
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(result)) result = `_${result}`;
    return result;
}

function generateFileBaseName(mainAuthorName, title) {
    return `${sanitizeFilePart(mainAuthorName, "UnknownAuthor")}_-_${sanitizeFilePart(title)}`;
}

;// ./src/utils/download.js
function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

;// ./src/utils/id.js
function createBookId() {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
}

;// ./src/utils/textToParagraphs.js
/**
 * textToParagraphs Преобразует обычный текст в XHTML-параграфы.
 *
 * - разбивает текст по переносам строк
 * - удаляет пустые строки
 * - экранирует XML-символы
 * - оборачивает каждую строку в <p>
 */



function textToParagraphs(text) {
    return text.split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p>${escapeXml(line)}</p>`)
        .join("\n");
}

;// ./src/fb2/fb2Header.js



function personXml(person) {
    if (!person) return "";

    return `
            <author>
                <nickname>${escapeXml(person.name)}</nickname>
                ${person.url ? `<home-page>${escapeXml(person.url)}</home-page>` : ""}
            </author>`;
}

function annotationPerson(label, people) {
    if (!people?.length) return "";

    const value = people
        .map(person =>
            person.url
                ? `${escapeXml(person.name)} (${escapeXml(person.url)})`
                : escapeXml(person.name)
        )
        .join(", ");

    return `<p><strong>${escapeXml(label)}:</strong> ${value}</p>`;
}

function externalLinkXml(url, label = url) {
    if (!url) return "";

    return `<a xlink:href="${escapeXml(url)}">${escapeXml(label)}</a>`;
}

/**
 * Выводит разделы меток Ficbook отдельно:
 *
 * Предупреждения: ...
 * Другие метки: ...
 *
 * При отсутствии разделов использует общий список tags.
 */
function annotationTagSections(tagSections, fallbackTags) {
    if (Array.isArray(tagSections) && tagSections.length) {
        const sections = tagSections
            .filter(section =>
                section?.label &&
                Array.isArray(section.tags) &&
                section.tags.length
            )
            .map(section => {
                const label = escapeXml(section.label);
                const values = escapeXml(section.tags.join(", "));

                return `<p><strong>${label}:</strong> ${values}</p>`;
            });

        if (sections.length) {
            return sections.join("");
        }
    }

    return fallbackTags
        ? `<p><strong>Метки:</strong> ${escapeXml(fallbackTags)}</p>`
        : "";
}

function buildFb2Header({ meta, cover, bookId }) {
    const {
        title,
        mainAuthor,
        coauthors,
        originalAuthor,
        originalWork,
        translators,
        coTranslators,
        betas,
        gammas,
        editors,
        unclassifiedParticipants,
        direction,
        rating,
        size,
        status,
        tags,
        tagSections,
        description,
        notes,
        otherPublication,
        universe,
        fandom,
        pairings,
        series,
        sourceUrl
    } = meta;

    const today = new Date();
    const isoDate = today.toISOString().split("T")[0];

    // Собираем аннотацию как список реальных строк. Так отсутствующие
    // необязательные поля не оставляют десятки пустых строк в FB2.
    const annotationLines = [
        sourceUrl
            ? `<p><strong>Ссылка на работу:</strong> ${externalLinkXml(sourceUrl)}</p>`
            : "",
        direction
            ? `<p><strong>Направленность:</strong> ${escapeXml(direction)}</p>`
            : "",
        mainAuthor
            ? `<p><strong>Автор:</strong> ${escapeXml(mainAuthor.name)}${mainAuthor.url
                ? ` (${escapeXml(mainAuthor.url)})`
                : ""}</p>`
            : "",
        originalAuthor && originalAuthor.name !== mainAuthor?.name
            ? `<p><strong>Автор оригинала:</strong> ${escapeXml(originalAuthor.name)}${originalAuthor.url
                ? ` (${escapeXml(originalAuthor.url)})`
                : ""}</p>`
            : "",
        originalWork?.url
            ? `<p><strong>Оригинал:</strong> ${escapeXml(originalWork.url)}</p>`
            : "",
        annotationPerson("Переводчик", translators),
        annotationPerson("Сопереводчики", coTranslators),
        annotationPerson("Соавторы", coauthors),
        annotationPerson("Бета", betas),
        annotationPerson("Гамма", gammas),
        annotationPerson("Редакторы", editors),
        annotationPerson("Участники (роль не определена)", unclassifiedParticipants),
        series
            ? `<p><strong>Серия:</strong> ${escapeXml(series.name)}${series.url
                ? ` (${escapeXml(series.url)})`
                : ""}</p>`
            : "",
        universe
            ? `<p><strong>Вселенная:</strong> ${escapeXml(universe)}</p>`
            : "",
        fandom
            ? `<p><strong>Фэндом:</strong> ${escapeXml(fandom)}</p>`
            : "",
        pairings?.length
            ? `<p><strong>Пейринги и персонажи:</strong> ${escapeXml(pairings.join(", "))}</p>`
            : "",
        rating
            ? `<p><strong>Рейтинг:</strong> ${escapeXml(rating)}</p>`
            : "",
        size
            ? `<p><strong>Размер:</strong> ${escapeXml(size)} слов</p>`
            : "",
        status
            ? `<p><strong>Статус:</strong> ${escapeXml(status)}</p>`
            : "",
        annotationTagSections(tagSections, tags),
        description
            ? `<p><strong>Описание:</strong></p>${textToParagraphs(description)}`
            : "",
        notes
            ? `<p><strong>Примечания:</strong></p>${textToParagraphs(notes)}`
            : "",
        otherPublication
            ? `<p><strong>Публикация на других ресурсах:</strong> ${escapeXml(otherPublication)}</p>`
            : ""
    ].filter(Boolean).join("\n                ");

    return `<?xml version="1.0" encoding="utf-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:xlink="http://www.w3.org/1999/xlink">
    <description>
        <title-info>
            <genre>prose_contemporary</genre>
            ${personXml(mainAuthor)}
            ${(coauthors || []).map(personXml).join("\n")}
            <book-title>${escapeXml(title)}</book-title>
            <annotation>
                ${annotationLines}
            </annotation>
            ${tags ? `<keywords>${escapeXml(tags)}</keywords>` : ""}
            <date value="${isoDate}">${today.toLocaleDateString("ru-RU")}</date>
            ${cover
        ? `<coverpage><image xlink:href="#${cover.fileName}"/></coverpage>`
        : ""}
            <lang>ru</lang>
            ${series?.name
        ? `<sequence name="${escapeXml(series.name)}"/>`
        : ""}
        </title-info>
        <document-info>
            <author>
                <nickname>Ficbook Exporter</nickname>
            </author>
            <program-used>Ficbook Exporter</program-used>
            <date value="${today.toISOString()}">${today.toLocaleString("ru-RU")}</date>
            <src-url>${escapeXml(sourceUrl)}</src-url>
            <id>${escapeXml(bookId)}</id>
            <version>2.0</version>
        </document-info>
    </description>
`;
}
;// ./src/fb2/fb2Toc.js


function buildFb2Toc(tocEntries) {
    return `
<body name="toc">
    <section>
        <title><p>Оглавление</p></title>
        ${tocEntries.map(ch => `<p><a xlink:href="#${escapeXml(ch.id)}">${escapeXml(ch.title)}</a></p>`).join("\n")}
    </section>
</body>
`;
}

;// ./src/fb2/fb2Body.js
function buildFb2Body(fb2Chapters) {
    return `
<body>
${fb2Chapters}
</body>
`;
}

;// ./src/fb2/fb2Builder.js









function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderFb2Footnotes(chapter, globalIndexRef) {
    let content = chapter.xhtml;
    const notes = [];

    for (const note of chapter.footnotes || []) {
        const number = globalIndexRef.value++;
        const targetId = `note_${chapter.number}_${note.id}`;
        const refPattern = new RegExp(
            `<footnote-ref[^>]*id=["']${escapeRegExp(note.id)}["'][^>]*>(?:<\\/footnote-ref>)?`,
            "g"
        );
        content = content.replace(refPattern, `<a xlink:href="#${escapeXml(targetId)}" type="note">[${number}]</a>`);
        notes.push({ id: targetId, number, html: note.html });
    }

    content = content.replace(/<\/?footnote-ref[^>]*>/g, "");
    return { content, notes };
}

async function createFB2(onProgress = () => {}, isCancelled = () => false, options = {}) {
    const book = await collectBook(onProgress, isCancelled, { ...options, coverMode: "fb2" });
    options.onStage?.("Создание FB2…");
    const { meta, cover, chapters } = book;
    const bookId = createBookId();
    const globalFootnoteIndex = { value: 1 };
    const allNotes = [];
    const tocEntries = [];
    let chapterXml = "";

    for (const chapter of chapters) {
        const rendered = renderFb2Footnotes(chapter, globalFootnoteIndex);
        allNotes.push(...rendered.notes);
        const title = `${chapter.number}. ${chapter.title}`;
        tocEntries.push({ id: `ch${chapter.number}`, title });
        chapterXml += `
<section id="ch${chapter.number}">
    <title><p>${escapeXml(title)}</p></title>
    ${rendered.content}
</section>`;
    }

    const notesBody = allNotes.length ? `
<body name="notes">
${allNotes.map(note => `
<section id="${escapeXml(note.id)}">
    <title><p>${note.number}</p></title>
    <p>${note.html}</p>
</section>`).join("\n")}
</body>` : "";

    const coverBinary = cover
        ? `\n<binary id="${cover.fileName}" content-type="${cover.mediaType}">${cover.base64}</binary>`
        : "";

    const fullFb2 = [
        buildFb2Header({ meta, cover, bookId }),
        buildFb2Toc(tocEntries),
        buildFb2Body(chapterXml),
        notesBody,
        coverBinary,
        "\n</FictionBook>"
    ].join("");


    const translator = meta.translators?.[0]?.name;
    const titlePart = translator ? `${meta.title}_[${translator}]` : meta.title;
    const fileName = `${generateFileBaseName(meta.mainAuthor?.name || "UnknownAuthor", titlePart)}.fb2`;
    const blob = new Blob([fullFb2], { type: "application/x-fictionbook+xml;charset=utf-8" });
    const artifact = { blob, fileName, sourceUrl: meta.sourceUrl, format: "FB2" };

    if (options.returnFile) return artifact;

    downloadBlob(blob, fileName);
    return artifact;
}

;// ./src/utils/jszipSchedulerShim.js
/*
 * JSZip internally yields work through setImmediate.
 *
 * In Tampermonkey the exposed setImmediate can be unreliable, while a
 * setTimeout(0)-based replacement becomes extremely slow as soon as Chrome
 * puts the page into a background tab (background timers are throttled).
 *
 * MessageChannel schedules tasks without depending on timer clamping, so it
 * is a better fit for JSZip here. setTimeout remains only as a fallback.
 */
let nextHandle = 1;
const pending = new Map();
const queue = [];
let channel = null;

try {
    const MessageChannelCtor =
        (typeof globalThis !== "undefined" && globalThis.MessageChannel) ||
        (typeof window !== "undefined" && window.MessageChannel) ||
        null;

    if (typeof MessageChannelCtor === "function") {
        channel = new MessageChannelCtor();
        channel.port1.onmessage = () => {
            while (queue.length) {
                const handle = queue.shift();
                const task = pending.get(handle);
                if (!task) continue;

                pending.delete(handle);
                try {
                    task.callback(...task.args);
                } catch (error) {
                    // Не ломаем очередь JSZip. Ошибку всё равно отдаём в event loop.
                    setTimeout(() => { throw error; }, 0);
                }
                break;
            }

            if (queue.length) channel.port2.postMessage(0);
        };
        channel.port1.start?.();
    }
} catch (_) {
    channel = null;
}

function safeSetImmediate(callback, ...args) {
    if (!channel) return setTimeout(() => callback(...args), 0);

    const handle = nextHandle++;
    pending.set(handle, { callback, args });
    queue.push(handle);
    channel.port2.postMessage(0);
    return handle;
}

function safeClearImmediate(handle) {
    if (!channel) {
        clearTimeout(handle);
        return;
    }
    pending.delete(handle);
}

const roots = [];
try { if (typeof globalThis !== "undefined") roots.push(globalThis); } catch (_) {}
try { if (typeof window !== "undefined") roots.push(window); } catch (_) {}
try { if (typeof self !== "undefined") roots.push(self); } catch (_) {}

for (const root of [...new Set(roots)]) {
    try {
        Object.defineProperty(root, "setImmediate", {
            configurable: true,
            writable: true,
            value: safeSetImmediate
        });
        Object.defineProperty(root, "clearImmediate", {
            configurable: true,
            writable: true,
            value: safeClearImmediate
        });
    } catch (_) {
        try { root.setImmediate = safeSetImmediate; } catch (_) {}
        try { root.clearImmediate = safeClearImmediate; } catch (_) {}
    }
}

console.info(
    `[Ficbook Exporter] JSZip scheduler: ${channel ? "MessageChannel" : "setTimeout fallback"}`
);

// EXTERNAL MODULE: ./node_modules/jszip/dist/jszip.min.js
var jszip_min = __webpack_require__(710);
;// ./src/epub/epubCss.js
const epubCss = `
body {
    margin: 0;
    padding: 0 8%;
    font-family: serif;
    line-height: 1.55;
    font-size: 1em;
}
h1, h2, h3 {
    font-weight: 700;
    margin: 1.2em 0 0.6em; 
    }
h1 {
    font-size: 1.55em;
    text-align: center;
    }
p {
    margin: 0.6em 0;
    }
.title-page {
    text-align: center; 
    }
.title-page .cover {
    display: block; max-width: 90%;
    max-height: 80vh;
    margin: 0 auto 1.5em;
    }
.title-page h1 {
    font-size: 1.8em;
    margin-bottom: 0.4em;
    }
.title-page h2 {
    font-size: 1.2em; margin-top: 0;
    }
.meta-block {
    margin-top: 2em;
    font-size: 0.9em;
    text-align: left;
    }
.meta-block p {
    margin: 0.2em 0;
    }
.footnotes {
    margin-top: 2em;
    border-top: 1px solid #999;
    font-size: 0.9em;
    }
.footnote-ref {
    text-decoration: none;
    vertical-align: super;
    font-size: 0.8em;
    }
`;

;// ./src/epub/epubTemplates.js



function peopleLine(label, people) {
    if (!people?.length) return "";

    const value = people
        .map(person =>
            person.url
                ? `${escapeXml(person.name)} (${escapeXml(person.url)})`
                : escapeXml(person.name)
        )
        .join(", ");

    return `<p><strong>${escapeXml(label)}:</strong> ${value}</p>`;
}

function externalLink(url, label = url) {
    if (!url) return "";

    return `<a href="${escapeXml(url)}">${escapeXml(label)}</a>`;
}

/**
 * Формирует отдельные строки для разделов меток Ficbook:
 *
 * Предупреждения: ...
 * Другие метки: ...
 *
 * Если разделы отсутствуют, использует общий список tags.
 */
function tagSectionLines(tagSections, fallbackTags) {
    if (Array.isArray(tagSections) && tagSections.length) {
        return tagSections
            .filter(section =>
                section?.label &&
                Array.isArray(section.tags) &&
                section.tags.length
            )
            .map(section => {
                const label = escapeXml(section.label);
                const values = escapeXml(section.tags.join(", "));

                return `<p><strong>${label}:</strong> ${values}</p>`;
            })
            .join("");
    }

    return fallbackTags
        ? `<p><strong>Метки:</strong> ${escapeXml(fallbackTags)}</p>`
        : "";
}

function buildTitlePage({ meta, cover }) {
    const {
        title,
        mainAuthor,
        coauthors,
        translators,
        coTranslators,
        betas,
        gammas,
        editors,
        unclassifiedParticipants,
        direction,
        rating,
        size,
        status,
        tags,
        tagSections,
        description,
        notes,
        otherPublication,
        universe,
        fandom,
        pairings,
        series,
        sourceUrl
    } = meta;

    const xhtml = `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ru">
<head>
    <title>${escapeXml(title)}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <div class="title-page">
        ${cover ? `<img class="cover" src="images/${cover.fileName}" alt="Обложка"/>` : ""}
        <h1>${escapeXml(title)}</h1>
        <h2>${escapeXml(mainAuthor?.name || "")}</h2>

        <div class="meta-block">
            ${sourceUrl
        ? `<p><strong>Ссылка на работу:</strong> ${externalLink(sourceUrl)}</p>`
        : ""}
            ${direction
        ? `<p><strong>Направленность:</strong> ${escapeXml(direction)}</p>`
        : ""}
            ${peopleLine("Переводчик", translators)}
            ${peopleLine("Сопереводчики", coTranslators)}
            ${peopleLine("Соавторы", coauthors)}
            ${peopleLine("Бета", betas)}
            ${peopleLine("Гамма", gammas)}
            ${peopleLine("Редакторы", editors)}
            ${peopleLine("Участники (роль не определена)", unclassifiedParticipants)}
            ${series
        ? `<p><strong>Серия:</strong> ${escapeXml(series.name)}${series.url
            ? ` (${escapeXml(series.url)})`
            : ""}</p>`
        : ""}
            ${universe
        ? `<p><strong>Вселенная:</strong> ${escapeXml(universe)}</p>`
        : ""}
            ${fandom
        ? `<p><strong>Фэндом:</strong> ${escapeXml(fandom)}</p>`
        : ""}
            ${pairings?.length
        ? `<p><strong>Пейринги и персонажи:</strong> ${escapeXml(pairings.join(", "))}</p>`
        : ""}
            ${rating
        ? `<p><strong>Рейтинг:</strong> ${escapeXml(rating)}</p>`
        : ""}
            ${size
        ? `<p><strong>Размер:</strong> ${escapeXml(size)} слов</p>`
        : ""}
            ${status
        ? `<p><strong>Статус:</strong> ${escapeXml(status)}</p>`
        : ""}
            ${tagSectionLines(tagSections, tags)}
        </div>
    </div>

    ${description
        ? `<h2>Описание</h2>${textToParagraphs(description)}`
        : ""}
    ${notes
        ? `<h2>Примечания</h2>${textToParagraphs(notes)}`
        : ""}
    ${otherPublication
        ? `<h2>Публикация на других ресурсах</h2><p>${escapeXml(otherPublication)}</p>`
        : ""}
</body>
</html>`;

    return xhtml.replace(/^[ \t]*\r?\n/gm, "");
}

function buildChapterPage(chapter) {
    return `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ru">
<head>
    <title>${escapeXml(chapter.title)}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <h1>${escapeXml(`${chapter.number}. ${chapter.title}`)}</h1>
    ${chapter.content}
</body>
</html>`;
}

function buildTocXhtml(chapters) {
    const items = chapters
        .map(chapter =>
            `<li><a href="${escapeXml(chapter.file)}">${escapeXml(
                `${chapter.number}. ${chapter.title}`
            )}</a></li>`
        )
        .join("\n");

    return `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ru">
<head>
    <title>Оглавление</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <h1>Оглавление</h1>
    <ol>${items}</ol>
</body>
</html>`;
}
;// ./src/epub/epubOpf.js


function buildOpf({ meta, chapters, cover, bookId }) {
    const manifest = [
        `<item id="css" href="style.css" media-type="text/css"/>`,
        `<item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>`,
        `<item id="toc" href="toc.xhtml" media-type="application/xhtml+xml"/>`,
        ...chapters.map(chapter => `<item id="${chapter.id}" href="${chapter.file}" media-type="application/xhtml+xml"/>`),
        ...(cover ? [`<item id="cover-image" href="images/${cover.fileName}" media-type="${cover.mediaType}"/>`] : []),
        `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`
    ].join("\n        ");

    const spine = [
        `<itemref idref="titlepage"/>`,
        `<itemref idref="toc"/>`,
        ...chapters.map(chapter => `<itemref idref="${chapter.id}"/>`)
    ].join("\n        ");

    return `<?xml version="1.0" encoding="utf-8"?>
<package version="2.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>${escapeXml(meta.title)}</dc:title>
        <dc:creator>${escapeXml(meta.mainAuthor?.name || "UnknownAuthor")}</dc:creator>
        <dc:language>ru</dc:language>
        <dc:identifier id="BookId">urn:uuid:${escapeXml(bookId)}</dc:identifier>
        <dc:date>${new Date().toISOString().split("T")[0]}</dc:date>
        <dc:subject>${escapeXml(meta.tags || "fanfiction")}</dc:subject>
        <dc:description>${escapeXml((meta.description || "").slice(0, 1000))}</dc:description>
        <dc:source>${escapeXml(meta.sourceUrl)}</dc:source>
        ${cover ? `<meta name="cover" content="cover-image"/>` : ""}
    </metadata>
    <manifest>
        ${manifest}
    </manifest>
    <spine toc="ncx">
        ${spine}
    </spine>
    <guide>
        <reference type="cover" title="Обложка" href="titlepage.xhtml"/>
        <reference type="toc" title="Оглавление" href="toc.xhtml"/>
    </guide>
</package>`;
}

;// ./src/epub/epubNcx.js


function buildNcx(title, chapters, bookId) {
    const navPoints = chapters.map((chapter, index) => `
        <navPoint id="navPoint-${index + 2}" playOrder="${index + 2}">
            <navLabel><text>${escapeXml(`${chapter.number}. ${chapter.title}`)}</text></navLabel>
            <content src="${escapeXml(chapter.file)}"/>
        </navPoint>`).join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
        <meta name="dtb:uid" content="urn:uuid:${escapeXml(bookId)}"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle><text>${escapeXml(title)}</text></docTitle>
    <navMap>
        <navPoint id="navPoint-1" playOrder="1">
            <navLabel><text>Оглавление</text></navLabel>
            <content src="toc.xhtml"/>
        </navPoint>
        ${navPoints}
    </navMap>
</ncx>`;
}

;// ./src/epub/epubBuilder.js












function epubBuilder_escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderEpubFootnotes(chapter) {
    let content = chapter.xhtml;
    const notes = [];

    for (const note of chapter.footnotes || []) {
        const id = `fn_${chapter.number}_${note.id}`;
        const pattern = new RegExp(
            `<footnote-ref[^>]*id=["']${epubBuilder_escapeRegExp(note.id)}["'][^>]*>(?:<\\/footnote-ref>)?`,
            "g"
        );
        content = content.replace(
            pattern,
            `<a href="#${escapeXml(id)}" epub:type="noteref" class="footnote-ref">[${note.number}]</a>`
        );
        notes.push({ id, number: note.number, html: note.html });
    }

    content = content.replace(/<\/?footnote-ref[^>]*>/g, "");
    if (!notes.length) return content;

    return `${content}
<div class="footnotes">
${notes.map(note => `<aside id="${escapeXml(note.id)}" epub:type="footnote"><p><sup>${note.number}</sup> ${note.html}</p></aside>`).join("\n")}
</div>`;
}

function epubBuilder_cancelledError() {
    return new Error("cancelled");
}

function waitForZip(promise, isCancelled, timeoutMs = 60000) {
    return new Promise((resolve, reject) => {
        let settled = false;
        let cancelTimer = null;
        let timeoutTimer = null;

        const cleanup = () => {
            if (cancelTimer !== null) clearInterval(cancelTimer);
            if (timeoutTimer !== null) clearTimeout(timeoutTimer);
        };

        const finish = (fn, value) => {
            if (settled) return;
            settled = true;
            cleanup();
            fn(value);
        };

        cancelTimer = setInterval(() => {
            if (isCancelled()) finish(reject, epubBuilder_cancelledError());
        }, 100);

        timeoutTimer = setTimeout(() => {
            finish(reject, new Error(`JSZip не завершил упаковку EPUB за ${Math.round(timeoutMs / 1000)} секунд.`));
        }, timeoutMs);

        Promise.resolve(promise).then(
            value => finish(resolve, value),
            error => finish(reject, error)
        );
    });
}

async function createEPUB(onProgress = () => {}, isCancelled = () => false, options = {}) {
    const book = await collectBook(onProgress, isCancelled, { ...options, coverMode: "epub" });
    if (isCancelled()) throw epubBuilder_cancelledError();

    options.onStage?.("Создание EPUB…");
    const { meta, cover } = book;
    const chapters = book.chapters.map(chapter => ({
        ...chapter,
        id: `chapter${chapter.number}`,
        file: `chapter${chapter.number}.xhtml`,
        content: renderEpubFootnotes(chapter)
    }));
    const bookId = createBookId();
    const zip = new jszip_min();

    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
    zip.file("META-INF/container.xml", `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`);
    zip.file("OEBPS/style.css", epubCss.trim());
    zip.file("OEBPS/titlepage.xhtml", buildTitlePage({ meta, cover }));
    chapters.forEach(chapter => zip.file(`OEBPS/${chapter.file}`, buildChapterPage(chapter)));
    zip.file("OEBPS/toc.xhtml", buildTocXhtml(chapters));
    zip.file("OEBPS/content.opf", buildOpf({ meta, chapters, cover, bookId }));
    zip.file("OEBPS/toc.ncx", buildNcx(meta.title, chapters, bookId));
    if (cover) zip.file(`OEBPS/images/${cover.fileName}`, cover.bytes, { binary: true });

    console.info(
        `[Ficbook Exporter] EPUB: к упаковке — ${chapters.length} глав, ` +
        `${chapters.reduce((sum, chapter) => sum + (chapter.content?.length || 0), 0)} символов, ` +
        `${cover ? "с обложкой" : "без обложки"}`
    );

    const started = performance.now();
    let lastShownPercent = -1;
    const generatePromise = zip.generateAsync(
        {
            type: "blob",
            mimeType: "application/epub+zip",
            compression: "DEFLATE",
            compressionOptions: { level: 6 }
        },
        metaInfo => {
            if (isCancelled()) return;
            const percent = Math.max(0, Math.min(100, Math.floor(metaInfo?.percent || 0)));
            if (percent !== lastShownPercent) {
                lastShownPercent = percent;
                options.onStage?.(`Сборка ${percent}%`);
            }
        }
    );

    const blob = await waitForZip(generatePromise, isCancelled, 60000);
    if (isCancelled()) throw epubBuilder_cancelledError();

    console.info(
        `[Ficbook Exporter] EPUB: упаковка ZIP — ${Math.round(performance.now() - started)} мс, ` +
        `${blob.size} байт`
    );

    const translator = meta.translators?.[0]?.name;
    const titlePart = translator ? `${meta.title}_[${translator}]` : meta.title;
    const fileName = `${generateFileBaseName(meta.mainAuthor?.name || "UnknownAuthor", titlePart)}.epub`;
    const artifact = { blob, fileName, sourceUrl: meta.sourceUrl, format: "EPUB" };

    if (options.returnFile) return artifact;

    downloadBlob(blob, fileName);
    return artifact;
}

;// ./src/txt/txtBuilder.js




function addLine(lines, label, value) {
    if (
        !value ||
        (Array.isArray(value) && !value.length)
    ) {
        return;
    }

    const text = Array.isArray(value)
        ? value.join(", ")
        : value;

    lines.push(`${label}: ${text}`);
}

function addTagSections(lines, meta) {
    const tagSections = Array.isArray(meta.tagSections)
        ? meta.tagSections.filter(section =>
            section?.label &&
            Array.isArray(section.tags) &&
            section.tags.length
        )
        : [];

    /*
     * Выводим метки по разделам Ficbook:
     *
     * Предупреждения: ...
     * Другие метки: ...
     */
    if (tagSections.length) {
        tagSections.forEach(section => {
            addLine(
                lines,
                section.label,
                section.tags
            );
        });

        return;
    }

    /*
     * Резервный вариант для старых данных,
     * в которых tagSections ещё отсутствует.
     */
    addLine(lines, "Метки", meta.tags);
}

function buildHeader(meta) {
    const lines = [
        meta.title,
        meta.mainAuthor?.name || "Неизвестный автор",
        ""
    ];

    addLine(lines, "Ссылка", meta.sourceUrl);
    addLine(lines, "Направленность", meta.direction);
    addLine(lines, "Рейтинг", meta.rating);
    addLine(lines, "Статус", meta.status);

    addLine(
        lines,
        "Размер",
        meta.size
            ? `${meta.size} слов`
            : ""
    );

    addLine(lines, "Вселенная", meta.universe);
    addLine(lines, "Фэндом", meta.fandom);

    addLine(
        lines,
        "Пейринги и персонажи",
        meta.pairings
    );

    addTagSections(lines, meta);

    addLine(
        lines,
        "Серия",
        meta.series?.name
    );

    addLine(
        lines,
        "Соавторы",
        meta.coauthors?.map(author => author.name)
    );

    addLine(
        lines,
        "Переводчики",
        meta.translators?.map(author => author.name)
    );

    addLine(
        lines,
        "Сопереводчики",
        meta.coTranslators?.map(author => author.name)
    );

    addLine(
        lines,
        "Бета",
        meta.betas?.map(author => author.name)
    );

    addLine(
        lines,
        "Гамма",
        meta.gammas?.map(author => author.name)
    );

    addLine(
        lines,
        "Редакторы",
        meta.editors?.map(author => author.name)
    );

    addLine(
        lines,
        "Участники (роль не определена)",
        meta.unclassifiedParticipants?.map(author => author.name)
    );

    addLine(
        lines,
        "Автор оригинала",
        meta.originalAuthor?.name
    );

    addLine(
        lines,
        "Оригинал",
        meta.originalWork?.url
    );

    if (meta.description) {
        lines.push(
            "",
            "Описание",
            meta.description
        );
    }

    if (meta.notes) {
        lines.push(
            "",
            "Примечания автора",
            meta.notes
        );
    }

    if (meta.otherPublication) {
        lines.push(
            "",
            "Публикация на других ресурсах",
            meta.otherPublication
        );
    }

    return lines.join("\n");
}

async function createTXT(
    onProgress = () => {},
    isCancelled = () => false,
    options = {}
) {
    const { meta, chapters } = await collectBook(
        onProgress,
        isCancelled,
        { ...options, coverMode: "none" }
    );
    options.onStage?.("Создание TXT…");

    const parts = [
        buildHeader(meta),
        "",
        "=".repeat(72)
    ];

    for (const chapter of chapters) {
        parts.push(
            "",
            `${chapter.number}. ${chapter.title}`,
            "-".repeat(72),
            "",
            chapter.plain
        );

        if (chapter.footnotes?.length) {
            parts.push("", "Сноски:");

            chapter.footnotes.forEach(note => {
                parts.push(
                    `[${note.number}] ${note.text}`
                );
            });
        }
    }

    const translator =
        meta.translators?.[0]?.name;

    const titlePart = translator
        ? `${meta.title}_[${translator}]`
        : meta.title;

    const fileName =
        `${generateFileBaseName(
            meta.mainAuthor?.name || "UnknownAuthor",
            titlePart
        )}.txt`;

    downloadBlob(
        new Blob(
            [
                "\ufeff",
                parts.join("\n")
            ],
            {
                type: "text/plain;charset=utf-8"
            }
        ),
        fileName
    );
}
;// ./src/utils/loadLibrary.js
const pendingLoads = new Map();

function requestText(url) {
    const gmRequest = globalThis.GM_xmlhttpRequest || globalThis.GM?.xmlHttpRequest;
    if (gmRequest) {
        return new Promise((resolve, reject) => {
            gmRequest({
                method: "GET",
                url,
                responseType: "text",
                timeout: 30000,
                onload: response => {
                    if (response.status >= 200 && response.status < 300) {
                        resolve(response.responseText || response.response);
                    } else {
                        reject(new Error(`HTTP ${response.status}: ${url}`));
                    }
                },
                onerror: () => reject(new Error(`Не удалось загрузить библиотеку: ${url}`)),
                ontimeout: () => reject(new Error(`Тайм-аут загрузки библиотеки: ${url}`))
            });
        });
    }

    return fetch(url).then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
        return response.text();
    });
}

function findGlobal(globalName) {
    if (!globalName) return undefined;

    const roots = [
        globalThis,
        typeof window !== "undefined" ? window : undefined,
        typeof unsafeWindow !== "undefined" ? unsafeWindow : undefined
    ];

    for (const root of roots) {
        if (root && root[globalName]) return root[globalName];
    }
    return undefined;
}

function meaningfulExport(value) {
    if (!value) return undefined;
    if (typeof value === "function") return value;
    if (typeof value !== "object") return value;
    if (value.default) return value.default;
    if (Object.keys(value).length) return value;
    return undefined;
}

/**
 * Выполняет браузерную UMD-сборку как CommonJS-модуль.
 * Это важно для Tampermonkey: обычный indirect eval может выполнить код в
 * другом global scope, из-за чего window.JSZip/pdfMake не видны userscript.
 */
function executeUmd(source, url, globalName) {
    const module = { exports: {} };
    const exports = module.exports;
    const setImmediateShim = typeof globalThis.setImmediate === "function"
        ? globalThis.setImmediate.bind(globalThis)
        : (callback, ...args) => setTimeout(callback, 0, ...args);
    const clearImmediateShim = typeof globalThis.clearImmediate === "function"
        ? globalThis.clearImmediate.bind(globalThis)
        : handle => clearTimeout(handle);

    // JSZip использует setImmediate в одной из веток UMD/CommonJS.
    // В браузерном sandbox Tampermonkey этого API может не быть.
    try {
        if (typeof globalThis.setImmediate !== "function") globalThis.setImmediate = setImmediateShim;
        if (typeof globalThis.clearImmediate !== "function") globalThis.clearImmediate = clearImmediateShim;
    } catch (_) {
        // Даже если запись в globalThis запрещена, параметры runner остаются доступны модулю.
    }

    const runner = new Function(
        "module",
        "exports",
        "define",
        "require",
        "global",
        "window",
        "self",
        "setImmediate",
        "clearImmediate",
        `${source}\n//# sourceURL=${url}`
    );

    runner.call(
        globalThis,
        module,
        exports,
        undefined,
        undefined,
        globalThis,
        globalThis,
        globalThis,
        setImmediateShim,
        clearImmediateShim
    );

    const exported = meaningfulExport(module.exports);
    const existing = findGlobal(globalName);
    const library = existing || exported;

    if (globalName && library && !globalThis[globalName]) {
        try {
            globalThis[globalName] = library;
        } catch (_) {
            // Достаточно вернуть объект напрямую, если sandbox запрещает запись.
        }
    }

    return findGlobal(globalName) || library || true;
}

async function loadOne(url, globalName) {
    const existing = findGlobal(globalName);
    if (existing) return existing;

    if (!pendingLoads.has(url)) {
        pendingLoads.set(url, (async () => {
            const source = await requestText(url);
            return executeUmd(source, url, globalName);
        })());
    }

    try {
        const result = await pendingLoads.get(url);
        if (globalName && !findGlobal(globalName) && !result) {
            throw new Error(`Библиотека загружена, но объект ${globalName} не появился.`);
        }
        return findGlobal(globalName) || result;
    } catch (error) {
        pendingLoads.delete(url);
        throw error;
    }
}

/**
 * Лениво загружает внешний UMD-скрипт в userscript sandbox.
 * Можно передать несколько CDN-адресов: следующий используется при ошибке.
 */
async function loadExternalScript(urlOrUrls, globalName = "") {
    const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
    const errors = [];

    for (const url of urls) {
        try {
            return await loadOne(url, globalName);
        } catch (error) {
            errors.push(error instanceof Error ? error.message : String(error));
        }
    }

    throw new Error(`Не удалось загрузить внешнюю библиотеку:\n${errors.join("\n")}`);
}

;// ./src/pdf/pdfBuilder.js





function linkFragment(url, label = url) {
    if (!url) {
        return {
            text: label || ""
        };
    }

    return {
        text: label || url,
        link: url,
        decoration: "underline",
        color: "#0645ad"
    };
}

function linkedValue(label, url) {
    if (!label && !url) return [];

    if (!url) {
        return [
            {
                text: label || ""
            }
        ];
    }

    return [
        {
            text: label || url
        },
        {
            text: " ("
        },
        linkFragment(url),
        {
            text: ")"
        }
    ];
}

function peopleValue(people) {
    const fragments = [];

    (people || []).forEach((person, index) => {
        if (index) {
            fragments.push({
                text: ", "
            });
        }

        fragments.push(
            ...linkedValue(person.name, person.url)
        );
    });

    return fragments;
}

function plainValue(value) {
    if (Array.isArray(value)) {
        return [
            {
                text: value.join(", ")
            }
        ];
    }

    return [
        {
            text: String(value ?? "")
        }
    ];
}

function metaRows(meta) {
    const rows = [];

    const add = (label, fragments) => {
        if (
            !fragments?.length ||
            fragments.every(fragment =>
                !String(fragment.text || "").trim()
            )
        ) {
            return;
        }

        rows.push({
            text: [
                {
                    text: `${label}: `,
                    bold: true
                },
                ...fragments
            ],
            margin: [0, 1, 0, 1]
        });
    };

    add(
        "Ссылка",
        meta.sourceUrl
            ? [linkFragment(meta.sourceUrl)]
            : []
    );

    add(
        "Направленность",
        meta.direction
            ? plainValue(meta.direction)
            : []
    );

    add(
        "Рейтинг",
        meta.rating
            ? plainValue(meta.rating)
            : []
    );

    add(
        "Статус",
        meta.status
            ? plainValue(meta.status)
            : []
    );

    add(
        "Размер",
        meta.size
            ? plainValue(`${meta.size} слов`)
            : []
    );

    add(
        "Вселенная",
        meta.universe
            ? plainValue(meta.universe)
            : []
    );

    add(
        "Фэндом",
        meta.fandom
            ? plainValue(meta.fandom)
            : []
    );

    add(
        "Пейринги и персонажи",
        meta.pairings?.length
            ? plainValue(meta.pairings)
            : []
    );

    /*
     * Выводим каждый раздел меток отдельно:
     *
     * Предупреждения: ...
     * Другие метки: ...
     *
     * Для старых данных без tagSections используется общий meta.tags.
     */
    const tagSections = Array.isArray(meta.tagSections)
        ? meta.tagSections.filter(section =>
            section?.label &&
            Array.isArray(section.tags) &&
            section.tags.length
        )
        : [];

    if (tagSections.length) {
        tagSections.forEach(section => {
            add(
                section.label,
                plainValue(section.tags)
            );
        });
    } else {
        add(
            "Метки",
            meta.tags
                ? plainValue(meta.tags)
                : []
        );
    }

    add(
        "Серия",
        meta.series
            ? linkedValue(
            meta.series.name,
            meta.series.url
            )
            : []
    );

    add(
        "Соавторы",
        peopleValue(meta.coauthors)
    );

    add(
        "Переводчики",
        peopleValue(meta.translators)
    );

    add(
        "Сопереводчики",
        peopleValue(meta.coTranslators)
    );

    add(
        "Бета",
        peopleValue(meta.betas)
    );

    add(
        "Гамма",
        peopleValue(meta.gammas)
    );

    add(
        "Редакторы",
        peopleValue(meta.editors)
    );

    add(
        "Участники (роль не определена)",
        peopleValue(meta.unclassifiedParticipants)
    );

    add(
        "Автор оригинала",
        meta.originalAuthor
            ? linkedValue(
            meta.originalAuthor.name,
            meta.originalAuthor.url
            )
            : []
    );

    add(
        "Оригинал",
        meta.originalWork?.url
            ? [linkFragment(meta.originalWork.url)]
            : []
    );

    return rows;
}

function paragraphNodes(text) {
    return String(text || "")
        .split(/\n{2,}/)
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => ({
            text: part,
            style: "body",
            margin: [0, 0, 0, 7]
        }));
}

function getPdfBlob(pdfMake, definition) {
    return new Promise((resolve, reject) => {
        try {
            pdfMake
                .createPdf(definition)
                .getBlob(resolve);
        } catch (error) {
            reject(error);
        }
    });
}

function buildPdfDefinition({
                                       meta,
                                       cover,
                                       chapters
                                   }) {
    const content = [];

    if (cover) {
        content.push({
            image: cover.dataUrl,
            fit: [360, 500],
            alignment: "center",
            margin: [0, 0, 0, 18]
        });
    }

    content.push({
        text: meta.title,
        style: "title"
    });

    content.push({
        text: linkedValue(
            meta.mainAuthor?.name || "Неизвестный автор",
            meta.mainAuthor?.url
        ),
        style: "author"
    });

    content.push(...metaRows(meta));

    if (meta.description) {
        content.push(
            {
                text: "Описание",
                style: "section"
            },
            ...paragraphNodes(meta.description)
        );
    }

    if (meta.notes) {
        content.push(
            {
                text: "Примечания автора",
                style: "section"
            },
            ...paragraphNodes(meta.notes)
        );
    }

    if (meta.otherPublication) {
        content.push(
            {
                text: "Публикация на других ресурсах",
                style: "section"
            },
            ...paragraphNodes(meta.otherPublication)
        );
    }

    if (chapters.length) {
        content.push({
            toc: {
                id: "chaptersToc",
                title: {
                    text: "Оглавление",
                    style: "tocTitle"
                },
                textStyle: "tocEntry",
                numberStyle: "tocPageNumber"
            },
            pageBreak: "before"
        });
    }

    chapters.forEach((chapter, index) => {
        const destinationId = `chapter-${index + 1}`;

        content.push({
            text: `${chapter.number}. ${chapter.title}`,
            style: "chapter",
            id: destinationId,
            tocItem: "chaptersToc",
            pageBreak: "before"
        });

        content.push(
            ...paragraphNodes(chapter.plain)
        );

        if (chapter.footnotes?.length) {
            content.push({
                text: "Сноски",
                style: "footnoteHeading"
            });

            chapter.footnotes.forEach(note => {
                content.push({
                    text: `[${note.number}] ${note.text}`,
                    style: "footnote"
                });
            });
        }
    });

    return {
        info: {
            title: meta.title,
            author:
                meta.mainAuthor?.name ||
                "UnknownAuthor",
            subject:
                meta.fandom ||
                meta.universe ||
                "fanfiction",

            /*
             * В служебных метаданных PDF оставляем
             * общий список всех меток.
             */
            keywords: meta.tags || ""
        },

        pageSize: "A4",
        pageMargins: [54, 54, 54, 58],

        defaultStyle: {
            font: "Roboto",
            fontSize: 11,
            lineHeight: 1.25
        },

        styles: {
            title: {
                fontSize: 22,
                bold: true,
                alignment: "center",
                margin: [0, 0, 0, 8]
            },

            author: {
                fontSize: 14,
                alignment: "center",
                margin: [0, 0, 0, 18]
            },

            section: {
                fontSize: 15,
                bold: true,
                margin: [0, 16, 0, 8]
            },

            tocTitle: {
                fontSize: 20,
                bold: true,
                alignment: "center",
                margin: [0, 0, 0, 18]
            },

            tocEntry: {
                fontSize: 11,
                margin: [0, 3, 0, 3]
            },

            tocPageNumber: {
                fontSize: 10,
                bold: true
            },

            chapter: {
                fontSize: 17,
                bold: true,
                alignment: "center",
                margin: [0, 0, 0, 18]
            },

            body: {
                fontSize: 11,
                alignment: "justify"
            },

            footnoteHeading: {
                fontSize: 11,
                bold: true,
                margin: [0, 12, 0, 5]
            },

            footnote: {
                fontSize: 9,
                margin: [0, 0, 0, 4]
            }
        },

        footer: (currentPage, pageCount) => ({
            text: `${currentPage} / ${pageCount}`,
            alignment: "center",
            fontSize: 8,
            margin: [0, 15, 0, 0]
        }),

        content
    };
}

async function createPDF(
    onProgress = () => {},
    isCancelled = () => false,
    options = {}
) {
    let modulesReady = false;
    const modulesPromise = Promise.all([
        loadExternalScript(
            [
                "https://cdn.jsdelivr.net/npm/pdfmake@0.2.20/build/pdfmake.min.js",
                "https://unpkg.com/pdfmake@0.2.20/build/pdfmake.min.js"
            ],
            "pdfMake"
        ),
        loadExternalScript([
            "https://cdn.jsdelivr.net/npm/pdfmake@0.2.20/build/vfs_fonts.js",
            "https://unpkg.com/pdfmake@0.2.20/build/vfs_fonts.js"
        ])
    ]).then(
        value => ({ value, error: null }),
        error => ({ value: null, error })
    ).finally(() => {
        modulesReady = true;
    });

    const book = await collectBook(
        onProgress,
        isCancelled,
        { ...options, coverMode: "pdf" }
    );

    if (!modulesReady) options.onStage?.("Модуль PDF…");
    const modulesResult = await modulesPromise;
    if (modulesResult.error) throw modulesResult.error;
    const [pdfMake, pdfFonts] = modulesResult.value;

    if (
        pdfFonts &&
        pdfFonts !== true &&
        typeof pdfMake.addVirtualFileSystem === "function"
    ) {
        pdfMake.addVirtualFileSystem(
            pdfFonts.default || pdfFonts
        );
    }

    options.onStage?.("Создание PDF…");
    const { meta } = book;
    const definition = buildPdfDefinition(book);
    const blob = await getPdfBlob(
        pdfMake,
        definition
    );

    const translator =
        meta.translators?.[0]?.name;

    const titlePart = translator
        ? `${meta.title}_[${translator}]`
        : meta.title;

    const fileName =
        `${generateFileBaseName(
            meta.mainAuthor?.name || "UnknownAuthor",
            titlePart
        )}.pdf`;

    downloadBlob(blob, fileName);
}
;// ./src/ui/buttons.js
/**
 * Встраивает компактную кнопку экспорта в штатную панель действий Ficbook.
 * Список форматов открывается рядом с кнопкой и не зависит от плавающих кнопок сайта.
 */
function createButtons(exporters) {
    const cleanupKey = "__ficbookExporterUiCleanup";
    if (typeof window[cleanupKey] === "function") window[cleanupKey]();

    // Удаляем интерфейс предыдущей версии, если скрипт был обновлён без перезагрузки страницы.
    document.querySelectorAll("#ficbook-export-buttons").forEach(element => element.remove());
    document.querySelector("#ficbook-export-ui-style")?.remove();

    const actionsContainer = document.querySelector(
        "section.chapter-info .hat-actions-container, .hat-actions-container"
    );
    if (!actionsContainer) return false;

    /**
     * Ищет основную строку действий Ficbook — ту, где находятся лайки,
     * отметки, комментарии и награды.
     */
    function findPlacement() {
        const currentContainer = document.querySelector(
            "section.chapter-info .hat-actions-container, .hat-actions-container"
        );
        if (!currentContainer) return null;

        const directRows = Array.from(currentContainer.children).filter(element =>
            element.matches?.(".d-flex.flex-wrap")
        );
        const rows = directRows.length
            ? directRows
            : Array.from(currentContainer.querySelectorAll(".d-flex.flex-wrap"));

        const primaryActionsRow = rows.find(row =>
            row.querySelector(
                ".ds-btn-primary, .js-marks-plus, .js-reward-count, " +
                "a[href*='/comments'], .ic_thumbs-up, .ic-star-empty, .ic_star-empty"
            ) &&
            !row.querySelector("a[href*='/collections/'], .button-container")
        );

        const fallbackRow = primaryActionsRow ||
            directRows[0] ||
            currentContainer.querySelector(".d-flex.flex-wrap") ||
            currentContainer.querySelector(".d-flex") ||
            currentContainer;

        return { row: fallbackRow };
    }

    const style = document.createElement("style");
    style.id = "ficbook-export-ui-style";
    style.textContent = `
#ficbook-export-buttons {
    position: relative;
    display: inline-flex;
    flex: 0 0 auto;
    z-index: 60;
    font-family: inherit;
}
#ficbook-export-buttons *,
#ficbook-export-buttons *::before,
#ficbook-export-buttons *::after {
    box-sizing: border-box;
}
.fbe-inline-trigger {
    width: 148px;
    min-width: 148px;
    max-width: 148px;
    justify-content: center;
    gap: 5px;
    overflow: hidden;
    white-space: nowrap;
    background: #4f86c6 !important;
    border: 1px solid #2f639d !important;
    color: #ffffff !important;
    font-weight: 700;
    transition: background-color .15s ease, border-color .15s ease;
}
.fbe-inline-trigger:hover,
.fbe-inline-trigger:focus-visible,
.fbe-inline-trigger[aria-expanded="true"] {
    background: #356da9 !important;
    border-color: #244f7c !important;
    color: #ffffff !important;
}
.fbe-inline-trigger-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}
.fbe-inline-trigger.is-busy {
    cursor: pointer;
}
.fbe-inline-trigger-chevron {
    margin-left: 1px;
    font-size: 9px;
    line-height: 1;
    opacity: .8;
    transition: transform .15s ease;
}
.fbe-inline-trigger[aria-expanded="true"] .fbe-inline-trigger-chevron {
    transform: rotate(180deg);
}
.fbe-inline-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    display: none;
    min-width: 154px;
    padding: 5px;
    border: 1px solid rgba(64, 48, 35, .18);
    border-radius: 8px;
    background: #fffaf3;
    box-shadow: 0 8px 22px rgba(45, 31, 22, .2);
    z-index: 10020;
}
.fbe-inline-menu.is-open {
    display: grid;
    gap: 3px;
}
.fbe-inline-menu-item {
    display: block;
    width: 100%;
    min-height: 34px;
    padding: 7px 10px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #3f2d21;
    cursor: pointer;
    font: inherit;
    font-size: 14px;
    line-height: 1.2;
    text-align: left;
    white-space: nowrap;
}
.fbe-inline-menu-item:hover,
.fbe-inline-menu-item:focus-visible {
    background: rgba(122, 87, 52, .12);
    outline: none;
}
body.dark-theme .fbe-inline-menu {
    border-color: rgba(255, 255, 255, .14);
    background: #2d2723;
    box-shadow: 0 8px 22px rgba(0, 0, 0, .42);
}
body.dark-theme .fbe-inline-menu-item {
    color: #f4ece5;
}
body.dark-theme .fbe-inline-menu-item:hover,
body.dark-theme .fbe-inline-menu-item:focus-visible {
    background: rgba(255, 255, 255, .09);
}

.fbe-warning-overlay {
    position: fixed;
    inset: 0;
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(0, 0, 0, .55);
}
.fbe-warning-dialog {
    width: min(520px, 100%);
    max-height: min(680px, calc(100vh - 40px));
    overflow: auto;
    padding: 20px;
    border: 1px solid rgba(122, 36, 36, .3);
    border-radius: 12px;
    background: #fffaf7;
    box-shadow: 0 18px 55px rgba(0, 0, 0, .35);
    color: #332822;
}
.fbe-warning-title {
    margin: 0 0 10px;
    color: #c62828;
    font-size: 20px;
    line-height: 1.25;
    font-weight: 800;
}
.fbe-warning-text {
    margin: 0 0 12px;
    color: #b71c1c;
    font-weight: 700;
    line-height: 1.45;
}
.fbe-warning-list {
    margin: 0 0 16px 20px;
    padding: 0;
    color: #b71c1c;
    font-weight: 700;
}
.fbe-warning-list li + li {
    margin-top: 4px;
}
.fbe-warning-note {
    margin: 0 0 18px;
    line-height: 1.45;
}
.fbe-warning-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
}
.fbe-warning-button {
    min-height: 38px;
    padding: 8px 14px;
    border-radius: 7px;
    border: 1px solid rgba(60, 45, 36, .25);
    background: #ffffff;
    color: #332822;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
}
.fbe-warning-button:hover,
.fbe-warning-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 134, 198, .2);
}
.fbe-warning-button-confirm {
    border-color: #a91f1f;
    background: #c62828;
    color: #ffffff;
}
.fbe-warning-button-confirm:hover,
.fbe-warning-button-confirm:focus-visible {
    background: #a91f1f;
}
body.dark-theme .fbe-warning-dialog {
    border-color: rgba(255, 105, 105, .35);
    background: #2d2723;
    color: #f4ece5;
}
body.dark-theme .fbe-warning-title,
body.dark-theme .fbe-warning-text,
body.dark-theme .fbe-warning-list {
    color: #ff7777;
}
body.dark-theme .fbe-warning-button {
    border-color: rgba(255, 255, 255, .2);
    background: #3a322d;
    color: #f4ece5;
}
body.dark-theme .fbe-warning-button-confirm {
    border-color: #d94848;
    background: #b72a2a;
    color: #ffffff;
}

@media (max-width: 767px) {
    .hat-actions-container > .d-flex.flex-wrap.justify-content-center {
        justify-content: flex-start !important;
        width: 100%;
    }
}

@media (max-width: 520px) {
    .fbe-inline-menu {
        left: auto;
        right: 0;
    }
}
`;

    document.querySelector(`#${style.id}`)?.remove();
    document.head.appendChild(style);

    const wrapper = document.createElement("div");
    wrapper.id = "ficbook-export-buttons";

    const menu = document.createElement("div");
    menu.className = "fbe-inline-menu";
    menu.id = "ficbook-export-format-menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Выберите формат файла");

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "ds-btn ds-btn-regular ds-btn-mini fbe-inline-trigger";
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-controls", menu.id);
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = `
<span class="fbe-inline-trigger-label">Скачать</span>
<span class="fbe-inline-trigger-chevron" aria-hidden="true">▼</span>`;

    const triggerLabel = trigger.querySelector(".fbe-inline-trigger-label");
    const triggerChevron = trigger.querySelector(".fbe-inline-trigger-chevron");
    let activeDownload = null;

    const configs = [
        { format: "FB2", start: exporters.fb2 },
        { format: "EPUB", start: exporters.epub },
        { format: "PDF", start: exporters.pdf },
        { format: "TXT", start: exporters.txt }
    ];

    function closeMenu() {
        menu.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
    }

    function openMenu() {
        if (activeDownload) return;
        menu.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        menu.querySelector(".fbe-inline-menu-item")?.focus();
    }

    function resetTrigger() {
        trigger.classList.remove("is-busy");
        triggerLabel.textContent = "Скачать";
        triggerChevron.textContent = "▼";
        trigger.title = "Выбрать формат файла";
    }


    function showMetadataWarning(warnings, format) {
        return new Promise(resolve => {
            const overlay = document.createElement("div");
            overlay.className = "fbe-warning-overlay";
            overlay.setAttribute("role", "presentation");

            const dialog = document.createElement("div");
            dialog.className = "fbe-warning-dialog";
            dialog.setAttribute("role", "alertdialog");
            dialog.setAttribute("aria-modal", "true");
            dialog.setAttribute("aria-labelledby", "fbe-warning-title");

            const title = document.createElement("h2");
            title.className = "fbe-warning-title";
            title.id = "fbe-warning-title";
            title.textContent = "ВНИМАНИЕ: часть данных не найдена";

            const text = document.createElement("p");
            text.className = "fbe-warning-text";
            text.textContent = "Ficbook Exporter не смог распознать некоторые данные страницы:";

            const list = document.createElement("ul");
            list.className = "fbe-warning-list";
            (warnings?.length ? warnings : ["неизвестная ошибка распознавания метаданных"]).forEach(message => {
                const item = document.createElement("li");
                item.textContent = message;
                list.appendChild(item);
            });

            const note = document.createElement("p");
            note.className = "fbe-warning-note";
            note.textContent = `Можно продолжить и скачать ${format}, но отсутствующие данные будут пропущены или заменены безопасным значением.`;

            const actions = document.createElement("div");
            actions.className = "fbe-warning-actions";

            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.className = "fbe-warning-button";
            cancelButton.textContent = "Отмена";

            const confirmButton = document.createElement("button");
            confirmButton.type = "button";
            confirmButton.className = "fbe-warning-button fbe-warning-button-confirm";
            confirmButton.textContent = "Скачать всё равно";

            actions.append(cancelButton, confirmButton);
            dialog.append(title, text, list, note, actions);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            const finish = accepted => {
                document.removeEventListener("keydown", onWarningKeyDown, true);
                overlay.remove();
                resolve(accepted);
            };

            const onWarningKeyDown = event => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    finish(false);
                }
            };

            cancelButton.addEventListener("click", () => finish(false), { once: true });
            confirmButton.addEventListener("click", () => finish(true), { once: true });
            overlay.addEventListener("click", event => {
                if (event.target === overlay) finish(false);
            });
            document.addEventListener("keydown", onWarningKeyDown, true);
            confirmButton.focus();
        });
    }

    function cancelActiveDownload() {
        if (!activeDownload || activeDownload.stopping) return;
        activeDownload.stopping = true;
        activeDownload.cancelled = true;
        triggerLabel.textContent = "Остановка…";
        triggerChevron.textContent = "";
    }

    async function runDownload(config) {
        if (activeDownload) return;
        closeMenu();

        const state = { cancelled: false, stopping: false, format: config.format };
        activeDownload = state;
        trigger.classList.add("is-busy");
        triggerLabel.textContent = `Подготовка ${config.format}`;
        triggerChevron.textContent = "×";
        trigger.title = `Остановить экспорт ${config.format}`;

        try {
            const onStage = stage => {
                if (state.cancelled) throw new Error("cancelled");
                triggerLabel.textContent = `${config.format}: ${stage}`;
            };
            let options = { onStage };

            while (!state.cancelled) {
                try {
                    await config.start(
                        (current, total) => {
                            if (state.cancelled) throw new Error("cancelled");
                            triggerLabel.textContent = `${config.format} ${current}/${total}`;
                        },
                        () => state.cancelled,
                        options
                    );
                    break;
                } catch (error) {
                    if (
                        error?.name === "MetadataWarningError" &&
                        !options.allowIncompleteMetadata
                    ) {
                        triggerLabel.textContent = "Нужно подтверждение";
                        triggerChevron.textContent = "!";

                        const accepted = await showMetadataWarning(
                            error.warnings,
                            config.format
                        );

                        if (!accepted || state.cancelled) break;

                        options = { ...options, allowIncompleteMetadata: true };
                        triggerLabel.textContent = `Подготовка ${config.format}`;
                        triggerChevron.textContent = "×";
                        continue;
                    }

                    throw error;
                }
            }
        } catch (error) {
            if (error?.message !== "cancelled") {
                console.error(`Ошибка экспорта ${config.format}:`, error);
                alert(`Не удалось создать файл ${config.format}:\n${error?.message || error}`);
            }
        } finally {
            if (activeDownload === state) activeDownload = null;
            resetTrigger();
        }
    }

    configs.forEach(config => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "fbe-inline-menu-item";
        item.setAttribute("role", "menuitem");
        item.textContent = `Скачать ${config.format}`;
        item.addEventListener("click", event => {
            event.stopPropagation();
            runDownload(config);
        });
        menu.appendChild(item);
    });

    trigger.addEventListener("click", event => {
        event.stopPropagation();
        if (activeDownload) {
            cancelActiveDownload();
            return;
        }
        if (menu.classList.contains("is-open")) closeMenu();
        else openMenu();
    });

    function onDocumentClick(event) {
        if (!wrapper.contains(event.target)) closeMenu();
    }

    function onKeyDown(event) {
        if (event.key === "Escape") {
            closeMenu();
            trigger.focus();
        }
    }

    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onKeyDown);

    wrapper.append(menu, trigger);

    /**
     * Ставит кнопку в основную строку действий вместе с лайками,
     * комментариями и наградами. Если Ficbook пересоздал панель,
     * кнопка автоматически возвращается в новый контейнер.
     */
    function insertWrapper() {
        const placement = findPlacement();
        if (!placement?.row) return false;

        const { row } = placement;
        if (wrapper.parentElement !== row) {
            row.appendChild(wrapper);
        }
        return true;
    }

    insertWrapper();
    resetTrigger();

    // Ficbook может дорисовывать или полностью пересоздавать панель действий.
    // Наблюдатель с небольшой задержкой возвращает кнопку на правильное место.
    let reinjectTimer = null;
    const placementObserver = new MutationObserver(() => {
        if (reinjectTimer !== null) return;
        reinjectTimer = window.setTimeout(() => {
            reinjectTimer = null;
            insertWrapper();
        }, 150);
    });
    placementObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    window[cleanupKey] = () => {
        document.removeEventListener("click", onDocumentClick);
        document.removeEventListener("keydown", onKeyDown);
        placementObserver.disconnect();
        if (reinjectTimer !== null) window.clearTimeout(reinjectTimer);
        wrapper.remove();
        style.remove();
        delete window[cleanupKey];
    };

    return true;
}

;// ./src/ui/batchExport.js







const BATCH_STYLE_ID = "ficbook-batch-export-style";
const BATCH_ROOT_ID = "ficbook-batch-export";
const MAX_LIST_PAGES = 500;
const BETWEEN_WORKS_MIN_MS = 1500;
const BETWEEN_WORKS_MAX_MS = 3000;
const WHOLE_WORK_RETRY_MIN_MS = 4500;
const WHOLE_WORK_RETRY_MAX_MS = 7000;

function isAuthorProfilePage() {
    return /^\/authors\/[^/]+\/?$/.test(location.pathname);
}

function isAuthorWorksPage() {
    return /^\/authors\/[^/]+\/profile\/works\/?$/.test(location.pathname);
}

function supportsAuthorBatchButtons() {
    // Кнопки автора нужны только на основной странице профиля и на странице
    // «Работы». Раньше проверка /authors/<id>/ была слишком широкой и
    // добавляла кнопку также в «Сборники», «Беты», «Подарки» и другие разделы.
    return isAuthorProfilePage() || isAuthorWorksPage();
}

function isCollectionPage() {
    return /^\/collections\/[^/]+(?:\/|$)/.test(location.pathname);
}

function isSeriesPage() {
    return /^\/series\/[^/]+(?:\/|$)/.test(location.pathname);
}

// Один таймер вместо старого цикла по 150 мс. Короткие повторяющиеся таймеры
// Chrome особенно сильно замедляет в фоновой вкладке, из-за чего пауза между
// произведениями могла растягиваться во много раз.
async function cancellableDelay(ms, isCancelled = () => false) {
    if (isCancelled()) throw new Error("cancelled");
    await delay(Math.max(0, ms));
    if (isCancelled()) throw new Error("cancelled");
}

function randomDelay(min, max, isCancelled = () => false) {
    return cancellableDelay(min + Math.random() * (max - min), isCancelled);
}

function cleanUrl(value) {
    try {
        const url = new URL(value, location.origin);
        url.hash = "";
        return url.href;
    } catch (_) {
        return "";
    }
}

function normalizeWorkUrl(value) {
    try {
        const url = new URL(value, location.origin);
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts[0] !== "readfic" || !parts[1]) return "";
        return new URL(`/readfic/${parts[1]}`, url.origin).href;
    } catch (_) {
        return "";
    }
}

function extractWorkUrls(doc) {
    return [...new Set(
        Array.from(doc.querySelectorAll(".fanfic-inline-title a.visit-link[href*='/readfic/']"))
            .map(link => normalizeWorkUrl(link.getAttribute("href") || link.href || ""))
            .filter(Boolean)
    )];
}

function isFilteredListInfo(info) {
    return info?.type === "author-filtered" || info?.type === "collection-filtered";
}

function isPaginationParam(key) {
    return /^(?:page|p|page_num|page_number|offset)$/i.test(String(key || ""));
}

function filteredListUrl(value) {
    try {
        const url = new URL(value, location.origin);
        url.hash = "";
        url.searchParams.delete("rnd");

        // Если пользователь оказался не на первой странице, пакет всё равно должен
        // начать с начала отфильтрованной выдачи, а затем пройти пагинацию сам.
        for (const key of [...url.searchParams.keys()]) {
            if (isPaginationParam(key)) url.searchParams.delete(key);
        }
        url.pathname = url.pathname.replace(/\/(?:page|p)\/\d+\/?$/i, "");
        return url.href;
    } catch (_) {
        return cleanUrl(value);
    }
}

function hasMeaningfulQueryFilters(value) {
    try {
        const url = new URL(value, location.origin);
        for (const [key, rawValue] of url.searchParams.entries()) {
            if (key === "rnd" || isPaginationParam(key)) continue;
            if (String(rawValue || "").trim() !== "") return true;
        }
    } catch (_) {
        // Ничего.
    }
    return false;
}

function mergeBaseQueryIntoPageUrl(url, baseUrl, info) {
    if (!isFilteredListInfo(info)) return url;

    try {
        const base = new URL(baseUrl);
        const target = new URL(url);

        // Пагинация Ficbook может не повторить часть параметров фильтра.
        // Сохраняем текущие параметры фильтра/сортировки, но не навязываем rnd
        // и не перезаписываем номер страницы, который пришёл из ссылки пагинации.
        for (const [key, value] of base.searchParams.entries()) {
            if (key === "rnd" || isPaginationParam(key)) continue;
            if (!target.searchParams.has(key)) target.searchParams.set(key, value);
        }
        return target;
    } catch (_) {
        return url;
    }
}

function paginationUrls(doc, baseUrl, info) {
    let base;
    try {
        base = new URL(baseUrl);
    } catch (_) {
        return [];
    }

    const selectors = [
        ".pagination a[href]",
        ".pager a[href]",
        ".paginator a[href]",
        ".page-pagination a[href]",
        ".pagination-holder a[href]",
        ".pagination-wrapper a[href]",
        "nav[aria-label*='страниц' i] a[href]",
        "a[rel='next'][href]",
        "a[rel='prev'][href]"
    ].join(", ");

    const urls = [];
    for (const link of doc.querySelectorAll(selectors)) {
        try {
            let url = new URL(link.getAttribute("href") || link.href || "", base);
            url = mergeBaseQueryIntoPageUrl(url, base, info);
            url.hash = "";
            if (url.origin !== base.origin) continue;

            const basePath = base.pathname.replace(/\/$/, "");
            const targetPath = url.pathname.replace(/\/$/, "");
            const samePath = targetPath === basePath;
            const childPagePath = targetPath.startsWith(`${basePath}/`);
            if (!samePath && !childPagePath) continue;

            urls.push(url.href);
        } catch (_) {
            // Игнорируем повреждённые ссылки пагинации.
        }
    }

    return [...new Set(urls)];
}

function looksLikeCompleteHtml(html) {
    if (!html || html.length < 500) return false;
    if (/cf-browser-verification|Cloudflare|Too Many Requests|<title>\s*(?:429|500|502|503|504)/i.test(html)) {
        return false;
    }
    return /<\/body\s*>/i.test(html) || /<\/html\s*>/i.test(html);
}

async function fetchDocument(url, { isCancelled = () => false, onNetworkState = () => {} } = {}) {
    const current = new URL(location.href);
    const target = new URL(url);
    const sameDocument =
        current.origin === target.origin &&
        current.pathname.replace(/\/$/, "") === target.pathname.replace(/\/$/, "") &&
        current.search === target.search;

    if (sameDocument) return document;

    const { text: html } = await fetchTextWithRetries(target.href, {
        credentials: "same-origin",
        isCancelled,
        onState: onNetworkState,
        maxAttempts: 5,
        retryBaseMs: 1200,
        requestTimeoutMs: 45000,
        validateText: text => looksLikeCompleteHtml(text)
    });

    return new DOMParser().parseFromString(html, "text/html");
}

function authorProfileName() {
    return (
        document.querySelector(".profile-header-body .text-t1.text-bold")?.textContent?.trim() ||
        document.querySelector("meta[property='og:title']")?.getAttribute("content")?.split("–")[0]?.trim() ||
        "Автор"
    );
}

function authorInfo() {
    const worksLink = document.querySelector(".sidebar-nav a[href*='/profile/works']");
    const counter = worksLink?.querySelector(".counter")?.textContent || worksLink?.textContent || "";
    const expectedCount = Number.parseInt(counter.replace(/\D/g, ""), 10) || 0;
    const profileName = authorProfileName();

    let listUrl = worksLink?.getAttribute("href") || worksLink?.href || "";
    if (!listUrl) {
        const match = location.pathname.match(/^\/authors\/([^/]+)/);
        if (match) listUrl = `/authors/${match[1]}/profile/works`;
    }

    return {
        type: "author",
        expectedCount,
        listUrl: cleanUrl(listUrl),
        label: profileName,
        buttonText: "Скачать все работы",
        archiveBase: `${profileName} - все работы`
    };
}

function filteredAuthorInfo() {
    if (!isAuthorWorksPage()) return null;

    const profileName = authorProfileName();

    return {
        type: "author-filtered",
        expectedCount: 0,
        listUrl: filteredListUrl(location.href),
        label: profileName,
        buttonText: "Скачать по фильтрам",
        archiveBase: `${profileName} - по фильтрам`
    };
}

function collectionInfo() {
    const heading = document.querySelector(".collections-page-heading");
    const headingText = heading?.textContent?.replace(/\s+/g, " ")?.trim() || "Сборник";
    const countMatch = headingText.match(/\((\d+)\)\s*$/);
    const expectedCount = countMatch ? Number.parseInt(countMatch[1], 10) : 0;
    const label = headingText.replace(/\s*\(\d+\)\s*$/, "").trim() || "Сборник";
    const url = new URL(location.href);
    url.search = "";
    url.hash = "";

    return {
        type: "collection",
        expectedCount,
        listUrl: url.href,
        label,
        buttonText: "Скачать сборник",
        archiveBase: label
    };
}

function filteredCollectionInfo() {
    if (!isCollectionPage()) return null;

    const allInfo = collectionInfo();
    return {
        type: "collection-filtered",
        // Число возле заголовка относится ко всему сборнику, а не к результату
        // фильтрации, поэтому сравнивать с ним отфильтрованную выдачу нельзя.
        expectedCount: 0,
        listUrl: filteredListUrl(location.href),
        label: allInfo.label,
        buttonText: "Скачать по фильтрам",
        archiveBase: `${allInfo.label} - по фильтрам`
    };
}

function seriesInfo() {
    const heading = document.querySelector("h1.heading.word-break, h1.heading");
    const headingText = heading?.textContent?.replace(/\s+/g, " ")?.trim() || "Серия";
    const label = headingText
        .replace(/^Серия\s+[«\"]?/i, "")
        .replace(/[»\"]\s*$/, "")
        .trim() || "Серия";

    const countNode = Array.from(document.querySelectorAll("div, p, span"))
        .find(node => /^В серии\s+\d+\s+работ/i.test((node.textContent || "").replace(/\s+/g, " ").trim()));
    const countMatch = (countNode?.textContent || "").match(/В серии\s+(\d+)\s+работ/i);
    const expectedCount = countMatch ? Number.parseInt(countMatch[1], 10) : 0;

    const url = new URL(location.href);
    url.search = "";
    url.hash = "";

    return {
        type: "series",
        expectedCount,
        listUrl: url.href,
        label,
        buttonText: "Скачать серию",
        archiveBase: `Серия ${label}`
    };
}

function pageInfos() {
    if (supportsAuthorBatchButtons()) {
        return [authorInfo(), filteredAuthorInfo()].filter(Boolean);
    }
    if (isCollectionPage()) {
        return [collectionInfo(), filteredCollectionInfo()].filter(Boolean);
    }
    if (isSeriesPage()) return [seriesInfo()];
    return [];
}

function typeLabel(info) {
    if (info.type === "author") return "Все работы автора";
    if (info.type === "author-filtered") return "Работы автора по текущим фильтрам";
    if (info.type === "collection") return "Сборник";
    if (info.type === "collection-filtered") return "Сборник по текущим фильтрам";
    if (info.type === "series") return "Серия";
    return "Пакет";
}

async function collectAllWorkUrls(info, onStatus, isCancelled) {
    if (!info?.listUrl) throw new Error("Не удалось определить страницу со списком работ.");

    const queue = [info.listUrl];
    const visited = new Set();
    const works = new Set();

    while (queue.length) {
        if (isCancelled()) throw new Error("cancelled");
        if (visited.size >= MAX_LIST_PAGES) {
            throw new Error(`Слишком много страниц списка (>${MAX_LIST_PAGES}). Экспорт остановлен для безопасности.`);
        }

        const pageUrl = queue.shift();
        if (!pageUrl || visited.has(pageUrl)) continue;
        visited.add(pageUrl);
        onStatus(`Проверка списка: страница ${visited.size}`);

        const doc = await fetchDocument(pageUrl, {
            isCancelled,
            onNetworkState: state => {
                if (state) onStatus(state);
            }
        });
        extractWorkUrls(doc).forEach(url => works.add(url));
        onStatus(`Проверка списка: страница ${visited.size}, найдено ${works.size}`);

        if (info.expectedCount > 0 && works.size === info.expectedCount) break;

        for (const nextUrl of paginationUrls(doc, info.listUrl, info)) {
            if (!visited.has(nextUrl) && !queue.includes(nextUrl)) queue.push(nextUrl);
        }
    }

    return [...works];
}

function installStyles() {
    if (document.getElementById(BATCH_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = BATCH_STYLE_ID;
    style.textContent = `
#${BATCH_ROOT_ID} { font-family: inherit; }
.fbe-batch-sidebar { margin-top: 10px; display: grid; gap: 7px; }
.fbe-batch-sidebar .fbe-batch-control,
.fbe-batch-sidebar .fbe-batch-trigger { width: 100%; }
.fbe-batch-collection { margin: 10px 0 14px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-start; }
.fbe-batch-series { margin: 8px 0 12px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-start; }
.fbe-batch-heading { display: inline-flex; flex: 0 0 auto; }
.fbe-batch-control { position: relative; display: inline-flex; }
.fbe-batch-trigger {
    min-height: 34px;
    gap: 6px;
    background: #4f86c6 !important;
    border: 1px solid #2f639d !important;
    color: #fff !important;
    font-weight: 700;
}
.fbe-batch-trigger:hover,
.fbe-batch-trigger:focus-visible,
.fbe-batch-trigger[aria-expanded="true"] {
    background: #356da9 !important;
    border-color: #244f7c !important;
    color: #fff !important;
}
.fbe-batch-trigger-chevron { font-size: 9px; transition: transform .15s ease; }
.fbe-batch-trigger[aria-expanded="true"] .fbe-batch-trigger-chevron { transform: rotate(180deg); }
.fbe-batch-menu {
    position: absolute;
    top: calc(100% + 5px);
    right: 0;
    z-index: 10030;
    display: none;
    min-width: 220px;
    padding: 5px;
    border: 1px solid rgba(64,48,35,.18);
    border-radius: 8px;
    background: #fffaf3;
    box-shadow: 0 8px 22px rgba(45,31,22,.2);
}
.fbe-batch-sidebar .fbe-batch-menu,
.fbe-batch-collection .fbe-batch-menu,
.fbe-batch-series .fbe-batch-menu { left: 0; right: auto; }
.fbe-batch-sidebar .fbe-batch-menu { width: 100%; }
.fbe-batch-menu.is-open { display: grid; gap: 3px; }
.fbe-batch-menu button {
    min-height: 34px;
    padding: 7px 10px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #3f2d21;
    cursor: pointer;
    font: inherit;
    text-align: left;
}
.fbe-batch-menu button:hover,
.fbe-batch-menu button:focus-visible { background: rgba(122,87,52,.12); outline: none; }
body.dark-theme .fbe-batch-menu { background: #2d2723; border-color: rgba(255,255,255,.14); }
body.dark-theme .fbe-batch-menu button { color: #f4ece5; }
body.dark-theme .fbe-batch-menu button:hover,
body.dark-theme .fbe-batch-menu button:focus-visible { background: rgba(255,255,255,.09); }

.fbe-batch-overlay {
    position: fixed;
    inset: 0;
    z-index: 100100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(0,0,0,.58);
}
.fbe-batch-dialog {
    width: min(650px, 100%);
    max-height: min(780px, calc(100vh - 40px));
    overflow: auto;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid rgba(75,55,40,.22);
    background: #fffaf7;
    box-shadow: 0 18px 55px rgba(0,0,0,.35);
    color: #332822;
}
.fbe-batch-title { margin: 0 0 12px; font-size: 21px; line-height: 1.25; }
.fbe-batch-summary { margin: 0 0 14px; line-height: 1.45; }
.fbe-batch-do-not-close {
    margin: 10px 0 14px;
    padding: 10px 12px;
    border-radius: 8px;
    background: rgba(198,40,40,.09);
    color: #9f1f1f;
    font-weight: 700;
    line-height: 1.4;
}
.fbe-batch-status { margin: 12px 0 8px; font-weight: 700; word-break: break-word; }
.fbe-batch-book-info { display: grid; gap: 5px; margin: 0 0 10px; }
.fbe-batch-info-line { color: #4f4037; word-break: break-word; }
.fbe-batch-info-line strong { color: inherit; }
.fbe-batch-stage { min-height: 22px; margin: 0 0 6px; color: #6c5a4d; word-break: break-word; }
.fbe-batch-network { min-height: 0; margin: 0 0 10px; color: #a05b00; font-weight: 700; word-break: break-word; }
.fbe-batch-url { margin: 0 0 10px; color: #8a7768; font-size: 12px; word-break: break-all; }
.fbe-batch-progress { height: 9px; overflow: hidden; border-radius: 999px; background: rgba(80,60,45,.14); }
.fbe-batch-progress > div { width: 0; height: 100%; background: #4f86c6; transition: width .18s ease; }
.fbe-batch-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; margin-top: 18px; }
.fbe-batch-action {
    min-height: 38px;
    padding: 8px 14px;
    border-radius: 7px;
    border: 1px solid rgba(60,45,36,.25);
    background: #fff;
    color: #332822;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
}
.fbe-batch-action-primary { background: #4f86c6; border-color: #2f639d; color: #fff; }
.fbe-batch-action-danger { background: #c62828; border-color: #a91f1f; color: #fff; }
.fbe-batch-error-list { margin: 10px 0 0 20px; padding: 0; color: #b71c1c; }
.fbe-batch-warning-title { color: #c62828; }
body.dark-theme .fbe-batch-dialog { background: #2d2723; color: #f4ece5; border-color: rgba(255,255,255,.14); }
body.dark-theme .fbe-batch-info-line,
body.dark-theme .fbe-batch-stage,
body.dark-theme .fbe-batch-url { color: #cdbfb4; }
body.dark-theme .fbe-batch-network { color: #ffc36a; }
body.dark-theme .fbe-batch-do-not-close { background: rgba(255,100,100,.12); color: #ff9a9a; }
body.dark-theme .fbe-batch-action { background: #3a322d; color: #f4ece5; border-color: rgba(255,255,255,.2); }
body.dark-theme .fbe-batch-action-primary { background: #356da9; color: #fff; }
body.dark-theme .fbe-batch-action-danger { background: #b72a2a; color: #fff; }
`;
    document.head.appendChild(style);
}

function makeOverlay(titleText) {
    const overlay = document.createElement("div");
    overlay.className = "fbe-batch-overlay";

    const dialog = document.createElement("div");
    dialog.className = "fbe-batch-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");

    const title = document.createElement("h2");
    title.className = "fbe-batch-title";
    title.textContent = titleText;

    dialog.appendChild(title);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    return { overlay, dialog, title };
}

function actionButton(text, className = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `fbe-batch-action ${className}`.trim();
    button.textContent = text;
    return button;
}

function confirmBatchStart(info, format, count) {
    return new Promise(resolve => {
        const { overlay, dialog } = makeOverlay(`${typeLabel(info)} → ${format}`);

        const text = document.createElement("p");
        text.className = "fbe-batch-summary";
        text.textContent =
            `Найдено работ: ${count}. Формат: ${format}. ` +
            "Каждое произведение будет отдельным файлом, а после проверки полноты все файлы будут упакованы в один ZIP.";

        const note = document.createElement("p");
        note.className = "fbe-batch-summary";
        note.textContent =
            "Работы загружаются последовательно. Защитные задержки между главами сохраняются; " +
            "между произведениями добавляется отдельная пауза.";

        const warning = document.createElement("div");
        warning.className = "fbe-batch-do-not-close";
        warning.textContent =
            "Не закрывайте и не перезагружайте страницу до окончания скачивания. " +
            "В фоне загрузка может замедлиться или приостановиться.";

        const actions = document.createElement("div");
        actions.className = "fbe-batch-actions";
        const cancel = actionButton("Отмена");
        const start = actionButton("Начать", "fbe-batch-action-primary");
        actions.append(cancel, start);
        dialog.append(text, note, warning, actions);

        const finish = value => {
            overlay.remove();
            resolve(value);
        };
        cancel.addEventListener("click", () => finish(false), { once: true });
        start.addEventListener("click", () => finish(true), { once: true });
        start.focus();
    });
}

function confirmIncompleteMetadata(url, warnings, format) {
    return new Promise(resolve => {
        const { overlay, dialog, title } = makeOverlay("ВНИМАНИЕ: часть данных не найдена");
        title.classList.add("fbe-batch-warning-title");

        const text = document.createElement("p");
        text.className = "fbe-batch-summary";
        text.textContent = `Проблема при пакетном экспорте ${format}: ${url}`;

        const list = document.createElement("ul");
        list.className = "fbe-batch-error-list";
        (warnings?.length ? warnings : ["неизвестная ошибка метаданных"]).forEach(message => {
            const item = document.createElement("li");
            item.textContent = message;
            list.appendChild(item);
        });

        const note = document.createElement("p");
        note.className = "fbe-batch-summary";
        note.textContent = "Можно продолжить эту работу с неполными метаданными или отменить весь пакет.";

        const actions = document.createElement("div");
        actions.className = "fbe-batch-actions";
        const cancel = actionButton("Отменить весь пакет");
        const accept = actionButton("Скачать всё равно", "fbe-batch-action-danger");
        actions.append(cancel, accept);
        dialog.append(text, list, note, actions);

        const finish = value => {
            overlay.remove();
            resolve(value);
        };
        cancel.addEventListener("click", () => finish(false), { once: true });
        accept.addEventListener("click", () => finish(true), { once: true });
        accept.focus();
    });
}

function infoLine(label) {
    const row = document.createElement("div");
    row.className = "fbe-batch-info-line";
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    const value = document.createElement("span");
    value.textContent = "—";
    row.append(strong, value);
    return { row, value };
}

function createProgressDialog(info, format, total) {
    const { overlay, dialog } = makeOverlay(`${typeLabel(info)} → ${format}`);

    const summary = document.createElement("p");
    summary.className = "fbe-batch-summary";
    summary.textContent = `Всего произведений: ${total}. Неполный архив создан не будет.`;

    const warning = document.createElement("div");
    warning.className = "fbe-batch-do-not-close";
    warning.textContent = "Не закрывайте и не перезагружайте страницу до окончания скачивания. В фоне загрузка может замедлиться или приостановиться.";

    const status = document.createElement("div");
    status.className = "fbe-batch-status";
    status.textContent = "Подготовка…";

    const bookInfo = document.createElement("div");
    bookInfo.className = "fbe-batch-book-info";
    const titleLine = infoLine("Название");
    const authorLine = infoLine("Автор");
    const chapterLine = infoLine("Глава");
    bookInfo.append(titleLine.row, authorLine.row, chapterLine.row);

    const stage = document.createElement("div");
    stage.className = "fbe-batch-stage";
    stage.textContent = "Этап: подготовка…";

    const network = document.createElement("div");
    network.className = "fbe-batch-network";

    const urlLine = document.createElement("div");
    urlLine.className = "fbe-batch-url";

    const progress = document.createElement("div");
    progress.className = "fbe-batch-progress";
    const bar = document.createElement("div");
    progress.appendChild(bar);

    const actions = document.createElement("div");
    actions.className = "fbe-batch-actions";
    const cancel = actionButton("Остановить");
    actions.appendChild(cancel);

    dialog.append(summary, warning, status, bookInfo, stage, network, urlLine, progress, actions);

    let cancelled = false;
    cancel.addEventListener("click", () => {
        cancelled = true;
        cancel.disabled = true;
        cancel.textContent = "Остановка…";
        status.textContent = "Останавливаем после текущего запроса…";
    });

    return {
        isCancelled: () => cancelled,
        setWork(index, url) {
            status.textContent = `Произведение ${index}/${total}`;
            titleLine.value.textContent = "Получаем данные…";
            authorLine.value.textContent = "Получаем данные…";
            chapterLine.value.textContent = "—";
            stage.textContent = "Этап: страница произведения…";
            network.textContent = "";
            urlLine.textContent = url;
            bar.style.width = `${Math.max(0, Math.min(100, ((index - 1) / total) * 100))}%`;
        },
        setBookInfo(book) {
            titleLine.value.textContent = book?.title || "Неизвестно";
            authorLine.value.textContent = book?.author || "Неизвестно";
        },
        setChapter(current, chaptersTotal) {
            chapterLine.value.textContent = `${current}/${chaptersTotal}`;
        },
        setStage(text) {
            stage.textContent = text ? `Этап: ${text}` : "";
        },
        setDetail(text) {
            this.setStage(text);
        },
        setNetworkState(text) {
            network.textContent = text || "";
        },
        setFinished() {
            bar.style.width = "100%";
            status.textContent = `Проверено ${total}/${total}`;
            chapterLine.value.textContent = "—";
            network.textContent = "";
        },
        close() {
            overlay.remove();
        }
    };
}

function showFatalResult(title, message, failed = []) {
    return new Promise(resolve => {
        const { overlay, dialog, title: titleElement } = makeOverlay(title);
        titleElement.classList.add("fbe-batch-warning-title");

        const text = document.createElement("p");
        text.className = "fbe-batch-summary";
        text.textContent = message;
        dialog.appendChild(text);

        if (failed.length) {
            const list = document.createElement("ul");
            list.className = "fbe-batch-error-list";
            failed.forEach(item => {
                const li = document.createElement("li");
                li.textContent = `${item.url} — ${item.error?.message || item.error || "ошибка"}`;
                list.appendChild(li);
            });
            dialog.appendChild(list);
        }

        const actions = document.createElement("div");
        actions.className = "fbe-batch-actions";
        const close = actionButton("Закрыть", "fbe-batch-action-primary");
        actions.appendChild(close);
        dialog.appendChild(actions);
        close.addEventListener("click", () => {
            overlay.remove();
            resolve();
        }, { once: true });
        close.focus();
    });
}

function uniqueArchiveName(name, usedNames) {
    const raw = String(name || "file").trim() || "file";
    const dot = raw.lastIndexOf(".");
    const base = dot > 0 ? raw.slice(0, dot) : raw;
    const ext = dot > 0 ? raw.slice(dot) : "";
    let candidate = raw;
    let index = 2;

    while (usedNames.has(candidate.toLowerCase())) {
        candidate = `${base} (${index++})${ext}`;
    }
    usedNames.add(candidate.toLowerCase());
    return candidate;
}

function localDateStamp(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

async function validateArtifact(artifact, format) {
    if (!artifact?.fileName || !(artifact.blob instanceof Blob) || artifact.blob.size <= 0) {
        return false;
    }

    const expectedExt = `.${format.toLowerCase()}`;
    if (!artifact.fileName.toLowerCase().endsWith(expectedExt)) return false;

    if (format === "PDF") {
        const prefix = await artifact.blob.slice(0, 8).text();
        return prefix.startsWith("%PDF-");
    }

    if (format === "EPUB") {
        const bytes = new Uint8Array(await artifact.blob.slice(0, 4).arrayBuffer());
        return bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b;
    }

    if (format === "FB2") {
        const head = await artifact.blob.slice(0, 4096).text();
        const tail = await artifact.blob.slice(Math.max(0, artifact.blob.size - 4096)).text();
        return /<FictionBook\b/.test(head) && /<\/FictionBook>/.test(tail);
    }

    if (format === "TXT") {
        const head = await artifact.blob.slice(0, 512).text();
        return head.replace(/^\ufeff/, "").trim().length > 0;
    }

    return true;
}

async function createArchive(info, format, workUrls, artifacts, progress) {
    if (progress.isCancelled()) throw new Error("cancelled");

    progress.setStage(`Финальная проверка: ${artifacts.length}/${workUrls.length} файлов…`);

    if (artifacts.length !== workUrls.length) {
        throw new Error(`Контроль количества не пройден: ожидалось ${workUrls.length}, готово ${artifacts.length}.`);
    }

    const byUrl = new Map();
    let totalBytes = 0;

    for (const artifact of artifacts) {
        if (progress.isCancelled()) throw new Error("cancelled");

        if (!artifact?.sourceUrl || !await validateArtifact(artifact, format)) {
            throw new Error(`Контроль целостности не пройден: некорректный файл ${artifact?.fileName || "без имени"}.`);
        }
        if (byUrl.has(artifact.sourceUrl)) {
            throw new Error(`Контроль целостности не пройден: произведение продублировано (${artifact.sourceUrl}).`);
        }

        totalBytes += artifact.blob.size;
        byUrl.set(artifact.sourceUrl, artifact);
    }

    for (const url of workUrls) {
        if (!byUrl.has(url)) {
            throw new Error(`Контроль целостности не пройден: отсутствует файл для ${url}.`);
        }
    }

    console.info(
        `[Ficbook Exporter] Пакет: проверка успешна — ${artifacts.length}/${workUrls.length} файлов, ` +
        `${totalBytes} байт до ZIP`
    );

    progress.setStage(`Проверка пройдена: ${artifacts.length}/${workUrls.length}. Создание ZIP…`);

    const zip = new jszip_min();
    const usedNames = new Set();

    for (const url of workUrls) {
        if (progress.isCancelled()) throw new Error("cancelled");
        const artifact = byUrl.get(url);
        const archiveName = uniqueArchiveName(artifact.fileName, usedNames);
        zip.file(archiveName, artifact.blob);
    }

    const zipEntries = Object.values(zip.files).filter(entry => !entry.dir);
    if (zipEntries.length !== workUrls.length) {
        throw new Error(`Контроль ZIP не пройден: ожидалось ${workUrls.length} файлов, добавлено ${zipEntries.length}.`);
    }

    // EPUB и PDF уже сжаты внутри, поэтому повторный DEFLATE почти не уменьшает
    // размер, но заметно нагружает браузер. FB2/TXT, наоборот, хорошо сжимаются.
    const alreadyCompressed = format === "EPUB" || format === "PDF";
    const zipOptions = {
        type: "blob",
        mimeType: "application/zip",
        compression: alreadyCompressed ? "STORE" : "DEFLATE"
    };
    if (!alreadyCompressed) zipOptions.compressionOptions = { level: 6 };

    let lastPercent = -1;
    const zipPromise = zip.generateAsync(zipOptions, meta => {
        if (progress.isCancelled()) return;
        const percent = Math.max(0, Math.min(100, Math.floor(meta?.percent || 0)));
        if (percent !== lastPercent) {
            lastPercent = percent;
            progress.setStage(`Создание ZIP: ${percent}%`);
        }
    });

    const zipBlob = await Promise.race([
        zipPromise,
        new Promise((_, reject) => {
            const check = setInterval(() => {
                if (progress.isCancelled()) {
                    clearInterval(check);
                    reject(new Error("cancelled"));
                }
            }, 250);
            zipPromise.then(
                () => clearInterval(check),
                () => clearInterval(check)
            );
        })
    ]);

    if (progress.isCancelled()) throw new Error("cancelled");
    if (!zipBlob?.size) throw new Error("ZIP получился пустым.");

    const archiveName =
        `${sanitizeFilePart(info.archiveBase, "Ficbook")}_${format}_${localDateStamp()}.zip`;
    downloadBlob(zipBlob, archiveName);

    console.info(
        `[Ficbook Exporter] Пакет: ZIP готов — ${archiveName}, ${zipBlob.size} байт, ` +
        `${workUrls.length} файлов`
    );
}

async function buildArtifact(exporter, format, url, progress, workIndex, totalWorks) {
    let allowIncompleteMetadata = false;

    for (;;) {
        try {
            return await exporter(
                (chapter, chaptersTotal) => {
                    if (progress.isCancelled()) throw new Error("cancelled");
                    progress.setChapter(chapter, chaptersTotal);
                    progress.setStage(`Загрузка главы ${chapter}/${chaptersTotal}`);
                },
                progress.isCancelled,
                {
                    workUrl: url,
                    returnFile: true,
                    allowIncompleteMetadata,
                    onBookInfo: book => {
                        if (progress.isCancelled()) throw new Error("cancelled");
                        progress.setBookInfo(book);
                    },
                    onNetworkState: state => {
                        if (progress.isCancelled()) throw new Error("cancelled");
                        progress.setNetworkState(state);
                    },
                    onStage: stage => {
                        if (progress.isCancelled()) throw new Error("cancelled");
                        progress.setStage(stage);
                    }
                }
            );
        } catch (error) {
            if (error?.name !== "MetadataWarningError" || allowIncompleteMetadata) throw error;

            const accepted = await confirmIncompleteMetadata(url, error.warnings, format);
            if (!accepted || progress.isCancelled()) throw new Error("cancelled");
            allowIncompleteMetadata = true;
        }
    }
}

function protectFromAccidentalClose() {
    const handler = event => {
        event.preventDefault();
        event.returnValue = "";
        return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
}

async function runBatch(exporters, info, format) {
    const exporter = exporters[format.toLowerCase()];
    if (typeof exporter !== "function") throw new Error(`Экспортёр ${format} не найден.`);

    let scanCancelled = false;
    const scan = makeOverlay("Собираем список произведений…");
    const scanStatus = document.createElement("p");
    scanStatus.className = "fbe-batch-summary";
    scanStatus.textContent = "Подготовка…";
    const scanActions = document.createElement("div");
    scanActions.className = "fbe-batch-actions";
    const scanCancel = actionButton("Отмена");
    scanCancel.addEventListener("click", () => {
        scanCancelled = true;
        scanCancel.disabled = true;
        scanCancel.textContent = "Остановка…";
    });
    scanActions.appendChild(scanCancel);
    scan.dialog.append(scanStatus, scanActions);

    let workUrls;
    try {
        workUrls = await collectAllWorkUrls(
            info,
            status => { scanStatus.textContent = status; },
            () => scanCancelled
        );
    } finally {
        scan.overlay.remove();
    }

    if (scanCancelled) return;
    if (!workUrls.length) {
        await showFatalResult("Работы не найдены", "Не удалось найти ни одного произведения для пакетного экспорта.");
        return;
    }

    console.info(
        `[Ficbook Exporter] Пакет: найдено ${workUrls.length} произведений` +
        (info.expectedCount > 0 ? `, Ficbook сообщает ${info.expectedCount}` : "")
    );

    if (info.expectedCount > 0 && workUrls.length !== info.expectedCount) {
        await showFatalResult(
            "Количество не совпало",
            `Ficbook показывает ${info.expectedCount} работ, а экспортёр нашёл ${workUrls.length}. ` +
            "Пакет не запущен, чтобы случайно не создать неполный архив."
        );
        return;
    }

    if (!await confirmBatchStart(info, format, workUrls.length)) return;

    const progress = createProgressDialog(info, format, workUrls.length);
    const removeCloseProtection = protectFromAccidentalClose();
    const artifacts = [];
    const failed = [];

    try {
        for (let index = 0; index < workUrls.length; index++) {
            if (progress.isCancelled()) throw new Error("cancelled");
            const url = workUrls[index];
            progress.setWork(index + 1, url);

            let artifact = null;
            let lastError = null;

            // Одна дополнительная попытка всей работы. Внутри collectBook главы
            // уже имеют собственные повторные попытки и защитные задержки.
            for (let attempt = 1; attempt <= 2 && !artifact; attempt++) {
                if (progress.isCancelled()) throw new Error("cancelled");
                try {
                    artifact = await buildArtifact(
                        exporter,
                        format,
                        url,
                        progress,
                        index + 1,
                        workUrls.length
                    );
                } catch (error) {
                    if (error?.message === "cancelled") throw error;
                    lastError = error;
                    console.warn(
                        `[Ficbook Exporter] Пакет: ошибка произведения ${index + 1}/${workUrls.length}, попытка ${attempt}/2`,
                        url,
                        error
                    );
                    if (attempt < 2) {
                        progress.setStage("Ошибка. Повтор произведения после паузы…");
                        await randomDelay(WHOLE_WORK_RETRY_MIN_MS, WHOLE_WORK_RETRY_MAX_MS, progress.isCancelled);
                    }
                }
            }

            if (artifact?.blob instanceof Blob && artifact?.fileName) {
                artifacts.push({ ...artifact, sourceUrl: normalizeWorkUrl(artifact.sourceUrl || url) || url });
            } else {
                if (artifact) lastError = new Error("Экспортёр вернул некорректный файл.");
                failed.push({ url, error: lastError });
            }

            if (index < workUrls.length - 1 && !progress.isCancelled()) {
                progress.setStage("Пауза между произведениями…");
                await randomDelay(BETWEEN_WORKS_MIN_MS, BETWEEN_WORKS_MAX_MS, progress.isCancelled);
            }
        }

        if (progress.isCancelled()) throw new Error("cancelled");
        progress.setFinished();

        if (failed.length || artifacts.length !== workUrls.length) {
            progress.close();
            await showFatalResult(
                "Архив не создан",
                `Успешно: ${artifacts.length}/${workUrls.length}. Ошибок: ${failed.length}. ` +
                "Неполный ZIP не сохранён.",
                failed
            );
            return;
        }

        await createArchive(info, format, workUrls, artifacts, progress);
        progress.close();
    } catch (error) {
        progress.close();
        if (error?.message !== "cancelled") {
            console.error("Ошибка пакетного экспорта:", error);
            await showFatalResult("Ошибка пакетного экспорта", error?.message || String(error));
        }
    } finally {
        removeCloseProtection();
    }
}

function placementForPage() {
    if (supportsAuthorBatchButtons()) {
        const nav = document.querySelector(".sidebar-sticky .sidebar-nav");
        if (!nav) return null;
        return { parent: nav.parentElement, after: nav, mode: "sidebar" };
    }

    if (isCollectionPage()) {
        const filters = document.querySelector("#filters");
        if (filters?.parentElement) {
            return { parent: filters.parentElement, after: filters, mode: "collection" };
        }

        const heading = document.querySelector(".collections-page-heading");
        const row = heading?.parentElement;
        if (!row) return null;
        return { parent: row, after: null, mode: "heading" };
    }

    if (isSeriesPage()) {
        const heading = document.querySelector("h1.heading.word-break, h1.heading");
        const headerBlock = heading?.closest(".d-flex.flex-column.gap-8");

        if (headerBlock) {
            const summary = Array.from(headerBlock.children).find(node =>
                /В\s+серии\s+\d+\s+работ/i.test(node.textContent || "")
            );

            if (summary) {
                return { parent: headerBlock, after: summary, mode: "series" };
            }
        }

        // Резервный вариант на случай изменения разметки Ficbook.
        const row = heading?.parentElement?.parentElement;
        if (!row) return null;
        return { parent: row, after: null, mode: "heading" };
    }

    return null;
}

function createBatchControl(exporters, info) {
    const control = document.createElement("div");
    control.className = "fbe-batch-control";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "ds-btn ds-btn-regular ds-btn-mini fbe-batch-trigger";
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = `<span>${info.buttonText}</span><span class="fbe-batch-trigger-chevron" aria-hidden="true">▼</span>`;

    const menu = document.createElement("div");
    menu.className = "fbe-batch-menu";
    menu.setAttribute("role", "menu");

    const closeMenu = () => {
        menu.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
    };

    for (const format of ["FB2", "EPUB", "PDF", "TXT"]) {
        const item = document.createElement("button");
        item.type = "button";
        item.textContent = `${info.buttonText} → ${format}`;
        item.addEventListener("click", event => {
            event.stopPropagation();
            closeMenu();
            runBatch(exporters, info, format).catch(error => {
                console.error("Ошибка пакетного экспорта:", error);
            });
        });
        menu.appendChild(item);
    }

    trigger.addEventListener("click", event => {
        event.stopPropagation();

        const root = control.closest(`#${BATCH_ROOT_ID}`);
        root?.querySelectorAll(".fbe-batch-menu.is-open").forEach(openMenu => {
            if (openMenu !== menu) {
                openMenu.classList.remove("is-open");
                openMenu.parentElement?.querySelector(".fbe-batch-trigger")?.setAttribute("aria-expanded", "false");
            }
        });

        const open = menu.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    control.append(menu, trigger);
    return control;
}

function createBatchExportButtons(exporters) {
    const infos = pageInfos();
    if (!infos.length) return false;
    if (document.getElementById(BATCH_ROOT_ID)) return true;

    const placement = placementForPage();
    if (!placement?.parent) return false;
    installStyles();

    const root = document.createElement("div");
    root.id = BATCH_ROOT_ID;
    root.className =
        placement.mode === "sidebar"
            ? "fbe-batch-sidebar"
            : placement.mode === "collection"
                ? "fbe-batch-collection"
                : placement.mode === "series"
                    ? "fbe-batch-series"
                    : "fbe-batch-heading";

    infos.forEach(info => root.appendChild(createBatchControl(exporters, info)));

    document.addEventListener("click", event => {
        if (root.contains(event.target)) return;
        root.querySelectorAll(".fbe-batch-menu.is-open").forEach(menu => {
            menu.classList.remove("is-open");
            menu.parentElement?.querySelector(".fbe-batch-trigger")?.setAttribute("aria-expanded", "false");
        });
    });

    if (placement.after) placement.after.insertAdjacentElement("afterend", root);
    else placement.parent.appendChild(root);

    return true;
}

;// ./src/main.js







const exporters = { fb2: createFB2, epub: createEPUB, txt: createTXT, pdf: createPDF };
let observer = null;
let insertionScheduled = false;

function insertButtons() {
    insertionScheduled = false;
    if (!document.body) return;

    const path = location.pathname;

    if (/^\/readfic\//.test(path)) {
        if (!document.querySelector("#ficbook-export-buttons .fbe-inline-trigger")) {
            createButtons(exporters);
        }
        return;
    }

    if (/^\/authors\//.test(path) || /^\/collections\//.test(path) || /^\/series\//.test(path)) {
        if (!document.querySelector("#ficbook-batch-export")) {
            createBatchExportButtons(exporters);
        }
    }
}

function scheduleInsert() {
    if (insertionScheduled) return;
    insertionScheduled = true;
    requestAnimationFrame(insertButtons);
}

function start() {
    insertButtons();
    if (observer || !document.body) return;
    observer = new MutationObserver(scheduleInsert);
    observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();

