//create and export configuration variables

//container for all the environments

let environments={}

environments.staging = {
  httpPort: 3000,
  httpsPort:5500,
  envName: "staging",
};

environments.production = {
  httpPort: 80,
  httpsPort:443,
  envName: "production",
};

//determine which should be exported out according to 
//what is passed in  the command line through process.env.NODE_ENV

let currentEnv = typeof process.env.NODE_ENV == 'string'?process.env.NODE_ENV.toLocaleLowerCase():''

//check only for defined environments, if not default to the staging
//if the provided does not exist, then environments[currentEnv] will be 'undefined' type
var envExported = typeof environments[currentEnv] == 'object'?environments[currentEnv]:environments.staging;

//export the module

export default envExported 
