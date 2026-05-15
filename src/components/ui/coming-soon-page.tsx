import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface Props {
  title: string;
  emoji: string;
  backHref?: string;
  description?: string;
}

export function ComingSoonPage({ title, emoji, backHref = '/', description }: Props) {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {backHref && (
        <div className="bg-white border-b border-[#E8E8E0] px-4 py-3">
          <Link href={backHref} className="flex items-center gap-1 text-sm text-[#666] font-plus-jakarta hover:text-[#198A2E] transition-colors">
            <ChevronLeft size={16} /> Back
          </Link>
        </div>
      )}
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
        <div className="text-center p-8">
          <p className="text-6xl mb-4">{emoji}</p>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-2">{title}</h1>
          <p className="text-[#666] font-plus-jakarta text-sm">
            {description ?? 'This feature is coming soon. Check back shortly.'}
          </p>
        </div>
      </div>
    </div>
  );
}
