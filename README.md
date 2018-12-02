# Gradings
Beefboard's ratings API

## About

Developed in `node` with `typescript` gradings allows
ratings to be placed on Beefboard post ids from a specific user id.

## Testing

`npm install` will install dependencies for testing

### Linting

`airbnb-config-tslint` rules are used for `tslint` as a
linting tool. Full complience with `tslint` rules is required.

### Unit

Unit testing is completed in issolation with `sqlite3` as 
a database, and `jest` as a testing framework.

`npm test` to run unit testing.

Unit testing requires 100% branch and code coverage, apart
from `src/server.ts`.

### Acceptence

Acceptence testing is a final stage to testing, it requires `docker-compose`
and `docker` to be installed on the testing system.

In order to run acceptence tests the docker image must be built from 
the sourcecode: `docker build -t gradings:development .`

Acceptence will run the services in `docker-compose.acceptence.yml` and
then run the `acceptence.spec.ts`

## Pipeline

`master` and `development` pipelines will automatically build and
redeploy docker service on on the beefboard stack upon tests passing.

