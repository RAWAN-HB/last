const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    assignedOfferId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Offer',
  default: null
},
    // Add to userSchema:
companyId: { 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'User', 
  default: null 
},
// For supervisors pending approval
isApproved: { 
  type: Boolean, 
  default: function() {
    // Students and admins are approved by default
    // Companies and supervisors need approval
    return !['company', 'supervisor'].includes(this.role);
  }
},
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["student", "company", "admin", "super_admin", "supervisor"],
      default: "student",
    },
    // For supervisors - department they belong to
    department: { type: String, default: null },
    // Company approval status
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Companies need approval - set isApproved to false by default for companies
userSchema.pre("save", async function () {
  // Hash password
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  // New company accounts need approval
  if (this.isNew && this.role === "company") {
    this.isApproved = false;
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
