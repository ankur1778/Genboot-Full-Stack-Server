const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phNo: { type: String, required: true },
    roleId:{type:String, default:"2"}
});

const UserModel = mongoose.model('User', userSchema);

module.exports = {UserModel};
