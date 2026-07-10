require('dotenv').config();
const app = require('./app.js');
const connectDB = require('./config/database.js');
const logger = require('./utils/logger.js');

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));