const RESOURCES_PATH = './resources';
const util = require('./util');
const Promise = require('bluebird');
const { result } = require('lodash');

module.exports.setResponseTypeToJson = (req, res, next) => {
  res.set('Content-Type', 'application/json');

  next();
};

module.exports.getAllObjectsHandler = async (req, res, next) => {
  try {
    const readdir = Promise.promisify(require('fs').readdir);

    // get objects by name
    let fileNames = await readdir(RESOURCES_PATH, { encoding: 'utf8' });

    const getCsvDataSourceFields = async csvPath =>
      (await util.CsvDataReader.getAttributes(csvPath)).map(
        util.createCsvFieldByAttributeName,
      );

    const csvFileNameToDataSourceDescription = async fileName => ({
      objectName: fileName.split(".")[0],
      fields: await getCsvDataSourceFields(`${RESOURCES_PATH}/${fileName}`),
    });

    // resolve object data
    objects = await Promise.all(
      fileNames.map(csvFileNameToDataSourceDescription),
    );

    res.send({ status: 'success', objects });
  } catch (e) {
    res.send({
      status: 'error',
      errormessage: e.message,
    });
  } finally {
    next();
  }
};

module.exports.getObjectDescriptionHandler = async (req, res, next) => {
  try {
    const attributeNames = await util.CsvDataReader.getAttributes(
      `${RESOURCES_PATH}/${req.params.objectName}.csv`,
    );

    res.send({
      status: 'success',
      objectName: req.params.objectName,
      fields: attributeNames.map(util.createCsvFieldByAttributeName),
    });
  } catch (e) {
    res.send({
      status: 'error',
      errormessage: e.message,
    });
  } finally {
    next();
  }
};

module.exports.getAmountOfRecordsHandler = async (req, res, next) => {
  try {
    res.send({
      status: 'success',
      count:
        // Except the first line (which is used for the attributes)
        (await util.CsvDataReader.getAmountOfRecords(
          `${RESOURCES_PATH}/${req.params.objectName}.csv`,
        )) - 1,
    });
  } catch (e) {
    res.send({
      status: 'error',
      errormessage: e.message,
    });
  } finally {
    next();
  }
};

module.exports.getObjectRecordsHandler = async (req, res, next) => {
  try {
    const offset = Number(req.query.Offset || 0);
    const count = Number(req.query.Count || -1);

    const records = await util.CsvDataReader.getRecords(
      offset,
      count,
      `${RESOURCES_PATH}/${req.params.objectName}.csv`,
    );

    res.send({
      status: 'success',
      records,
      // Offset of the next record
      offset: offset + records.length + 1,
    });
  } catch (e) {
    res.send({
      status: 'error',
      errormessage: e.message,
    });
  } finally {
    next();
  }
};

module.exports.getObjectRecordByIdHandler = async (req, res, next) => {
  try {
    const csvPath = `${RESOURCES_PATH}/${req.params.objectName}`;
    const record = await util.CsvDataReader.getSingleRecordById(
      req.params.recordId,
      csvPath,
    );

    res.send({ status: 'success', records: record });
  } catch (e) {
    res.send({ status: 'error', errormessage: e.message });
  } finally {
    next();
  }
};

module.exports.searchObjectRecordsHandler = async (req, res, next) => {
  let records = []
  console.log(req.body);
  console.log(req.params.objectName);
  console.log(req.originalUrl)
  try {
    const offset = Number(req.query.Offset || 0);
    const count = Number(req.query.Count || -1);

    records = await util.CsvDataReader.searchRecords(
      offset,
      count,
      `${RESOURCES_PATH}/${req.params.objectName}.csv`,
      req.body
    );
    
    res.send({
      status: 'success',
      records,
      // Offset of the next record
      offset: offset + records.length,
    });
    
  } catch (e) {
    res.send({
      status: 'success',
      records,
      // Offset of the next record
      offset: 0,
    });
  } finally {
    next();
  }
};