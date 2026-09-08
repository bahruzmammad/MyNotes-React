function ProfileHeader({ profile }) {
    const avatar = profile?.avatar_url
    const initial = profile?.name?.charAt(0)?.toUpperCase() || "U"

    return (
        <header className="border-b border-gray-200 pb-6">
            <div className="flex items-start gap-4">
                {avatar ? (
                    <img
                        src={avatar}
                        alt={profile?.name || "Profile"}
                        className="h-16 w-16 shrink-0 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold text-gray-700">
                        {initial}
                    </div>
                )}

                <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                        {profile?.name || "Profile"}
                    </h1>

                    {profile?.email && (
                        <p className="mt-1 text-sm text-gray-500">{profile.email}</p>
                    )}

                    {profile?.bio && (
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                            {profile.bio}
                        </p>
                    )}
                </div>
            </div>
        </header>
    )
}

export default ProfileHeader
