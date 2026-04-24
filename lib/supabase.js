import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://roxvtwlmxqrlghztlqmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJveHZ0d2xteHFybGdoenRscW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NjIwOTAsImV4cCI6MjA5MTIzODA5MH0.vDn3oIoMGkdwlXD2RT0fLJMgL8skDvrU_KrsoqOcXec';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
