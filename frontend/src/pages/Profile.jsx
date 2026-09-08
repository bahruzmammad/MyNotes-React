import { useEffect } from "react"

import PageContainer from "../components/layout/PageContainer"
import ProfileForm from "../components/profile/ProfileForm"
import ProfileHeader from "../components/profile/ProfileHeader"
import Spinner from "../components/ui/Spinner"
import { useProfile } from "../hooks/useProfile"

function Profile() {
    const { profile, loading, error, fetchProfile, saveProfile } = useProfile()

    useEffect(() => {
        fetchProfile().catch((error) => {
            console.error(error)
        })
    }, [fetchProfile])

    if (loading && !profile) {
        return (
            <PageContainer className="py-8">
                <div className="flex justify-center py-16">
                    <Spinner />
                </div>
            </PageContainer>
        )
    }

    return (
        <PageContainer className="py-8">
            <div className="space-y-8">
                <ProfileHeader profile={profile} />

                <div className="mx-auto w-full max-w-2xl">
                    <ProfileForm
                        profile={profile}
                        onSubmit={saveProfile}
                        loading={loading}
                        error={error}
                    />
                </div>
            </div>
        </PageContainer>
    )
}

export default Profile
