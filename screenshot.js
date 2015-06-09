var webshot = require('webshot');
var AWS = require('aws-sdk');
var Readable = require('stream').Readable;
var s3 = new AWS.S3();

// stream seems to be empty -> phantomjs not working on Lambda?
var options = {screenSize: { width: 1024, height: 768 }, streamType: 'jpeg'}; 

exports.handler = function(event, context) {
  webshot(event.url, options, function(err, stream){
    if (err) {
      context.fail(err);
    } else {

      var key;
      
      if (event.key !== undefined) {
        key = event.key + '.jpeg';
      } else {
        key = event.url + '.jpeg';
      }

      var body = new Readable().wrap(stream);
      var params = {Bucket: event.bucket, Key: key, Body: body};
      s3.upload(params, function(err, data) {
        if (err) {
          context.fail(err);
        } else {
          context.succeed(data);
        }
      });
    }
  });
};
