import { cn } from './utils';
export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={cn('animate-pulse bg-[#E1C5E7] rounded-lg', className)} />
);
