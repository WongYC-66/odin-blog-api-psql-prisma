const mongoose = require("mongoose");
const date = require('date-and-time');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  contents: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User"},
  timestamp: { type: Date, required: true },
  isPublished: { type: Boolean, default: true },
  // comments: [{ type: Schema.Types.ObjectId, ref: "Comment"},],
});

// Virtual for MessageSchema's date-and-time
PostSchema.virtual("datetime").get(function () {
  // We don't use an arrow function as we'll need the this object
  return date.format(this.timestamp, 'HH:mm:ss, YYYY/MM/DD'); 
});


// Export model
module.exports = mongoose.model("Post", PostSchema);