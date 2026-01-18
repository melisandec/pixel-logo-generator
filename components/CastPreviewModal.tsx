'use client';

import NextImage from 'next/image';

interface CastPreviewModalProps {
  previewImage: string;
  castText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isCasting: boolean;
}

export default function CastPreviewModal({
  previewImage,
  castText,
  onConfirm,
  onCancel,
  isCasting,
}: CastPreviewModalProps) {
  return (
    <div
      className="cast-preview-modal-overlay"
      onClick={onCancel}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
    >
      <div
        className="cast-preview-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#000000',
          border: '4px solid #00ff00',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 0 30px rgba(0, 255, 0, 0.5)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-press-start), monospace',
            fontSize: '16px',
            color: '#00ff00',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          CAST PREVIEW
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <NextImage
            src={previewImage}
            alt="Cast preview"
            width={512}
            height={512}
            unoptimized
            style={{
              width: '100%',
              height: 'auto',
              border: '2px solid #00ff00',
              imageRendering: 'pixelated',
            }}
          />
        </div>

        <div
          style={{
            background: '#111111',
            border: '2px solid #00ff00',
            padding: '15px',
            marginBottom: '20px',
            fontFamily: "'Courier New', monospace",
            fontSize: '12px',
            color: '#00ff00',
            whiteSpace: 'pre-wrap',
            maxHeight: '150px',
            overflow: 'auto',
          }}
        >
          <strong>Cast Text:</strong>
          <br />
          {castText}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={onCancel}
            disabled={isCasting}
            style={{
              padding: '12px 24px',
              background: '#333333',
              border: '2px solid #00ff00',
              color: '#00ff00',
              fontFamily: "'Courier New', monospace",
              fontSize: '12px',
              cursor: isCasting ? 'not-allowed' : 'pointer',
              opacity: isCasting ? 0.5 : 1,
              textTransform: 'uppercase',
            }}
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            disabled={isCasting}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(180deg, #8338EC 0%, #3A86FF 100%)',
              border: '2px solid #8338EC',
              color: '#ffffff',
              fontFamily: "'Courier New', monospace",
              fontSize: '12px',
              cursor: isCasting ? 'not-allowed' : 'pointer',
              opacity: isCasting ? 0.5 : 1,
              textTransform: 'uppercase',
              boxShadow: '0 0 15px rgba(131, 56, 236, 0.5)',
            }}
          >
            {isCasting ? 'CASTING...' : 'CONFIRM CAST'}
          </button>
        </div>
      </div>
    </div>
  );
}
