/**
 * Primary files for the API
 * 
 * set environment variable with the command 
 *    $env:NODE_ENV="production" in powershell
 *    set NODE_ENV=production&&node index.mjs in cmd (no space after &&)
 * 
 */

//Dependencies 

import http from 'http';
import https from 'https';
import url from 'url'; //help us parse urls
import { StringDecoder } from 'string_decoder';
import config from './config.mjs'
import fs from 'fs'





//instantiating the http server

const httpServer = http.createServer((req, res) => {
  unifiedServer(req,res)
});

httpServer.listen(config.httpPort, () =>
  console.log(
    `The server is listening on http port ${config.httpPort} in ${config.envName} mode`
  )
);

//https requires a the key and the certificate to create a https server
const httpsServerOptions={
  'key':fs.readFileSync('./https/key.pem'),
  'cert':fs.readFileSync('./https/cert.pem')
}

//instantiate the https server
const httpsServer = https.createServer(httpsServerOptions,(req, res) => {
  unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, () =>
  console.log(
    `The server is listening on https port ${config.httpsPort} in ${config.envName} mode`
  )
);

//function to handle the server processes

let unifiedServer = (req,res)=>{
  //get the url and parse it
  let parsedUrl = url.parse(req.url, true); //@param true returns an object version of the query property of the request
  //get the path
  let path = parsedUrl.pathname;
  //trim the path. i.e so that http/foo/ is same as http/foo
  let trimmedPath = path.replace(/^\/+|\/+$/g, "");

  //get the query string object from the request
  let query = parsedUrl.query;

  //get the http method
  let method = req.method.toUpperCase();

  //get the headers as an object
  let headers = req.headers;

  //get the payloads if any, i.e POST ,PUT , PATCH
  let decoder = new StringDecoder("utf-8");
  //since payloads come as stream, we want to append all of them into one string. req emits the event called data upon receiving of a stream, and an end event when all the data has streamd in
  let buffer = "";

  req.on("data", (data) => {
    buffer = buffer.concat(decoder.write(data));
    //we're not sending our response here since it's not a must that the data event happens, i.e when there is no data
  });
  //end event will alwas get called
  req.on("end", () => {
    buffer = buffer.concat(decoder.end());

    //choose the handler this request should go to, if one is not found, use the not found handler

    let chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    //construct the data object to send to the handler
    const data = {
      path: trimmedPath,
      queryObject: query,
      method: method,
      headers: headers,
      payload: buffer,
    };

    //route the request to the handler specified by the router
    //note that the return value of the variable `chosenHandler` was a function and that is why we're able to invoke it down below
    chosenHandler(data, (statusCode, handlerPayload) => {
      //use code provided or default to 200
      statusCode = typeof statusCode == "number" ? statusCode : 200;

      //use the payload or default to an exmpty object {}

      handlerPayload = typeof handlerPayload == "object" ? handlerPayload : {};

      let handlerPayloadStr = JSON.stringify(handlerPayload);

      //sending response in terms of parsed JSON
      res
        .setHeader("Content-Type", "application/json")
        .writeHead(statusCode)
        .end(handlerPayloadStr);

      console.log(
        `Returning this reponse:Status: ${statusCode}, Payload: ${handlerPayloadStr} `
      );
    });
  });
}


//defining handlers 
let handlers = {}

handlers.ping = (data, callback)=>{
  //always call back 200 to any request
  callback(200, {message:"App is responsive"})
}

handlers.notFound = function(data,callback){
    callback(404,{message:'Page Not Found'})
}

//defining router with their handlers
let router = {
    ping : handlers.ping

}