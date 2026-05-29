'use client';

import { useEffect } from 'react';

export default function CoupangBanner() {
  const partnerId = process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID;
  const showBanner = partnerId && partnerId !== "나중에_입력" && partnerId.trim() !== "";

  useEffect(() => {
    if (showBanner) {
      const script = document.createElement('script');
      script.src = 'https://ads-partners.coupang.com/g.js';
      script.async = true;
      script.onload = () => {
        try {
          const container = document.getElementById('coupang-container');
          if (container) {
            container.innerHTML = '';
            new (window as any).Partners.api.DefaultBanner({
              id: partnerId,
              width: '100%',
              height: '140',
              containerId: 'coupang-container'
            });
          }
        } catch (err) {
          console.error('Coupang Partners Banner load error:', err);
        }
      };
      document.body.appendChild(script);

      return () => {
        script.remove();
      };
    }
  }, [showBanner, partnerId]);

  if (!showBanner) return null;

  return (
    <div className="w-full my-6 flex justify-center overflow-hidden bg-white/50 backdrop-blur rounded-2xl p-4 border border-orange-100/50 shadow-sm max-w-5xl mx-auto">
      <div id="coupang-container" className="w-full h-[140px]" />
    </div>
  );
}
