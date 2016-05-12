var webshot = require('webshot');
var AWS = require('aws-sdk');
var Readable = require('stream').Readable;
var s3 = new AWS.S3();

// stream seems to be empty -> phantomjs not working on Lambda?
var options = {screenSize: { width: 1024, height: 768 }, streamType: 'png'}; 

exports.handler = function(event, context, callback) {
  webshot(event.url, options, function(err, stream){
    if (err) {
      context.fail(err);
    } else {
      var key = event.key + '.png';
      var body = new Readable().wrap(stream);
      var params = {Bucket: event.bucket, Key: key, Body: body, ACL: 'public-read'};

      s3.upload(params, function(err, data) {
        if (err) {
          console.error(err);
        }
      });
      callback(null, {url: "https://" + event.bucket + ".s3.amazonaws.com/" + key});
    }
  });
};
