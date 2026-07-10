const {
  getAllCertifications,
  getCertificationById,
  getDomainsByCertification
} = require('../services/certificationService.js');
const ApiResponse = require('../utils/ApiResponse.js');

const list = async (req, res, next) => {
  try {
    const data = await getAllCertifications();
    res.status(200).json(new ApiResponse(200, data, 'Certifications fetched'));
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const data = await getCertificationById(req.params.id);
    res.status(200).json(new ApiResponse(200, data, 'Certification fetched'));
  } catch (err) {
    next(err);
  }
};

const domains = async (req, res, next) => {
  try {
    const data = await getDomainsByCertification(req.params.id);
    res.status(200).json(new ApiResponse(200, data, 'Domains fetched'));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getOne, domains };