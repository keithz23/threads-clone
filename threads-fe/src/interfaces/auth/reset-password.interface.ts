export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}
