export type UserRole =
  | "administrator"
  | "principal"
  | "teacher"
  | "student"
  | "parent"
  | "guest";

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  profile_image?: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
}
