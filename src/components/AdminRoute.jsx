import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AdminRoute = () => {
    const { user, loading, isAdmin } = useAuth()

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Check if user is logged in AND is an admin
    if (!user || !isAdmin()) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default AdminRoute
