
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Se as variáveis não estão configuradas, criar um cliente mock
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variáveis de ambiente do Supabase não configuradas. Conecte o projeto ao Supabase.');
  
  // Cliente mock que simula as funcionalidades básicas
  const mockSupabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }) }) }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }) }),
    }),
    functions: {
      invoke: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }),
    },
    rpc: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }),
  };
  
  export const supabase = mockSupabase as any;
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
}
