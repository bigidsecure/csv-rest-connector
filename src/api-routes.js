const handlers = require('./route-handlers');
const basicAuth = require('express-basic-auth')

// Load api routes into the service
module.exports = app => {
  app.use(basicAuth({
    users: { 'bigid': 'bigid111' },
    unauthorizedResponse: {"status": "error", "message": "unauthorized"}
  }))
  app.use(handlers.setResponseTypeToJson);

  // Handle route requests to /objects
  app.get('/objects', handlers.getAllObjectsHandler);
  app.get('/objects/:objectName/describe', handlers.getObjectDescriptionHandler);
  app.get('/objects/:objectName/count', handlers.getAmountOfRecordsHandler);
  app.get('/objects/:objectName/records', handlers.getObjectRecordsHandler);
  app.get('/objects/:objectName/records/:recordId', handlers.getObjectRecordByIdHandler);
  app.post('/objects/:objectName/sar', handlers.searchObjectRecordsHandler);
};
