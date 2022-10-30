const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const userSchema = new mongoose.Schema({
  email: {
    type: "string",
    require: true,
  },
  password: {
    type: "string",
    require: true,
  },
  createdOn: {
    type: "string",
    default: Date.now,
  },
});

const encKey = process.env.ENC_KEY;
// encrypt password regardless of any other options. email will be left unencrypted
userSchema.plugin(encrypt, {
  secret: encKey,
  encryptedFields: ["password"],
});

module.exports = mongoose.model("user", userSchema);
