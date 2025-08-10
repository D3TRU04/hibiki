'use client';

import dynamic from 'next/dynamic';
import { KleoPost, Wallet } from '@/lib/types';

const SubmissionForm = dynamic(() => import('./SubmissionForm'), { ssr: false });
const DynamicAuthModal = dynamic(() => import('@/components/DynamicAuthModal'), { ssr: false });
const NFTMintingNotification = dynamic(() => import('./NFTMintingNotification'), { ssr: false });

interface MapModalsProps {
  isSubmissionFormOpen: boolean;
  selectedLocation: { lat: number; lng: number } | null;
  showAuthModal: boolean;
  showNFTNotification: boolean;
  nftMintingData: {
    tokenId?: string;
    transactionHash?: string;
    postCid?: string;
  } | null;
  wallet: Wallet | null;
  onCloseSubmissionForm: () => void;
  onCloseAuthModal: () => void;
  onCloseNFTNotification: () => void;
  onPostCreated: (post: KleoPost) => void;
}

export default function MapModals({
  isSubmissionFormOpen,
  selectedLocation,
  showAuthModal,
  showNFTNotification,
  nftMintingData,
  wallet,
  onCloseSubmissionForm,
  onCloseAuthModal,
  onCloseNFTNotification,
  onPostCreated
}: MapModalsProps) {
  return (
    <>
      {isSubmissionFormOpen && (
        <SubmissionForm
          isOpen={isSubmissionFormOpen}
          onClose={onCloseSubmissionForm}
          lat={selectedLocation?.lat}
          lng={selectedLocation?.lng}
          onPostCreated={onPostCreated}
          wallet={wallet}
        />
      )}

      {showAuthModal ? (
        <DynamicAuthModal 
          isOpen={showAuthModal}
          onClose={onCloseAuthModal}
        />
      ) : null}

      {showNFTNotification ? (
        <NFTMintingNotification
          isVisible={showNFTNotification}
          onClose={onCloseNFTNotification}
          tokenId={nftMintingData?.tokenId}
          transactionHash={nftMintingData?.transactionHash}
          postCid={nftMintingData?.postCid}
        />
      ) : null}
    </>
  );
} 