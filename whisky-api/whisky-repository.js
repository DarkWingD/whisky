module.exports.inject = function (dependencies) {
    dependencies = dependencies || {};
    let environment = dependencies.environment || process.env.NODE_ENV || 'development';
    let config = dependencies.config || require('./config')[environment];
    let q = require('q');
    let mongo = dependencies.mongodb || require('mongodb');
    let connectionString = config.connectionString;
  
    let databaseName = config.databaseName || 'exactquote';
    let collectionName = 'ballparks';
  
    let newUid = dependencies.uuid || require('uuid/v1');
    let logger = dependencies.logger || require('./logger');
  
    let JiraClient = dependencies.jiraConnector || require('jira-connector');
    let jiraHost = config.jiraHost;
    let jiraAuth = config.jiraAuth;
  
  
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
      history: function (criteria) {
        return new Promise(function (resolve, reject) {
          mongo.MongoClient
            .connect(connectionString)
            .then(function (db) {
              let dbo = db.db(databaseName);
              dbo.collection(collectionName)
                .aggregate([
                  {
                    $match: criteria
                  },
                  {
                    $sort: { uid: 1, updatedOn: 1, createdOn: 1 }
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
      },
      save: function (ballpark) {
        return saveBallparkToDB(ballpark);
      },
      copy: function (ballpark) {
        return createCopyOfBallpark(ballpark);
      },
      complete: function (ballpark) {
        return new Promise(function (resolve, reject) {
          mongo.MongoClient
            .connect(connectionString)
            .then(function (db) {
              if (!mongo.ObjectID.isValid(ballpark._id)) {
                return reject({ name: 'ValidationError', message: 'Id ' + criteria._id + ' is not valid.' });
              }
              let now = new Date();
              let utcNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
              let dbo = db.db(config.database);
              return dbo.collection(collectionName)
                .update(
                  { _id: new mongo.ObjectID(ballpark._id) },
                  { $set: { isComplete: true, completedOn: utcNow } })
                .then((response) => {
                  return resolve(response);
                })
                .catch((err) => {
                  logger.error(err);
                  return reject(err);
                });
            });
        });
      },
      getJiraProject: function (projectCode) {
        return new Promise(function (resolve, reject) {
          let jira = new JiraClient({
            host: jiraHost,
            basic_auth: {
              base64: jiraAuth
            }
          });
          const query = {
            jql: 'project=' + projectCode,
            maxResults: '500'
          };
          jira.search.search(query
            , function (error, issue) {
              if (error) {
                return reject(error);
              } else {
                return resolve(issue);
              }
            });
        })
      },
      createJiraEpicsAndStories: function (ballparkId) {
        return new Promise(function (resolve, reject) {
          var promises = [];
          findBallpark({ _id: ballparkId })
            .then((result) => {
              if (result.length != 1) {
                return reject('Ballpark not found');
              }
              processJiraExportAsPromiseArray(result[0]).then(function (result) {
                return resolve(result);
              }).catch(function (error) {
                return reject(error);
              })
            })
            .catch(function (error) {
              logger.error(error);
              return reject(error);
            });
        })
      }
    }
  
    async function processJiraExportAsPromiseArray(ballpark) {
      var epicKey = '';
      let hasChanges = false;
      var taskSection = ballpark.sections.filter(section => section.type === 'tasks')[0];
      var taskSectionIndex = ballpark.sections.indexOf(taskSection);
      var results = [];
      for (var taskIndex = 0; taskIndex < taskSection.tasks.length; taskIndex++) {
        var task = ballpark.sections[taskSectionIndex].tasks[taskIndex];
        if (task.jiraStoryId) {//already exported
          epicKey = task.epicKey;//Get epic key incase next task requires it.
        }
        else {
          if (typeof task.area !== 'undefined' && task.area) {
            var epic = await createJiraEpic(ballpark.projectCode, task.area);
            epicKey = epic.key;
          }
          var story = await createJiraStory(ballpark.projectCode, epicKey, task.description);
          ballpark.sections[taskSectionIndex].tasks[taskIndex].jiraStoryId = story.id;
          ballpark.sections[taskSectionIndex].tasks[taskIndex].epicKey = epicKey;
          hasChanges = true;
        }
      }
      if (hasChanges) {
        return saveBallparkToDB(ballpark);
      }
      else {
        return;
      }
    }
  
    function createCopyOfBallpark(ballpark) {
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
            if (!ballpark.version) {
              return reject({ name: 'ValidationError', message: 'Version cannot be empty.' });
            }
            if (ballpark.isComplete) {
              ballpark.isComplete = undefined;
              ballpark.completedOn = undefined;
            }
            let now = new Date();
            let utcNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
            ballpark.uid = newUid();
            ballpark._id = undefined;
            ballpark.createdOn = utcNow;
            ballpark.updatedBy = ballpark.createdBy;
            ballpark.updatedOn = ballpark.createdOn;
  
            ballpark.name = ballpark.name + ' - COPY';
            let dbo = db.db(databaseName);
            dbo.collection(collectionName)
              .insertOne(ballpark, function (err, result) {
                db.close();
                if (err) {
                  logger.error(err);
                  return reject(err);
                } else {
                  let insertedDocument = result.ops[0];
                  return resolve(insertedDocument);
                }
              });
          });
      });
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
  
    async function createJiraEpic(projectCode, taskDescription) {
      return new Promise((resolve, reject) => {
        let jira = new JiraClient({
          host: jiraHost,
          basic_auth: {
            base64: jiraAuth
          }
        });
        var data = {
          'fields':
            {
              'customfield_10004': taskDescription,
              'project': { 'key': projectCode },
              'summary': taskDescription,
              'description': taskDescription,
              'issuetype': { 'name': 'Epic' }
            }
        };
        try {
          jira.issue.createIssue(data, (error, issue) => {
            if (error) {
              return reject(error.errorMessages);
            } else {
              return resolve(issue);
            }
          });
        }
        catch (error) { reject(error); }
      })
    };
  
    async function createJiraStory(projectCode, epicKey, taskDescription) {
      return new Promise((resolve, reject) => {
        let jira = new JiraClient({
          host: jiraHost,
          basic_auth: {
            base64: jiraAuth
          }
        });
        var data = {
          'fields':
            {
              'project': { 'key': projectCode.toString() },
              'summary': taskDescription,
              'description': taskDescription,
              'issuetype': { 'name': 'Story' },
              'customfield_10001': epicKey
            }
        };
        try {
          jira.issue.createIssue(data, (error, issue) => {
            if (error) {
              return reject(error.errorMessages);
            } else {
              return resolve(issue);
            }
          });
        }
        catch (error) {
          reject(error);
        }
      })
    };
  
    function returnUtcFromDateString(dateString) {
      let now = new Date(dateString);
      let utcNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
      return utcNow;
    }
  }
  