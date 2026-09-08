import { useCallback, useState } from "react"

import { getProfile, updateProfile } from "../api/profilesApi"

export const useProfile = () => {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchProfile = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await getProfile()

            setProfile(response.user)

            return response
        } catch (error) {
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    const saveProfile = async (data) => {
        setLoading(true)
        setError(null)

        try {
            const response = await updateProfile(data)

            setProfile((currentProfile) => ({
                ...currentProfile,
                ...response.user,
            }))

            return response
        } catch (error) {
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return {
        profile,
        loading,
        error,
        fetchProfile,
        saveProfile,
    }
}
