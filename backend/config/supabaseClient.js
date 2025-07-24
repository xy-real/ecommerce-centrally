
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ptxqlcypckufredcmnmv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eHFsY3lwY2t1ZnJlZGNtbm12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDY4MTgsImV4cCI6MjA2ODkyMjgxOH0.r58lzMSX62-wbZ754Q0X2Wzqy-MQBm_oShd36DDzvn0'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase