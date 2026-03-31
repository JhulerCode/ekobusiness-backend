export const keys = {
    user: (id) => `user:${id}`,
    empresa: (id) => `empresa:${id}`,
    subdomain: (sub) => `subdomain:${sub}`,
    companySessions: (id) => `empresa_sessions:${id}`,
    refreshToken: (token) => `refreshToken:${token}`,
    userAll: () => 'user:*',
    empresaAll: () => 'empresa:*',
}
