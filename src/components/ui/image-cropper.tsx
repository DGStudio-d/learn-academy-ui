import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Move, Crop } from 'lucide-react';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageCropperProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
  onCrop: (croppedImageBlob: Blob, cropArea: CropArea) => void;
  aspectRatio?: number; // width/height ratio, e.g., 1 for square
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 for JPEG quality
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
  className?: string;
}

interface Point {
  x: number;
  y: number;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  isOpen,
  onClose,
  onCrop,
  aspectRatio = 1, // Default to square
  minWidth = 100,
  minHeight = 100,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.9,
  outputFormat = 'image/jpeg',
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [dragMode, setDragMode] = useState<'image' | 'crop'>('image');

  // Load image when src changes
  useEffect(() => {
    if (src) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        // Reset transformations
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
        
        // Set initial crop area to center
        const size = Math.min(img.width, img.height, 200);
        setCropArea({
          x: (img.width - size) / 2,
          y: (img.height - size) / 2,
          width: size,
          height: aspectRatio ? size : size,
        });
      };
      img.src = src;
    }
  }, [src, aspectRatio]);

  // Draw image and crop overlay
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    // Set canvas size to container size
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Calculate image display size and position
    const containerAspect = canvas.width / canvas.height;
    const imageAspect = image.width / image.height;
    
    let displayWidth, displayHeight;
    if (imageAspect > containerAspect) {
      displayWidth = canvas.width * scale;
      displayHeight = (canvas.width / imageAspect) * scale;
    } else {
      displayWidth = (canvas.height * imageAspect) * scale;
      displayHeight = canvas.height * scale;
    }

    const centerX = canvas.width / 2 + position.x;
    const centerY = canvas.height / 2 + position.y;

    // Apply transformations
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-displayWidth / 2, -displayHeight / 2);

    // Draw image
    ctx.drawImage(image, 0, 0, displayWidth, displayHeight);

    // Restore context
    ctx.restore();

    // Draw crop overlay
    drawCropOverlay(ctx, canvas.width, canvas.height);
  }, [image, scale, rotation, position, cropArea]);

  const drawCropOverlay = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    // Draw dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Clear crop area
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    ctx.globalCompositeOperation = 'source-over';

    // Draw crop border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // Draw corner handles
    const handleSize = 8;
    const corners = [
      { x: cropArea.x, y: cropArea.y },
      { x: cropArea.x + cropArea.width, y: cropArea.y },
      { x: cropArea.x, y: cropArea.y + cropArea.height },
      { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height },
    ];

    ctx.fillStyle = '#ffffff';
    corners.forEach(corner => {
      ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
    });
  };

  // Redraw canvas when dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x, y });

    // Determine if clicking on crop area or image
    if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.width &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.height
    ) {
      setDragMode('crop');
    } else {
      setDragMode('image');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    if (dragMode === 'image') {
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
    } else if (dragMode === 'crop') {
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(prev.x + deltaX, rect.width - prev.width)),
        y: Math.max(0, Math.min(prev.y + deltaY, rect.height - prev.height)),
      }));
    }

    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (value: number[]) => {
    setScale(value[0]);
  };

  const handleRotate = (degrees: number) => {
    setRotation(prev => (prev + degrees) % 360);
  };

  const handleCrop = async () => {
    if (!image || !canvasRef.current) return;

    // Create a new canvas for cropping
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    // Calculate the actual crop area relative to the original image
    const canvas = canvasRef.current;
    const scaleX = image.width / (canvas.width * scale);
    const scaleY = image.height / (canvas.height * scale);

    const actualCropArea = {
      x: (cropArea.x - position.x) * scaleX,
      y: (cropArea.y - position.y) * scaleY,
      width: cropArea.width * scaleX,
      height: cropArea.height * scaleY,
    };

    // Set crop canvas size
    cropCanvas.width = Math.min(actualCropArea.width, maxWidth);
    cropCanvas.height = Math.min(actualCropArea.height, maxHeight);

    // Apply rotation if needed
    if (rotation !== 0) {
      cropCtx.translate(cropCanvas.width / 2, cropCanvas.height / 2);
      cropCtx.rotate((rotation * Math.PI) / 180);
      cropCtx.translate(-cropCanvas.width / 2, -cropCanvas.height / 2);
    }

    // Draw cropped image
    cropCtx.drawImage(
      image,
      actualCropArea.x,
      actualCropArea.y,
      actualCropArea.width,
      actualCropArea.height,
      0,
      0,
      cropCanvas.width,
      cropCanvas.height
    );

    // Convert to blob
    cropCanvas.toBlob(
      (blob) => {
        if (blob) {
          onCrop(blob, actualCropArea);
        }
      },
      outputFormat,
      quality
    );
  };

  const resetTransforms = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-4xl max-h-[90vh]', className)}>
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Canvas Container */}
          <div
            ref={containerRef}
            className="relative w-full h-96 border rounded-lg overflow-hidden bg-gray-100"
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Scale Control */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ZoomIn className="h-4 w-4" />
                Scale: {scale.toFixed(1)}x
              </Label>
              <Slider
                value={[scale]}
                onValueChange={handleScaleChange}
                min={0.1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Rotation Controls */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <RotateCw className="h-4 w-4" />
                Rotation: {rotation}°
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotate(-90)}
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRotate(90)}
                  className="flex-1"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Reset Button */}
            <div className="space-y-2">
              <Label>Actions</Label>
              <Button
                variant="outline"
                onClick={resetTransforms}
                className="w-full"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <Move className="h-4 w-4" />
              Drag outside crop area to move image
            </div>
            <div className="flex items-center gap-2">
              <Crop className="h-4 w-4" />
              Drag inside crop area to move selection
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCrop}>
            Crop Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;