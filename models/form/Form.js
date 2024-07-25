const mongoose = require('mongoose');

const formSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },

    projects: {
      type: String,
      enum: ['projects', 'others'], // Adjust the enum values based on the actual options
      required: [true, "Project selection is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    agreeToCalls: {
      type: Boolean,
      required: [true, "Agreement to receive calls and emails is required"],
    },
    agreeToUpdates: {
      type: Boolean,
      required: [true, "Agreement to receive updates and newsletters is required"],
    }
  },
  { timestamps: true }
);

const Form = mongoose.model('Form', formSchema);

module.exports = Form;
