const userModel = require("../models/user.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config/config.js");
const sessionModel = require("../models/session.model.js");
const strict = require("assert/strict");
const sendEmail = require("../services/email.service.js");
const utils = require("../utils/utils.js");
const otpModel = require("../models/otp.model.js");

async function register(req, res) {
  const { username, email, password } = req.body;

  const isAlreadyRegistered = await userModel.findOne({
    $or: [{ username: username }, { email: email }],
  });

  if (isAlreadyRegistered) {
    res.status(409).json({
      message: "user already registered",
    });
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
  });
  const otp = utils.generateOtp();
  const html = utils.getOtpHtml(otp);

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  await otpModel.create({
    email,
    user:user._id,
    otpHash
  })

  await sendEmail(email, "Your OTP for email verification", `Your OTP is ${otp}`, html);

    
//   const refreshToken = jwt.sign(
//     {
//       id: user._id,
//     },
//     config.JWT_SECRET,
//     {
//       expiresIn: "7d",
//     },
//   );

//   const refreshTokenHash = crypto
//     .createHash("sha256")
//     .update(refreshToken)
//     .digest("hex");

//   const session = await sessionModel.create({
//     userId: user._id,
//     refreshTokenHash,
//     ip: req.ip,
//     userAgent: req.headers["user-agent"],
//   });

//   const accessToken = jwt.sign(
//     {
//       id: user._id,
//       sessionId: session._id,
//     },
//     config.JWT_SECRET,
//     {
//       expiresIn: "15m",
//     },
//   );

//   res.cookie("refreshToken", refreshToken, {
//     httpOnly: true,
//     secure: true,
//     sameSite: "strict",
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   });

  res.status(201).json({
    message: "user registered successfully",
    user: {
      username: user.username,
      email: user.email,
      verified:user.verified
    }
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(401).json({
      message: "Invalid email",
    });
  }
  if(!user.verified){
    return res.status(401).json({
        message:"Email not verified"
    });
  }
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const isPasswordValid = hashedPassword === user.password;
  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid password",
    });
  }

  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.create({
    userId: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    message: "Logged In successfully",
    user: {
      username: user.username,
      email: user.email,
    },
    accessToken,
  });
}

async function getme(req, res) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "token not found",
    });
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);

  const user = await userModel.findById(decoded.id);
  res.status(200).json({
    message: "user fetched successfully",
    user: {
      username: user.username,
      email: user.email,
    },
  });
}

async function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token not found",
    });
  }
  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false,
  });

  if (!session) {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }

  const accessToken = jwt.sign(
    {
      id: decoded.id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  const newRefreshToken = jwt.sign(
    {
      id: decoded.id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    message: "Access Token refreshed successfully",
    accessToken,
  });
}

async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({
      message: "refresh token not found",
    });
  }

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoked: false,
  });

  if (!session) {
    return res.status(400).json({
      message: "Invalid refreshToken",
    });
  }

  session.revoked = true;

  await session.save();

  res.clearCookie("refreshToken");
  res.status(200).json({
    message: "Logged Out successfully",
  });
}

async function logoutAll(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({
      message: "Refresh token not found",
    });
  }
  const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

  await sessionModel.updateMany(
    {
      // userId:decoded.id,
      revoked: false,
    },
    {
      revoked: true,
    },
  );

  res.clearCookie("refreshToken");
  res.status(200).json({
    message: "Logged out from all devices successfully",
  });
}

async function verifyEmail(req,res){
    const {otp,email}=req.body

    const otpHash=crypto.createHash("sha256").update(otp).digest("hex");
    const otpDoc=await otpModel.findOne({
        email,
        otpHash
    })
    if(!otpDoc){
        return res.status(400).json({
            message:"Invalid OTP"
        });
    }
    const user = await userModel.findByIdAndUpdate(otpDoc.user,{
        verified:true
    })
    await otpModel.deleteMany({
        user:otpDoc.user
    })

    return res.status(200).json({
        message:"Email verified successfully"
    });
}

module.exports = { register, login, getme, refreshToken, logout, logoutAll,verifyEmail };
