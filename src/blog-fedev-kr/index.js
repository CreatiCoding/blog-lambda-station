const { callbackFunction } = require("local-util");
const documentRouter = require("document-router");

exports.handler = async function (event, context, callback) {
  const { callbackJSON } = callbackFunction(callback);
  const query = event.queryStringParameters;
  return documentRouter[event.rawPath]
    ? documentRouter[event.rawPath]({ callback, query })
    : callbackJSON(200, {
        message: `documentRouter[${event.rawPath}] is not defined`,
      });
};
