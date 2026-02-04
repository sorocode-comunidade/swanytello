type UserWithPassword = { password: string;[k: string]: unknown };

export function sanitizeUser<T extends UserWithPassword>(user: T): Omit<T, "password"> {
  const { password: _p, ...rest } = user;
  return rest as Omit<T, "password">;
}
