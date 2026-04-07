import { z } from "zod";

export const jobSchema = z.object({
  titulo: z.string().min(2, "Informe o título"),
  descricao: z.string().min(10, "Descreva a vaga"),
  tipo_funcao: z.string().min(2, "Informe o tipo de função"),
});

export type JobFormValues = z.infer<typeof jobSchema>;
