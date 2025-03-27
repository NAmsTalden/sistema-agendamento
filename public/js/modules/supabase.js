import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
const supabaseUrl = 'https://frvichbilixzpruddyfp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydmljaGJpbGl4enBydWRkeWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzc2MDMsImV4cCI6MjA1ODYxMzYwM30.Ax-mMn62jSTBixYbrP0WAEr3FexxgVAcKEU0S3GSx-0';

// Inicializa o cliente
export const supabase = createClient(supabaseUrl, supabaseKey);

// Adiciona log para debug
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth event:', event);
    console.log('Session:', session);
}); 