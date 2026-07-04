const mongoose = require("mongoose");

const domainSchema = new mongoose.Schema(
  {
    cert_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certification",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    weightage: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Domain", domainSchema);