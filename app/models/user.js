const mongoose = require("mongoose");
// passportLocalMongoose = require("passport-local-mongoose");
const { NumberContext } = require("twilio/lib/rest/pricing/v2/number");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  phone_no: {
    type: Number,
  },
  email: {
    type: String,
    trim: true,
  },
  password: String,
  joined: { type: Date, default: Date.now() },
  bookIssueInfo: [
    {
      book_info: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "issue",
        },
      },
    },
  ],
  gender: String,
  reg_no: Number,
  fines: { type: Number, default: 0 },
  is_admin: { type: Boolean, default: false },
});

// userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", userSchema);