// Substitua estas constantes com suas credenciais do Supabase
const SUPABASE_URL = 'https://frvichbilixzpruddyfp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydmljaGJpbGl4enBydWRkeWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzc2MDMsImV4cCI6MjA1ODYxMzYwM30.Ax-mMn62jSTBixYbrP0WAEr3FexxgVAcKEU0S3GSx-0';

// Cria o cliente do Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

export { supabase }; 