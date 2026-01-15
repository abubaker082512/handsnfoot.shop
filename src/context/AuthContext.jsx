import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                // Fetch user role
                const { data: roleData } = await supabase
                    .from('dashboard_users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()

                const userWithRole = {
                    ...session.user,
                    role: roleData?.role || 'user'
                }
                setUser(userWithRole)
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const { data: roleData } = await supabase
                    .from('dashboard_users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()

                const userWithRole = {
                    ...session.user,
                    role: roleData?.role || 'user'
                }
                setUser(userWithRole)
            } else {
                setUser(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const signUp = async (email, password, metadata = {}) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            })
            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error
            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            return { error: null }
        } catch (error) {
            return { error }
        }
    }

    const isAdmin = () => {
        return user?.role === 'admin' || user?.role === 'superadmin' || user?.email === 'handsnfoot@gmail.com'
    }

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signOut,
        isAdmin,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
