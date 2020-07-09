const crypto = require("crypto");

const self = {
  genSalt: () => crypto.randomBytes(64).toString("hex"),
  encryptPassword: (password, salt = self.genSalt()) =>
    crypto
      .scryptSync(password, salt, 64, {
        N: 1024,
      })
      .toString("hex") + salt,
  comparePassword: (encoded_password, password) =>
    crypto
      .scryptSync(password, encoded_password.slice(128), 64, {
        N: 1024,
      })
      .toString("hex") === encoded_password.slice(0, 128),

  callbackFunction: (callback) => ({
    callbackReponse: (status, data) =>
      callback(null, { statusCode: status, body: data }),

    callbackJSON: (status, data) =>
      callback(null, {
        statusCode: status,
        body: JSON.stringify(data, null, 2),
      }),
  }),
};
module.exports = self;
