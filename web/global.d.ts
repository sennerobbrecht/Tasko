import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type ModelViewerProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & {
    src?: string;
    alt?: string;
    ar?: boolean;
    'ar-modes'?: string;
    'camera-controls'?: boolean;
    'touch-action'?: string;
    'shadow-intensity'?: string;
    exposure?: string;
    'environment-image'?: string;
  },
  HTMLElement
>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerProps;
    }
  }
}

export {};
