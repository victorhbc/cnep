import { z } from "zod";

export const profileAlunoSchema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(8, "Telefone inválido"),
  curso: z.string().min(2, "Informe o curso"),
  experiencia: z.string().optional(),
  cpf: z.string().optional(),
});

export type ProfileAlunoForm = z.infer<typeof profileAlunoSchema>;
