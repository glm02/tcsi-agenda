import { cn } from '@/lib/utils';

interface ProfileAvatarProps {
  src?: string | null;
  firstName: string;
  lastName?: string | null;
  pseudo?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-base', lg: 'w-20 h-20 text-2xl' };

const getInitials = (firstName: string, lastName?: string | null) => {
  const a = firstName[0]?.toUpperCase() ?? '';
  const b = lastName?.[0]?.toUpperCase() ?? '';
  return (a + b) || '?';
};

const getColor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i);
  const hue = Math.abs(h % 360);
  return `hsl(${hue}, 55%, 45%)`;
};

const ProfileAvatar = ({ src, firstName, lastName, pseudo, size = 'md', className }: ProfileAvatarProps) => {
  const initials = getInitials(firstName, lastName);
  const bgColor = getColor(firstName + (lastName ?? ''));

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn('rounded-full object-cover border-2 border-border', sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-primary-foreground border-2 border-border',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
};

export default ProfileAvatar;
