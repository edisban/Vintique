import bcrypt from "bcryptjs";

export type User = { email: string; password: string; name: string };
export const users: User[] = [];
export { bcrypt };
