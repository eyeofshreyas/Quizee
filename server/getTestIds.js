require('dotenv').config();
const connectDB = require('./config/database');
const mongoose = require('mongoose');
const Certification = require('./models/Certification');
const User = require('./models/User');
const Question = require('./models/Question');

async function main() {
  await connectDB();

  const cert = await Certification.findOne({ code: 'CLF-C02' });
  const user = await User.findOne({ username: 'testuser' });
  const questions = await Question.find({ cert_id: cert?._id }).limit(3);

  console.log('Certification ID:', cert?._id.toString());
  console.log('User ID:', user?._id.toString());
  console.log('Sample Question IDs:', questions.map(q => q._id.toString()));

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});