'use client';

import { useDynamicWallet } from '@/hooks/useDynamicWallet';

export default function UserPanelDetails() {
  const { user } = useDynamicWallet();

  if (!user) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">User ID:</span>
        <span className="font-mono text-gray-900">{user.id.slice(0, 8)}...</span>
      </div>
      {user.email && (
        <div className="flex justify-between">
          <span className="text-gray-600">Email:</span>
          <span className="text-gray-900">{user.email}</span>
        </div>
      )}
      {user.ensName && (
        <div className="flex justify-between">
          <span className="text-gray-600">ENS:</span>
          <span className="text-gray-900">{user.ensName}</span>
        </div>
      )}
    </div>
  );
} 