const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  profileImage: String
});

module.exports = mongoose.model('user', userSchema);