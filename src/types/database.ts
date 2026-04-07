export type ProfileRow = {
  user_id: string;
  role: string;
  name: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
  curso: string | null;
  experiencia: string | null;
  curriculo_url: string | null;
  empresa_nome: string | null;
  created_at: string;
  updated_at: string;
};

export type JobRow = {
  id: string;
  titulo: string;
  descricao: string;
  tipo_funcao: string;
  empresa_id: string;
  empresa_nome: string;
  created_at: string;
};

export type ApplicationRow = {
  id: string;
  job_id: string;
  user_id: string;
  status: "aplicado" | "em_analise" | "aprovado";
  created_at: string;
};

export type ApplicationStatus = ApplicationRow["status"];
