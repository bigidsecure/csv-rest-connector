# CSV REST Connector

A small Node.js REST service that exposes CSV files in `resources/` as structured objects. It is intended as a BigID custom-connector/demo backend: each CSV filename becomes an object name, and the first row supplies its fields. The repository includes sample CSVs; replace them with suitable test data for your environment.

## Run locally

Requires Node.js and npm.

```sh
npm install
npm start
```

The service listens on **port 8000**. The included `docker-run.sh` builds and runs a local image with the same port mapping:

```sh
./docker-run.sh
```

## Endpoints

All routes require HTTP Basic authentication in the current implementation.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/objects` | List CSV-backed objects and their fields. |
| `GET` | `/objects/:objectName/describe` | Return the fields for one object. |
| `GET` | `/objects/:objectName/count` | Count its data rows. |
| `GET` | `/objects/:objectName/records?Offset=0&Count=100` | Read a page of records. |
| `GET` | `/objects/:objectName/records/:recordId` | Read a record by its generated ID. |
| `POST` | `/objects/:objectName/sar` | Search records using the submitted field criteria. |

The object name is the CSV filename without `.csv` (for example, `Addresses` maps to `resources/Addresses.csv`).

## Security and limitations

The Basic Auth account is currently hard-coded in `src/api-routes.js`; replace it before using the service with real data and do not expose the sample service publicly. The `npm test` script is a placeholder and does not run a test suite.

<!-- bigidsecure-community-guidance -->
## BigID Community

This repository is part of [BigID Community](https://github.com/bigidsecure), a place for community members to share code, integrations, examples, and projects with other BigID customers.

Project ownership and support vary by repository. Check the maintainers, license, prerequisites, and compatibility notes before use, and validate the project in your own environment. Unless this repository explicitly says otherwise, do not assume the project is officially supported or maintained by BigID.

Please do not commit credentials, customer data, or other confidential information. Check this repository’s contribution guidance before submitting changes.
