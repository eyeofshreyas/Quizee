// database/connection.js
require('dotenv').config();
const mongoose = require('mongoose');

async function connect() {
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    await mongoose.connect(process.env.MONGODB_URI);
    return mongoose.connection;
}

module.exports = { connect, mongoose };
