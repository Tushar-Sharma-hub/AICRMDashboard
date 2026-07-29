import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateToken } from "../utils/generateToken.js";

const toClientUser = (user) => ({ //toClientUser() is a function that is used to convert the user object to a client user object so that we dont expose the password to the client.
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  company: user.company,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, company } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const exists = await User.findOne({ email: email.toLowerCase() });

  if (exists) {
    throw new ApiError(409, "An account with that email already exists");
  }

  const user = await User.create({ //We didn't hash the password here because we have a pre-middleware hook in user model that will hash the password before saving.
    name,
    email,
    password,
    company,
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: toClientUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password"); //.select("+password") is used to select the password from the user object.. otherwise it will not be selected.

  if (!user || !(await user.matchPassword(password))) { //matchPassword is defined in User model that compares using bcrypt.compare();
    throw new ApiError(401, "Invalid email or password");
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: toClientUser(user),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: toClientUser(req.user),
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, company, avatar, password } = req.body;
  const user = req.user;

  if (name !== undefined) user.name = name;
  if (company !== undefined) user.company = company;
  if (avatar !== undefined) user.avatar = avatar;
  if (password) user.password = password;

  await user.save(); //pre-middleware hook in user will hash the password if changed.

  res.json({
    success: true,
    user: toClientUser(user),
  });
});