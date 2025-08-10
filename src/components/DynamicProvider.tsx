'use client';

import type { ReactNode } from 'react';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react';

interface Props { children: ReactNode }

export default function DynamicProvider({ children }: Props) {
  const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || 'demo';

  return (
    <DynamicContextProvider settings={{ environmentId }}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {children as unknown as any}
    </DynamicContextProvider>
  );
} 