const sha256 = require('js-sha256').sha256;
const csv = require('csv-parser');
const _ = require('lodash');
const fs = require('fs');

function fixHeader(header) {
  return header.trim().replace(/\"/g, '');
}

const CsvDataReader = {
  getAccumulatedCsvData: async function (predicate, reducer, init, csvPath) {
    return new Promise((resolve, reject) => {
      let accumulatedData = init;

      let recordIndex = 0;
      let chunkByteSize = 100;

      const chunkReader = fs.createReadStream(csvPath, {
        encoding: 'utf-8',
        highWaterMark: chunkByteSize,
      });

      const csvReader = chunkReader.pipe(csv());

      csvReader.on('data', record => {
        record = _.mapKeys(record, (value, header) => fixHeader(header));

        if (predicate(recordIndex, record)) {
          accumulatedData = reducer(accumulatedData, { record });
        }

        recordIndex++;
      });

      csvReader.on('headers', headers => {
        headers = headers.map(fixHeader);
        accumulatedData = reducer(accumulatedData, { headers });
      });

      chunkReader.on('error', reject);

      csvReader.on('error', reject);

      csvReader.on('end', () => resolve(accumulatedData));
    });
  },

  /**
   * Count all records from a single csv data source.
   */
  getAmountOfRecords: async function (csvPath) {
    const takeAllRecords = () => true;
    const increaseCountBy1 = (count, record) => count + 1;
    const initialCount = 0;

    return await CsvDataReader.getAccumulatedCsvData(
      takeAllRecords,
      increaseCountBy1,
      initialCount,
      csvPath,
    );
  },

  getSingleRecordById: async function (id, csvPath) {
    const initialRecord = {};
    const attributes = await CsvDataReader.getAttributes(csvPath);

    const filterRelevantRecord = function (index, record) {
      const values = Object.values(record);

      const recordId = Buffer.from(
        sha256.hex(`${csvPath}${attributes.join()}${values.join()}`),
      ).toString('base64');

      return recordId === id;
    };

    const recordMapper = (result, csvEntity) => {
      const record = csvEntity.record;

      if (!record) {
        return result;
      } else {
        const values = Object.values(record);

        const id = Buffer.from(
          sha256.hex(`${csvPath}${attributes.join()}${values.join()}`),
        ).toString('base64');

        return {
          id,
          data: attributes.map((attribute, index) => ({
            fieldName: attribute,
            fieldValue: record[attribute],
            fieldType: 'string',
          })),
        };
      }
    };

    return await CsvDataReader.getAccumulatedCsvData(
      filterRelevantRecord,
      recordMapper,
      initialRecord,
      csvPath,
    );
  },

  /**
   * Get attributes (field names) from a csv data source path.
   *
   * @param {*} csvPath the path to the csv
   */
  getAttributes: async function (csvPath) {
    const takeNoRecords = () => false;

    const accumulateAttributes = (accumulatedData, csvEntity) =>
      csvEntity.headers ? csvEntity.headers : accumulatedData;

    const initialAttributesData = [];

    return await CsvDataReader.getAccumulatedCsvData(
      takeNoRecords,
      accumulateAttributes,
      initialAttributesData,
      csvPath,
    );
  },

  getRecords: async function (offset, count, csvPath) {
    const attributes = await CsvDataReader.getAttributes(csvPath);

    let totalReadRecords = 0;
    let readRecords = 0;
    const initialRecords = [];

    // Take in count only chunk of records
    const filterRelevantRecords = index => {
      totalReadRecords++;

      return (readRecords < count || -1 === count) && index > offset;
    };

    const recordReducer = (records, csvEntity) => {
      if (csvEntity.record) {
        const values = Object.values(csvEntity.record);

        const id = Buffer.from(
          sha256.hex(`${csvPath}${attributes.join()}${values.join()}`),
        ).toString('base64');

        records.push({
          id,
          data: attributes.map((attribute, index) => ({
            fieldName: attribute,
            fieldValue: csvEntity.record[attribute],
            fieldType: 'string',
          })),
        });
      }

      readRecords++;

      return records;
    };

    return await CsvDataReader.getAccumulatedCsvData(
      filterRelevantRecords,
      recordReducer,
      initialRecords,
      csvPath,
    );
  },

  searchRecords: async function (offset, count, csvPath, fields) {
    const attributes = await CsvDataReader.getAttributes(csvPath);

    let acceptedRecords = 0;
    const initialRecords = [];

    // Take in count only chunk of records
    const filterRelevantRecords = (index, record) => {

      for (field of fields) {
        if (record[field.fieldName] === undefined) {
          return false;
        }
        if (record[field.fieldName].indexOf(field.fieldValue) == -1) {
          return false;
        }
        if (field.isFullMatch === true && record[field.fieldName] != field.fieldValue) {
          return false;
        }
      }
      acceptedRecords++;
      return (acceptedRecords - 1 < count || -1 === count) && acceptedRecords > offset;
    };

    const recordReducer = (records, csvEntity) => {
      if (csvEntity.record) {
        const values = Object.values(csvEntity.record);

        const id = Buffer.from(
          sha256.hex(`${csvPath}${attributes.join()}${values.join()}`),
        ).toString('base64');

        records.push({
          id,
          data: attributes.map((attribute, index) => ({
            fieldName: attribute,
            fieldValue: csvEntity.record[attribute],
            fieldType: 'string',
          }))
        });
      }

      return records;
    };

    return await CsvDataReader.getAccumulatedCsvData(
      filterRelevantRecords,
      recordReducer,
      initialRecords,
      csvPath,
    );
  }
};

module.exports = CsvDataReader;
