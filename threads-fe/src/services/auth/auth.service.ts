import { Auth } from "../../constants/auth/auth.constant";
import type { LoginDto } from "../../interfaces/auth/login.interface";
import type { RegisterDto } from "../../interfaces/auth/register.interface";
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

  me: () => {
    return instance.get(Auth.ME);
  },
};
