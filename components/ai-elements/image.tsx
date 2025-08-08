/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils';
import type { Experimental_GeneratedImage } from 'ai';

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
};

export const Image = ({
  base64,
  mediaType,
  ...props
}: ImageProps) => (
  <img
    {...props}
    src={`data:${mediaType};base64,${base64}`}
    alt={props.alt}
    className={cn(
      'max-w-full h-auto rounded-md overflow-hidden',
      props.className,
    )}
  />
);
