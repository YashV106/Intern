const express = require("express");
const router = express.Router();

const { isDbConnected } = require("../db");

const admin = require("./admin");

// Stop API calls that require Mongo when DATABASE_URL isn't configured/connected
router.use((req, res, next) => {
  if (typeof isDbConnected === "function" && !isDbConnected()) {
    return res.status(503).json({
      error: "DB not connected. Set DATABASE_URL to enable data operations.",
    });
  }
  return next();
});

const intern = require("./internship");
const job = require("./job");
const application = require("./application");
const frenchOtp = require("./frenchOtp");

const resume = require("./resume");
const payment = require("./payment");
const emailOtp = require("./emailOtp");
const premiumResume = require("./premiumResume");
const publicSpace = require("./publicSpace");

const authForgotPassword = require("./auth/forgotPassword");

// DEBUG: validate route modules are functions/routers to avoid Express "argument handler must be a function"
function assertRouter(name, mod) {
  const t = typeof mod;
  const isRouter = !!mod && (t === "function" || !!mod.stack);
  if (!isRouter) {
    throw new TypeError(
      `Invalid Express handler for "${name}". typeof=${t}. Ensure the module exports an express.Router().`
    );
  }
  return true;
}

const authLogin = require("./auth/login");

// Validate modules before mounting
assertRouter("admin", admin);
assertRouter("intern", intern);
assertRouter("job", job);
assertRouter("application", application);
assertRouter("frenchOtp", frenchOtp);
assertRouter("resume", resume);
assertRouter("payment", payment);
assertRouter("emailOtp", emailOtp);
assertRouter("premiumResume", premiumResume);
assertRouter("publicSpace", publicSpace);
assertRouter("authForgotPassword", authForgotPassword);
const authVerifyOtp = require("./auth/verifyOtp");
const profileLoginHistory = require("./users/profileLoginHistory");

router.use("/admin", admin);
router.use("/internship", intern);
router.use("/job", job);
router.use("/application", application);
router.use("/french-otp", frenchOtp);

router.use("/resume", resume);
router.use("/payment", payment);
router.use("/email-otp", emailOtp);
router.use("/premium-resume", premiumResume);

router.use("/auth/", authForgotPassword);

// Conditional login flow (mobile restriction + Chrome OTP)
router.use("/auth/login", authLogin);
router.use("/auth/verify-otp", authVerifyOtp);

// Authenticated profile: login history
router.use("/users/profile", profileLoginHistory);

router.use("/public-space", publicSpace);


module.exports = router;



