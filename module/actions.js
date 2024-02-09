const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const action = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: true
  },
  action:{
    type: String,
    required: true,
    unique: true,
    default:"default",
  },
});


module.exports = mongoose.model('action', action);