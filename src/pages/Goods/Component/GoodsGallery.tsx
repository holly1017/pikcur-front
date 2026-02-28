import { useState, useCallback } from 'react';

interface GoodsGalleryProps {
  images: string[];
}

const API_BASE_URL = process.env.REACT_APP_API_URL;

const THUMB_SIZE = 88;
const MAX_VISIBLE = 5;

export default function GoodsGallery({ images }: GoodsGalleryProps) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const [startIndex, setStartIndex] = useState(0);
  const [imgMeta, setImgMeta] = useState<{ w: number; h: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const visibleCount = Math.min(MAX_VISIBLE, safeImages.length);
  const endIndex = Math.min(startIndex + visibleCount, safeImages.length);

  const canPrev = startIndex > 0;
  const canNext = endIndex < safeImages.length;

  const handlePrev = useCallback(() => {
    if (!canPrev) return;
    setStartIndex(s => Math.max(s - 1, 0));
    setImgMeta(null);
  }, [canPrev]);

  const handleNext = useCallback(() => {
    if (!canNext) return;
    setStartIndex(s => Math.min(s + 1, safeImages.length - visibleCount));
    setImgMeta(null);
  }, [canNext, safeImages.length, visibleCount]);

  if (safeImages.length === 0) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #E0E0E0',
        borderRadius: 12,
        background: '#FAFAFA',
        fontSize: 14,
        color: '#666'
      }}>이미지 없음</div>
    );
  }

  const mainSrc = safeImages[activeIndex];
  const isPortrait = imgMeta ? imgMeta.h > imgMeta.w : false;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      gap: 16,
      minHeight: 0,
      overflow: 'hidden'
    }}>
      {/* 썸네일 영역 */}
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        overflow: 'hidden'
      }}>
        <button
          onClick={handlePrev}
          disabled={!canPrev}
          style={{
            width: THUMB_SIZE,
            height: 26,
            border: '1px solid #D9D9D9',
            borderRadius: 6,
            background: canPrev ? '#fff' : '#F5F5F5',
            cursor: canPrev ? 'pointer' : 'default',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
          aria-label="이전"
        >▲</button>

        <div style={{
          width: THUMB_SIZE,
          display: 'flex',
          flexDirection: 'column',
          gap: 5
        }}>
          {safeImages.slice(startIndex, endIndex).map((src, i) => {
            const realIndex = startIndex + i;
            const isActive = realIndex === activeIndex;
            return (
              <button
                key={realIndex}
                onClick={() => {
                  setActiveIndex(realIndex);
                  setImgMeta(null);
                }}
                style={{
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  padding: 0,
                  border: isActive ? '2px solid #2563EB' : '1px solid #E0E0E0',
                  borderRadius: 8,
                  background: '#fff',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  boxSizing: 'border-box'
                }}
                aria-label={`이미지 ${realIndex + 1}`}
              >
                <img
                  src={src}
                  alt={`thumb-${realIndex + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.visibility = 'hidden';
                  }}
                />
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    boxShadow: 'inset 0 0 0 2px #2563EB',
                    borderRadius: 8
                  }} />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={!canNext}
          style={{
            width: THUMB_SIZE,
            height: 26,
            border: '1px solid #D9D9D9',
            borderRadius: 6,
            background: canNext ? '#fff' : '#F5F5F5',
            cursor: canNext ? 'pointer' : 'default',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
          aria-label="다음"
        >▼</button>
      </div>

      {/* 메인 이미지 */}
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <img
          src={mainSrc}
          alt="main"
          style={{
            width: isPortrait ? 'auto' : '100%',
            height: isPortrait ? '100%' : 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            display: 'block'
          }}
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            setImgMeta({ w: img.naturalWidth, h: img.naturalHeight });
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    </div>
  );
}