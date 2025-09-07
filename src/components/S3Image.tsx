"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface S3ImageProps {
  s3Key: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
}

// Simple in-memory cache for signed URLs
const urlCache = new Map<string, { url: string; expiry: number }>();

// Cache URLs for 45 minutes (signed URLs are valid for 1 hour)
const CACHE_DURATION = 45 * 60 * 1000; // 45 minutes in milliseconds

export default function S3Image({ s3Key, alt, fill, className, sizes, width, height }: S3ImageProps) {
  const [signedUrl, setSignedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        // Check cache first
        const cached = urlCache.get(s3Key);
        const now = Date.now();

        if (cached && cached.expiry > now) {
          setSignedUrl(cached.url);
          setLoading(false);
          return;
        }

        // Fetch new signed URL
        const response = await fetch(`/api/signed-url?key=${encodeURIComponent(s3Key)}`);
        const data = await response.json();

        if (data.signedUrl) {
          setSignedUrl(data.signedUrl);

          // Cache the URL
          urlCache.set(s3Key, {
            url: data.signedUrl,
            expiry: now + CACHE_DURATION
          });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to get signed URL:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (s3Key) {
      fetchSignedUrl();
    }
  }, [s3Key]);

  if (loading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${fill ? 'absolute inset-0' : ''} ${className}`}>
        {!fill && (
          <div style={{ width, height }} className="flex items-center justify-center">
            <span className="text-gray-500">Loading...</span>
          </div>
        )}
      </div>
    );
  }

  if (error || !signedUrl) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${fill ? 'absolute inset-0' : ''} ${className}`}>
        {!fill && (
          <div style={{ width, height }} className="flex items-center justify-center">
            <span className="text-gray-500">Failed to load image</span>
          </div>
        )}
        {fill && <span className="text-gray-500">Failed to load image</span>}
      </div>
    );
  }

  const imageProps = {
    src: signedUrl,
    alt,
    className,
    ...(fill ? { fill: true } : { width, height }),
    ...(sizes ? { sizes } : {}),
  };

  return <Image {...imageProps} />;
}