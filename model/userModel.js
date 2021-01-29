const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please, Tell us your name!'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide your Email to proceed'],
    lowercase: true, // Not a validator, it will just convt. the entered text to lowercase.
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: 'Role is either: User, Guide, Lead-Guide or Admin',
    },
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [8, 'Password must contain minimum 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must have to confirm their password'],
    validate: {
      // ONLY WORKS ON create and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // Only run this func. if password is modified
  if (!this.isModified('password')) return next();

  //   hash the password with cost of 12 (more the cost more the password will be intensive for cpu)
  this.password = await bcrypt.hash(this.password, 12);

  //   delete the password confirm
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JwtTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); //we should not store this plain
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); // encrypted reset token

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token validation (10 minutes)

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
