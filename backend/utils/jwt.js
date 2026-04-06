import jwt from "jsonwebtoken";

export function generateToken(admin) {
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}