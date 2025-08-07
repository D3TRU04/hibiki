'use client';

import { X, MapPin, Search, Globe, Navigation } from 'lucide-react';
import { Post } from '@/lib/types';
import { useUploadModal } from '@/hooks/useUploadModal';
import UploadForm from './UploadForm';
import { useState, useEffect } from 'react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  onPostCreated: (post: Post) => void;
}

interface LocationInfo {
  city?: string;
  region?: string;
  country?: string;
  formattedAddress?: string;
}

export default function UploadModal({ 
  isOpen, 
  onClose, 
  lat, 
  lng, 
  onPostCreated 
}: UploadModalProps) {
  const {
    formData,
    isSubmitting,
    error,
    handleTextChange,
    handleFileChange,
    handleSubmit,
    handleClose,
  } = useUploadModal();

  const [locationInfo, setLocationInfo] = useState<LocationInfo>({});
  const [customLocation, setCustomLocation] = useState('');
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLocationInfo();
    }
  }, [isOpen, lat, lng, fetchLocationInfo]);

  const fetchLocationInfo = async () => {
    setLoadingLocation(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&types=place,region,country`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const context = feature.context || [];
        
        const location: LocationInfo = {
          city: context.find((c: { id: string }) => c.id.startsWith('place'))?.text,
          region: context.find((c: { id: string }) => c.id.startsWith('region'))?.text,
          country: context.find((c: { id: string }) => c.id.startsWith('country'))?.text,
          formattedAddress: feature.place_name
        };
        
        setLocationInfo(location);
      }
    } catch (error) {
      console.error('Error fetching location info:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e, lat, lng, onPostCreated);
  };

  const handleModalClose = () => {
    handleClose();
    onClose();
  };

  const getLocationDisplay = () => {
    if (useCustomLocation && customLocation) {
      return customLocation;
    }
    
    const parts = [];
    if (locationInfo.city) parts.push(locationInfo.city);
    if (locationInfo.region) parts.push(locationInfo.region);
    if (locationInfo.country) parts.push(locationInfo.country);
    
    return parts.length > 0 ? parts.join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gold to-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">K</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Share Your Story</h2>
            </div>
            
            {/* Location Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="w-4 h-4 text-gold" />
                <span className="text-sm font-medium text-gray-700">Location</span>
              </div>
              
              {loadingLocation ? (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading location info...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Auto-detected Location */}
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {getLocationDisplay()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  {/* Custom Location Toggle */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="customLocation"
                      checked={useCustomLocation}
                      onChange={(e) => setUseCustomLocation(e.target.checked)}
                      className="w-4 h-4 text-gold focus:ring-gold border-gray-300 rounded"
                    />
                    <label htmlFor="customLocation" className="text-sm text-gray-700">
                      Use custom location name
                    </label>
                  </div>

                  {/* Custom Location Input */}
                  {useCustomLocation && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        placeholder="Enter location name (e.g., Central Park, NYC)"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
                      />
                    </div>
                  )}

                  {/* Location Details */}
                  {locationInfo.formattedAddress && !useCustomLocation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Navigation className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div className="text-xs text-blue-700">
                          <p className="font-medium">Detected Location:</p>
                          <p>{locationInfo.formattedAddress}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <UploadForm
            formData={formData}
            isSubmitting={isSubmitting}
            error={error}
            onTextChange={handleTextChange}
            onFileChange={handleFileChange}
            onSubmit={handleFormSubmit}
            onCancel={handleModalClose}
            locationContext={getLocationDisplay()}
          />
        </div>
      </div>
    </div>
  );
} 