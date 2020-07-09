const doc = require("dynamodb-doc");
const dynamo = new doc.DynamoDB();
const { callbackFunction } = require("local-util");

const self = {
  ["/document/list"]: async ({ callback, query }) => {
    const { callbackJSON } = callbackFunction(callback);

    let { last_document_id = null, page_size = 10 } = query || {};
    last_document_id = last_document_id ? parseInt(last_document_id) : 1;
    page_size = parseInt(page_size);

    const data = await dynamo
      .query({
        TableName: "DOCUMENT",
        KeyConditionExpression:
          "user_id = :c AND document_id BETWEEN :from AND :to",
        ExpressionAttributeValues: {
          ":c": "creaticoding",
          ":from": last_document_id,
          ":to": last_document_id + page_size - 1,
        },
      })
      .promise();

    return callbackJSON(200, {
      data: {
        document_list: data.Items,
        total_count: data.Count,
        scanned_count: data.ScannedCount,
      },
    });
  },
  ["/document/detail"]: async ({ callback, query }) => {
    try {
      const { callbackJSON } = callbackFunction(callback);
      let { document_id = null } = query;
      document_id = parseInt(document_id);
      const { Item } = await dynamo
        .getItem({
          TableName: "DOCUMENT",
          Key: {
            user_id: "creaticoding",
            document_id: document_id,
          },
        })
        .promise();
      return callbackJSON(200, {
        data: {
          document: Item,
        },
      });
    } catch (e) {
      return callbackJSON(200, {
        data: {
          e,
        },
      });
    }
  },
};
module.exports = self;
