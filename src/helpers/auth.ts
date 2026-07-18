import * as bcryptjs from "bcryptjs";

// Convert a plain text password into a secure hash string
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

// Compare an entered password with the hashed password stored in MongoDB
export async function verifyPassword(
  password: string,
  hashed: string,
): Promise<boolean> {
  return bcryptjs.compare(password, hashed);
}
