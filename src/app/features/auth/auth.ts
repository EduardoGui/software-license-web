export interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  expiraEm: string;
}

export interface DefinirSenhaPayload {
  email: string;
  token: string;
  novaSenha: string;
}
