'use client';

import { useEffect } from 'react';

export default function AdBanner() {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const showAd = adsenseId && adsenseId !== "나중에_입력" && adsenseId.trim() !== "";

  useEffect(() => {
    if (showAd) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense initialization error:', err);
      }
    }
  }, [showAd]);

  if (!showAd) return null;

  return (
    <div className="w-full my-8 flex justify-center overflow-hidden bg-white/50 backdrop-blur rounded-2xl p-4 border border-orange-100/50 shadow-sm max-w-5xl mx-auto">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '250px', minHeight: '90px' }}
        data-ad-client={adsenseId}
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
