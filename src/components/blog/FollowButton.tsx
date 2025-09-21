'use client';

interface FollowButtonProps {
  authorId: string;
}

export function FollowButton({ authorId }: FollowButtonProps) {
  const handleFollow = () => {
    // Could implement follow functionality here
    console.log('Follow author:', authorId);
  };

  return (
    <button
      type="button"
      className="inline-flex items-center px-3 py-1 bg-white border border-teal-600 text-teal-600 text-sm rounded-full hover:bg-teal-50 transition-colors"
      onClick={handleFollow}
    >
      Follow
    </button>
  );
}