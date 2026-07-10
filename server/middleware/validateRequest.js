const ApiError = require('../utils/ApiError.js');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(new ApiError(400, error.details[0].message));
    }
    next();
  };
};

module.exports = validateRequest;