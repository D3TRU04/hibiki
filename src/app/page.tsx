'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Map from '@/components/Map';
import RegionPanel from '@/components/RegionPanel';
import FilterBar from '@/components/FilterBar';
import { Region } from '@/types';

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
        <Header 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode}
        />
        
        <div className="flex flex-1 relative">
          <div className="flex-1 relative">
            <Map 
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
            />
            <FilterBar />
          </div>
          
          {selectedRegion && (
            <RegionPanel 
              region={selectedRegion}
              onClose={() => setSelectedRegion(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
