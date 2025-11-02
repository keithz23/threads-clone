import type { UpdateProfileDto } from "@/interfaces/auth/profile.interface";
import { Auth } from "../../constants/auth/auth.constant";
import type { ForgotPasswordDto } from "../../interfaces/auth/forgot-password.interface";
import type { LoginDto } from "../../interfaces/auth/login.interface";
import type { RegisterDto } from "../../interfaces/auth/register.interface";
import type { ResetPasswordDto } from "../../interfaces/auth/reset-password.interface";
import { instance } from "../../libs/api/axios";

export const AuthService = {
  register: (registerDto: RegisterDto) => {
    return instance.post(Auth.REGISTER, {
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
      passwordConfirm: registerDto.confirmPassword,
      displayName: registerDto.displayName,
    });
  },

  login: (loginDto: LoginDto) => {
    return instance.post(Auth.LOGIN, {
      identifier: loginDto.identifier,
      password: loginDto.password,
    });
  },

  logout: () => {
    return instance.post(Auth.LOGOUT, {});
  },

  forgotPassword: (forgotPasswordDto: ForgotPasswordDto) => {
    return instance.post(Auth.FORGOT, { email: forgotPasswordDto.email });
  },

  resetPassword: (resetPasswordDto: ResetPasswordDto) => {
    console.log(resetPasswordDto);
    return instance.post(Auth.RESET, {
      token: resetPasswordDto.token,
      newPassword: resetPasswordDto.newPassword,
    });
  },

  refresh: () => {
    return instance.post(Auth.REFRESH, {});
  },

  me: () => {
    return instance.get(Auth.ME);
  },

  updateProfile: (updateProfileDto: UpdateProfileDto) => {
    return instance.patch(Auth.ME, {
      displayName: updateProfileDto.displayName,
      bio: updateProfileDto.bio,
      link: updateProfileDto.link,
      linkTitle: updateProfileDto.linkTitle,
      interests: updateProfileDto.interests,
      isPrivate: updateProfileDto.isPrivate,
    });
  },
};
