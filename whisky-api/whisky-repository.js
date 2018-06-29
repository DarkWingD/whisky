module.exports.inject = function (dependencies) {
    dependencies = dependencies || {};
    let environment = dependencies.environment || process.env.NODE_ENV || 'development';
    let config = dependencies.config || require('./config')[environment];
    let q = require('q');
    let mongo = dependencies.mongodb || require('mongodb');
    let connectionString = config.connectionString;
  
    let databaseName = config.databaseName || 'whisky-review';
    let collectionName = 'reviews';
  
    let newUid = dependencies.uuid || require('uuid/v1');
    // let logger = dependencies.logger || require('./logger');  
  
    return {
      find: function (criteria) {
        return findBallpark(criteria);
      },
      list: function () {
        return new Promise(function (resolve, reject) {
          mongo.MongoClient
            .connect(connectionString)
            .then(function (db) {
              let dbo = db.db(databaseName);
              dbo.collection(collectionName)
                .aggregate([
                  {
                    $sort: { uid: 1, 'updatedOn': -1,  'createdOn': -1 }
                  },
                  {
                    $group: {
                      _id: { uid: '$uid' },
                      uid: { $first: '$uid' },
                      ballparkId: { $first: '$_id' },
                      version: { $first: '$version' },
                      name: { $first: '$name' },
                      code: { $first: '$code' },
                      ballparkLow: { $first: '$ballparkLow' },
                      ballparkHigh: { $first: '$ballparkHigh' },
                      sections: { $first: '$sections' },
                      createdOn: { $first: '$createdOn' },
                      createdBy: { $first: '$createdBy' },
                      ownedBy: { $first: '$ownedBy' },
                      versionBasedOn: { $first: '$versionBasedOn' },
                      isComplete: { $first: '$isComplete' }
                    }
                  }
                ])
                .toArray(function (err, docs) {
                  db.close();
                  if (err) {
                    logger.error(err);
                    return reject(err);
                  } else {
                    // The _id returned is for the grouping itself, not the document, and it would be confusing to return the group id to the client.
                    docs.forEach(doc => {
                      doc._id = doc.ballparkId;
                      delete doc.ballparkId;
                    });
                    return resolve(docs);
                  }
                });
            })
            .catch(function (err) {
              logger.error(err);
              return reject(err);
            });
        });
      },
      save: function (ballpark) {
        return saveBallparkToDB(ballpark);
      }
    }
  
    function saveBallparkToDB(ballpark) {
      return new Promise(function (resolve, reject) {
        mongo.MongoClient
          .connect(connectionString)
          .then(function (db) {
            if (!ballpark.name) {
              return reject({ name: 'ValidationError', message: 'Name is required.' });
            }
            if (typeof ballpark.name != 'string') {
              return reject({ name: 'ValidationError', message: 'Name must be a string.' });
            }
            if (!ballpark.ownedBy) {
              return reject({ name: 'ValidationError', message: 'Owned by is required.' });
            }
            if (typeof ballpark.ownedBy != 'string') {
              return reject({ name: 'ValidationError', message: 'Owned by must be a string.' });
            }
            if (!ballpark.version) {
              return reject({ name: 'ValidationError', message: 'Version cannot be empty.' });
            }
  
            let now = new Date();
            let utcNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
            ballpark.updatedOn = utcNow;
  
            if (ballpark.isComplete) {
              ballpark.isComplete = undefined;
              ballpark.completedOn = undefined;
            }
            
            if (ballpark._id) {
              ballpark._id = new mongo.ObjectID(ballpark._id);
            }
  
            if (ballpark.sections) {
              var calendarSection = ballpark.sections.filter(section => section.type === 'calendar');
              if (typeof calendarSection !== 'undefined' && calendarSection && calendarSection.length > 0) {
                if (calendarSection[0].startDate) {
                  calendarSection[0].startDate = returnUtcFromDateString(calendarSection[0].startDate);
                  calendarSection[0].endDate = returnUtcFromDateString(calendarSection[0].endDate);
                }
              }
            }
  
            if (!ballpark.uid) {
              ballpark.uid = newUid();
              ballpark.isComplete = false;
            }
            let dbo = db.db(databaseName);
            dbo.collection(collectionName)
              .save(ballpark, function (err, result) {
                db.close();
                if (err) {
                  logger.error(err);
                  return reject(err);
                } else {
                  if (result.ops && result.ops.length>0){ //created new
                    return resolve(result.ops[0]);
                  }
                  if (result.result){
                    if (result.result.upserted || result.result.nModified == 1) {
                      return resolve()
                    }
                  }
                  else { return reject(); }
                }
              });
          })
          .catch(function (err) {
            logger.error(err);
            return reject(err);
          });
      });
    }
  
    function findBallpark(criteria) {
      return new Promise(function (resolve, reject) {
        mongo.MongoClient
          .connect(connectionString)
          .then(function (db) {
            if (criteria) {
              if (criteria._id) {
                if (!mongo.ObjectID.isValid(criteria._id)) {
                  logger.error('Invalid criteria _id "' + criteria._id + '" for find.');
                  return reject({ name: 'ValidationError', message: 'Id ' + criteria._id + ' is not valid.' });
                }
                criteria._id = new mongo.ObjectID(criteria._id);
              }
            }
            else {
              criteria = {};
            }
  
            let dbo = db.db(databaseName);
            dbo.collection(collectionName)
              .aggregate([
                {
                  $sort: { updatedOn: -1, createdOn: -1 }
                },
                {
                  $match: criteria
                }
              ])
              .toArray(function (err, docs) {
                db.close();
                if (err) {
                  logger.error(err);
                  return reject(err);
                } else {
                  return resolve(docs);
                }
              });
          })
          .catch(function (err) {
            logger.error(err);
            return reject(err);
          });
      });
    }
  
    function returnUtcFromDateString(dateString) {
      let now = new Date(dateString);
      let utcNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
      return utcNow;
    }
  }
  