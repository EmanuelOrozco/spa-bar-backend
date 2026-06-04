export const PRIMARY_ADMIN_EMAIL = 'admin@spabar.com';

export function isPrimaryAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL;
}
