import { authService } from "../services/auth.service.js";
import { sendEmail } from "../services/email.service.js";
import { password } from "../utils/password.js";
import { token } from "../utils/token.js";
import { authValidator } from "../validators/auth.validator.js";

export const register = async (req, res) => {
  try {
    const result = authValidator.register.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ success: false, message: result.error.issues[0].message });
    }
    const validatedData = result.data;
    const hashedPassword = await password.hash(validatedData.password);
    validatedData.password = hashedPassword;
    const user = await authService.register(validatedData);
    const jwtToken = token.create(user.email, user._id);
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ success: true, message: "User registeration successful", data: user });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({success: false, message: error.message || "internal server failure" });
  }
};

export const login = async (req, res) => {
  try {
    const result = authValidator.login.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ success: false, message: result.error.issues[0].message });
    }
    const user = await authService.login(result.data);
    const jwtToken = token.create(user.email, user._id);
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ success: true, message: "Logged In"});
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

export const logout = (req, res) => {
  res
    .clearCookie("token", "", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/",
    })
    .json({ success: true, message: "User logged out" });
};

export const me = async (req, res) => {
  try {
    const user = token.verify(req.cookies.token);
    if (!user) {
      return res.status(404).json({ success: false, message: "No user found" });
    }
    return res.status(200).json({success: true, message: "User Found", data: user})
  }
  catch(error){
    res.status(error.statusCode || 500).json({success: false, message: error.message || "Server error"})
  }
};

export const sendMail = async (req, res) => {
  await sendEmail({
  to: "sharp.sahib@gmail.com",
  subject: "Expense added",
  html: "<p>New expense added in Splitr</p>"
});
console.log("mail sent");
res.status(200).json({success: true, message: "Mail sent"})
}

export const authController = {
  register,
  login,
  logout,
  me,
  sendMail,
};
