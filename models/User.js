import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    preferences: {
      dietaryRestrictions: { type: [String], default: [] },
      allergies: { type: [String], default: [] },
      favoriteCuisines: { type: [String], default: [] },
      calorieGoal: { type: Number, default: 2000 },
      mealsPerDay: { type: Number, default: 3 },
    },
    savedRecipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    weeklyMealPlan: {
      type: Map,
      of: [String],
      default: {},
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// 🔐 Hash password
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return ;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  
});

// 🔑 Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ FIXED LINE
const User =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);

export default User;