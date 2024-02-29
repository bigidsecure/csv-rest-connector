module.exports.createCsvFieldByAttributeName = field => ({
  fieldName: field,
  fieldType: 'string',
});

module.exports.CsvDataReader = require('./csvDataReader');
