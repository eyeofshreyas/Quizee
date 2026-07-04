const Certification = require('../models/Certification');
const Domain = require('../models/Domain');
const ApiError = require('../utils/ApiError');

const getAllCertifications = async () => {
  return Certification.find({ isActive: true }).sort({ name: 1 });
};

const getCertificationById = async (id) => {
  const cert = await Certification.findById(id);
  if (!cert) {
    throw new ApiError(404, 'Certification not found');
  }
  return cert;
};

const getDomainsByCertification = async (certId) => {
  const cert = await Certification.findById(certId);
  if (!cert) {
    throw new ApiError(404, 'Certification not found');
  }
  return Domain.find({ cert_id: certId }).sort({ name: 1 });
};

module.exports = { getAllCertifications, getCertificationById, getDomainsByCertification };