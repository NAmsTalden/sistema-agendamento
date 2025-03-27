// Substitua estas constantes com suas credenciais do Supabase
const SUPABASE_URL = 'https://aqxqxvxvxvxvxvxvxvxv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Sua chave anon/public

// Cria o cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Debug: Log de alterações no estado de autenticação
supabase.auth.onAuthStateChange((event, session) => {
    console.debug('Supabase Auth:', { event, session });
});

// Debug: Intercepta chamadas à tabela para logging
const originalFrom = supabase.from.bind(supabase);
supabase.from = (table) => {
    console.debug(`Acessando tabela: ${table}`);
    return originalFrom(table);
};

export { supabase }; 