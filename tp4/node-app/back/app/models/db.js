let colors = require('colors');
let mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect('mongodb://mongo-db:27017', {useNewUrlParser: true, useFindAndModify: true, useUnifiedTopology: true})

let db = mongoose.connection;

db.on('open', function(ref) {
  mongoose.connection.db.listCollections().toArray(function (err, names) {
      module.exports.Collection = names;
  });
})

db.on('error', function(err) {
  console.error('✘ CANNOT CONNECT TO MongoDB DATABASE !'.red, process.env.DB_NAME.blue, err);
});

db.on('disconnected', function() {
  console.log('✘ DISCONNECTED from MongoDB DATABASE !'.red);
});

db.on('parseError', function(err) {
  console.log('✘ parseError... '.red, err);
});

db.on('open', function(err) {
  console.log('✔ CONNECTED TO'.green+' '+process.env.DB_HOST.green+':'+process.env.DB_NAME.green);
  //console.log('Connected as : '.green+ config.db_user_name.green);
});

module.exports = db