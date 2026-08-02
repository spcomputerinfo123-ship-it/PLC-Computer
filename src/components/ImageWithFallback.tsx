import { useState } from 'react';
import * as Icons from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  iconName?: string;
  type?: 'course' | 'gallery' | 'news';
}

export default function ImageWithFallback({ src, alt, className, iconName, type = 'course' }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  
  const Icon = iconName ? (Icons as any)[iconName] : ImageIcon;

  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 ${className}`}>
        {Icon ? <Icon className="w-1/3 h-1/3 max-w-16 max-h-16 opacity-50" /> : <ImageIcon className="w-1/3 h-1/3 max-w-16 max-h-16 opacity-50" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}
