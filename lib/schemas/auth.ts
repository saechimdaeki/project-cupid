import { z } from "zod";

const usernameField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._-]{4,20}$/, "아이디는 영문 소문자, 숫자, ., _, - 조합 4-20자로 입력해주세요.");

export const loginSchema = z.object({
  username: usernameField,
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  username: usernameField,
  fullName: z.string().trim().min(2, "이름을 2자 이상 입력해주세요.").max(50),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다."),
});

export type SignupInput = z.infer<typeof signupSchema>;
