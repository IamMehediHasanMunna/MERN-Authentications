const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
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

module.exports = mongoose.model("user", userSchema);
