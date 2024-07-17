const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true, lowercase: true},
    phone: {type: String, required: true},
    password: {type: String, required: true},
    subscribe: { type: Boolean, default: false }
  }, { timestamps: true });

const User = mongoose.model('User', UserSchema);
module.exports = User;
