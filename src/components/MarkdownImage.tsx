'use client';

import React from 'react';

interface MarkdownImageProps {
  src?: string;
  alt?: string;
  className?: string;
  [key: string]: any;
}

export default function MarkdownImage({ src, alt, className, ...props }: MarkdownImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || 'Blog Image'}
      className={className || "rounded-2xl w-full max-h-[450px] object-cover my-6 shadow-sm"}
      {...props}
      onError={(e) => {
        // 이미지 로딩 실패 시 표시할 자체 포함형 SVG 플레이스홀더
        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='100%25' height='100%25' fill='%23fee2e2'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-weight='bold' font-size='20' fill='%23f87171'%3EImage Temporary Unavailable%3C/text%3E%3C/svg%3E";
        e.currentTarget.onerror = null; // 무한 루프 방지
      }}
    />
  );
}
