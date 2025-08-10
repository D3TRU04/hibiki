'use client';

import type { ReactNode } from 'react';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react';
import { DYNAMIC_CONFIG } from '@/lib/dynamic-auth';

interface Props { children: ReactNode }

export default function DynamicProvider({ children }: Props) {
  return (
    <DynamicContextProvider settings={DYNAMIC_CONFIG}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {children as unknown as any}
    </DynamicContextProvider>
  );
} 