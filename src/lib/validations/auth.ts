import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const baseSignup = {
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  name: z.string().min(2, "Informe seu nome"),
};

export const signupAlunoSchema = z.object({
  ...baseSignup,
  role: z.literal("aluno"),
  telefone: z.string().min(8, "Telefone inválido"),
  curso: z.string().min(2, "Informe o curso"),
  experiencia: z.string().optional(),
  cpf: z.string().optional(),
});

export const signupEmpresaSchema = z.object({
  ...baseSignup,
  role: z.literal("empresa"),
  empresa_nome: z.string().min(2, "Informe o nome da empresa"),
});

export const signupSchema = z.discriminatedUnion("role", [
  signupAlunoSchema,
  signupEmpresaSchema,
]);

export type SignupInput = z.infer<typeof signupSchema>;
