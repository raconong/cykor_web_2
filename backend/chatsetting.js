const mongoose = require('mongoose');

const chatstruct = new mongoose.Schema({ //
  message: String,
  timestamp: { type: Date, default: Date.now } //현재 시간 저장
});

module.exports = mongoose.model('chat', chatstruct); //mongodb의 chat에 저장

