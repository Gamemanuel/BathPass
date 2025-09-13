import Image from 'next/image';

export default function UserAvatar({ user }: { user: any }) {
    const avatar = user?.user_metadata?.avatar_url;
    const initials = user?.user_metadata?.full_name
        ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('')
        : user?.email?.[0]?.toUpperCase() ?? '?';

    if (avatar) {
        return (
            <Image
                src={avatar}
                alt="User avatar"
                width={48}
                height={48}
                className="rounded-full"
            />
        );
    }
    return (
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
            {initials}
        </div>
    );
}
