import { AuthProvider } from '../../hooks/useAuth'
import { AuthPage } from '../../components/auth/AuthPage'

export default function Auth() {
  return (
    <AuthProvider>
      <AuthPage />
    </AuthProvider>
  )
} 