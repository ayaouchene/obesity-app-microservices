const mongoose = require('mongoose');
  const bcrypt = require('bcryptjs');

  const patientSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
    },
  });

  patientSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });

  module.exports = mongoose.model('Patient', patientSchema);