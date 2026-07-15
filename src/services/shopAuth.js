import { supabase } from '../assets/subabaseclient'
import bcrypt from 'bcryptjs'

const configured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const message = (error) =>
  error?.message || 'Unable to connect to Supabase. Please try again.'

// ==========================
// CREATE NEW ACCOUNT
// ==========================
export async function createShopAccount({ name, email, password }) {
  if (!configured) {
    return {
      data: {
        account_name: name,
        account_email: email,
      },
    }
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10)

  const { data, error } = await supabase
    .from('login')
    .insert([
      {
        account_name: name,
        account_email: email,
        account_password: hashedPassword,
      },
    ])
    .select()
    .single()

  if (error) {
    return { error: message(error) }
  }

  return { data }
}

// ==========================
// LOGIN
// ==========================
export async function authenticateShopper({ email, password }) {
  if (!configured) {
    return {
      data: {
        account_email: email,
        account_name: email.split('@')[0],
      },
    }
  }

  // Find user by email only
  const { data, error } = await supabase
    .from('login')
    .select('*')
    .eq('account_email', email)
    .single()

  if (error || !data) {
    return {
      error: 'Invalid email or password.',
    }
  }

  // Compare entered password with stored hash
  const passwordMatch = await bcrypt.compare(
    password,
    data.account_password
  )

  if (!passwordMatch) {
    return {
      error: 'Invalid email or password.',
    }
  }

  return { data }
}