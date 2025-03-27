// Configuração do cliente Supabase
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'your-anon-key';

// Inicializa o cliente
export const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Adiciona log para debug
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth event:', event);
    console.log('Session:', session);
}); 