'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  Zap,
  BookOpen,
  Smile,
  Check,
  X,
  Trash2,
  AlertCircle,
  Camera,
  Layers,
  Heart,
} from 'lucide-react';
import {
  HIGH_QUALITY_SVG_AVATARS,
  EMOJI_AVATARS,
  ALL_AVATARS,
  isCustomUpload,
  isImageUrl,
} from '@/lib/avatars';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/Button';

interface AvatarPickerProps {
  selectedAvatar: string;
  onSelectAvatar: (avatarUrl: string) => void;
  userName?: string;
  className?: string;
  compact?: boolean;
}

type TabType = 'upload' | 'illustrated' | 'motivation' | 'stem' | 'mascots' | 'classic';

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selectedAvatar,
  onSelectAvatar,
  userName = 'Scholar',
  className = '',
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(
    isCustomUpload(selectedAvatar) ? 'upload' : 'illustrated'
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewCustom, setPreviewCustom] = useState<string | null>(
    isCustomUpload(selectedAvatar) ? selectedAvatar : null
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress & crop image to a crisp 400x400 square in canvas
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file (JPG, PNG, WEBP, GIF).'));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image is too large. Max allowed size is 5 MB.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const targetSize = 400;
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Failed to create canvas context'));
            return;
          }

          // Center crop calculation
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(
            img,
            startX,
            startY,
            minDim,
            minDim,
            0,
            0,
            targetSize,
            targetSize
          );

          try {
            const dataUrl = canvas.toDataURL('image/webp', 0.92);
            resolve(dataUrl);
          } catch {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            resolve(dataUrl);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      // 1. Process client-side for immediate responsive preview
      const optimizedDataUrl = await processImageFile(file);
      setPreviewCustom(optimizedDataUrl);

      // 2. Upload to server API endpoint
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const savedUrl = data.avatarUrl || optimizedDataUrl;
        setPreviewCustom(savedUrl);
        onSelectAvatar(savedUrl);
      } else {
        // Fallback to storing the optimized client-side data URL
        onSelectAvatar(optimizedDataUrl);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setUploadError(e.message || 'Failed to process image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveCustom = () => {
    setPreviewCustom(null);
    if (selectedAvatar === previewCustom || isCustomUpload(selectedAvatar)) {
      onSelectAvatar('/avatars/avatar-scholar-boy.svg');
    }
  };

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'upload', label: 'Upload Photo', icon: Upload },
    { id: 'illustrated', label: 'Personas', icon: Sparkles },
    { id: 'motivation', label: 'Power', icon: Zap },
    { id: 'stem', label: 'Academics', icon: BookOpen },
    { id: 'mascots', label: 'Mascots', icon: Heart },
    { id: 'classic', label: 'Emojis', icon: Smile },
  ];

  const getFilteredAvatars = (tab: TabType) => {
    if (tab === 'illustrated') return HIGH_QUALITY_SVG_AVATARS.filter((a) => a.category === 'illustrated');
    if (tab === 'motivation') {
      return ALL_AVATARS.filter((a) => a.category === 'motivation');
    }
    if (tab === 'stem') {
      return ALL_AVATARS.filter((a) => a.category === 'stem');
    }
    if (tab === 'mascots') {
      return ALL_AVATARS.filter((a) => a.category === 'mascots');
    }
    if (tab === 'classic') {
      return EMOJI_AVATARS.filter((a) => a.category === 'classic');
    }
    return [];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Avatar Header Banner */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-3xl bg-[#FAF4F0] dark:bg-[#212328] border border-[#EFE7E1] dark:border-[#2e313a]">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <UserAvatar
              avatarUrl={selectedAvatar}
              name={userName}
              size="lg"
              showBorder
            />
            {isCustomUpload(selectedAvatar) && (
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-coral-500 text-[9px] font-black text-white rounded-full shadow-xs">
                Custom
              </span>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-charcoal-900 dark:text-white">
              {isCustomUpload(selectedAvatar)
                ? 'Custom Profile Picture'
                : ALL_AVATARS.find((a) => a.value === selectedAvatar)?.label || 'Selected Avatar'}
            </p>
            <p className="text-[11px] text-charcoal-500 dark:text-gray-400">
              {isCustomUpload(selectedAvatar)
                ? 'Your custom uploaded photo is active'
                : 'Click any avatar or upload your own image'}
            </p>
          </div>
        </div>

        {isCustomUpload(selectedAvatar) && (
          <button
            type="button"
            onClick={handleRemoveCustom}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#F5EBE4] dark:border-[#2a2c34]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-coral-500 text-white shadow-coral-glow'
                  : 'text-charcoal-600 dark:text-gray-300 hover:bg-[#FAF4F0] dark:hover:bg-[#252832]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.id === 'upload' && isCustomUpload(selectedAvatar) && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab: Upload Custom Photo */}
      {activeTab === 'upload' && (
        <div className="space-y-4 pt-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {uploadError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-coral-500 bg-coral-50/50 dark:bg-coral-950/30 scale-[1.01]'
                : 'border-[#E8DDD4] dark:border-[#333538] hover:border-coral-400 dark:hover:border-coral-500 bg-[#FCFAF8] dark:bg-[#1e1f23]'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] dark:bg-coral-950/60 text-coral-500 flex items-center justify-center shadow-xs">
              <Camera className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs sm:text-sm font-bold text-charcoal-900 dark:text-white">
                {isUploading ? 'Compressing & Uploading...' : 'Click to Upload Custom Photo'}
              </p>
              <p className="text-[11px] text-charcoal-400 dark:text-gray-400 mt-0.5">
                PNG, JPG, WEBP or GIF (Auto-cropped to a crisp square, max 5MB)
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isUploading}
              className="text-xs pointer-events-none mt-1"
            >
              <Upload className="w-3.5 h-3.5 mr-1" />
              Choose Image File
            </Button>
          </div>

          {/* Active / Preview Photo Display */}
          {previewCustom && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#1a1b20] border border-[#EFE7E1] dark:border-[#2e313a]">
              <div className="flex items-center gap-3">
                <UserAvatar avatarUrl={previewCustom} name={userName} size="md" />
                <div>
                  <p className="text-xs font-bold text-charcoal-900 dark:text-white">
                    Custom Photo Preview
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Ready to save
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedAvatar !== previewCustom && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => onSelectAvatar(previewCustom)}
                    className="text-xs"
                  >
                    Select
                  </Button>
                )}
                <button
                  type="button"
                  onClick={handleRemoveCustom}
                  className="p-1.5 text-charcoal-400 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Avatar Grid Selection */}
      {activeTab !== 'upload' && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-64 overflow-y-auto pr-1">
          {getFilteredAvatars(activeTab).map((av) => {
            const isSelected = selectedAvatar === av.value;
            const isImg = isImageUrl(av.value);

            return (
              <button
                key={av.id}
                type="button"
                onClick={() => onSelectAvatar(av.value)}
                title={av.label + (av.description ? ` - ${av.description}` : '')}
                className={`relative group flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
                  isSelected
                    ? 'bg-[#FFF0EB] dark:bg-coral-950/80 border-2 border-coral-500 scale-105 shadow-coral-glow'
                    : 'bg-[#FAF4F0] dark:bg-[#252832] border border-[#EFE7E1] dark:border-[#2e313a] hover:border-coral-300 dark:hover:border-coral-700 hover:scale-105'
                }`}
              >
                <div className="w-11 h-11 flex items-center justify-center">
                  <UserAvatar avatarUrl={av.value} name={av.label} size="md" />
                </div>

                <span className="text-[10px] font-semibold text-charcoal-700 dark:text-gray-300 mt-1 max-w-[64px] truncate">
                  {av.label}
                </span>

                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-coral-500 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
