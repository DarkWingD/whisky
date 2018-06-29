require('dotenv').config();

module.exports = {
  development: {
    connectionString: 'mongodb://whisky-db:gLmpX3FBQo6mpHE7AofUIdDhO6ARq4FlAEbe4YwoOEi3ua6VAZRFi7rLAxRennplpSDuII1Jx4rNpmAtxRY1fg==@whisky-db.documents.azure.com:10255/?ssl=true&replicaSet=globaldb',//process.env['DATABASE_CONNECTION_STRING'],
    databaseName: 'whisky'//process.env['DATABASE_NAME']
  }
};
