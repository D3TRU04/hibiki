'use client';

import { DynamicContextProvider } from '@dynamic-labs/sdk-react';

interface Props {
  children: any;
}

export default function DynamicProvider({ children }: Props) {
  const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || 'demo';
  return (
    <DynamicContextProvider settings={{ environmentId }}>
      {children}
    </DynamicContextProvider>
  );
} 