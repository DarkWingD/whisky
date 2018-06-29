require('dotenv').config();

module.exports = {
  development: {
    connectionString: process.env['DATABASE_CONNECTION_STRING'],
    databaseName: process.env['DATABASE_NAME']
  }
};
