const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-2" });
const doc = require("dynamodb-doc");
const jwt = require("jsonwebtoken");
const dynamo = new doc.DynamoDB();
const jwt_secret = process.env.JWT_SECRET;
const {
  genSalt,
  encryptPassword,
  comparePassword,
  callbackFunction,
} = require("local-util");

exports.handler = async function (event, context, callback) {
  try {
    const { callbackReponse, callbackJSON } = callbackFunction(callback);
    const query = event.queryStringParameters;

    let { id = "", password = "" } =
      {
        ...event.queryStringParameters,
        ...JSON.parse(event.body),
      } || {};
    if (!id || !password) {
      return callbackReponse(
        400,
        JSON.stringify(
          { message: "parameter error" + `\n${event.body}` },
          null,
          2
        )
      );
    }

    const data = await new Promise((resolve, reject) => {
      dynamo.getItem(
        {
          TableName: "USER",
          Key: { id },
        },
        (err, data) => (err ? reject(err) : resolve(data))
      );
    }).catch((err) => callbackReponse(400, JSON.stringify({ err }, null, 2)));
    const user = data.Item;
    if (
      !user ||
      !user.password ||
      !user.status_code ||
      parseInt(user.status_code) !== 10
    ) {
      user.password && delete user.password;
      return callbackJSON(400, {
        message: [`회원 정보가 올바르지 않습니다.`, JSON.stringify(user)].join(
          "\n"
        ),
      });
    }

    if (!comparePassword(user.password, password)) {
      return callbackJSON(400, {
        status_code: 400,
        message: "비밀번호가 올바르지 않습니다.",
      });
    }

    return callbackJSON(200, {
      token: jwt.sign(
        {
          id: user.id,
          name: user.name,
          status_code: user.status_code,
        },
        jwt_secret
      ),
    });
  } catch (e) {
    return callbackJSON(500, e);
  }
};
