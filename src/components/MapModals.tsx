'use client';

import SubmissionForm from '@/components/SubmissionForm';
import DynamicAuthModal from '@/components/DynamicAuthModal';
import NFTMintingNotification from '@/components/NFTMintingNotification';
import { KleoPost, Wallet } from '@/lib/types';

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
      {/* Submission Form Modal */}
      {selectedLocation && (
        <SubmissionForm
          isOpen={isSubmissionFormOpen}
          onClose={onCloseSubmissionForm}
          lat={selectedLocation.lat}
          lng={selectedLocation.lng}
          onPostCreated={onPostCreated}
          wallet={wallet}
        />
      )}

      {/* Dynamic Auth Modal */}
      <DynamicAuthModal 
        isOpen={showAuthModal}
        onClose={onCloseAuthModal}
      />

      {/* NFT Minting Notification */}
      <NFTMintingNotification
        isVisible={showNFTNotification}
        onClose={onCloseNFTNotification}
        tokenId={nftMintingData?.tokenId}
        transactionHash={nftMintingData?.transactionHash}
        postCid={nftMintingData?.postCid}
      />
    </>
  );
} 