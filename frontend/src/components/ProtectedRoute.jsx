import { useAuth } from "@/context/useAuth"
import Unauthorized from "@/pages/Unauthorized"
import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return <Unauthorized />
  }

  return children
}

export default ProtectedRoute