import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  inStock?: boolean;
}

export default function ImageCarousel({ images, alt, inStock }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative w-full h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-t-lg overflow-hidden flex items-center justify-center">
        <div className="text-center p-6">
          <Icon name="Package" size={64} className="text-primary/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{alt}</p>
        </div>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'ArrowLeft') {
        goToPreviousLightbox();
      } else if (e.key === 'ArrowRight') {
        goToNextLightbox();
      } else if (e.key === 'Escape') {
        setLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxIndex, images.length]);

  const goToNextLightbox = () => {
    setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToPreviousLightbox = () => {
    setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (images.length === 1) {
    return (
      <>
        <div className="relative w-full h-64 bg-gray-100 rounded-t-lg overflow-hidden cursor-pointer" onClick={() => openLightbox(0)}>
          <img 
            src={images[0]} 
            alt={alt} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        {imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <Icon name="ImageOff" size={48} className="text-muted-foreground/50" />
          </div>
        )}
          {inStock !== undefined && (
            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-10 ${
              inStock 
                ? 'bg-green-500 text-white' 
                : 'bg-orange-500 text-white'
            }`}>
              {inStock ? 'В наличии' : 'Под заказ'}
            </div>
          )}
        </div>
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
            <div className="relative w-full h-[95vh] flex items-center justify-center">
              <img 
                src={images[lightboxIndex]} 
                alt={`${alt} - увеличено`} 
                className="max-w-full max-h-full object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white"
              >
                <Icon name="X" size={24} />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <>
      <div className="relative w-full h-64 bg-gray-100 rounded-t-lg overflow-hidden group">
        <img 
          src={images[currentIndex]} 
          alt={`${alt} - ${currentIndex + 1}`} 
          className="w-full h-full object-cover transition-all duration-300 cursor-pointer hover:scale-105"
          onError={() => setImageError(true)}
          onClick={() => openLightbox(currentIndex)}
        />
      {imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
          <Icon name="ImageOff" size={48} className="text-muted-foreground/50" />
        </div>
      )}
      
        {inStock !== undefined && (
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-10 ${
            inStock 
              ? 'bg-green-500 text-white' 
              : 'bg-orange-500 text-white'
          }`}>
            {inStock ? 'В наличии' : 'Под заказ'}
          </div>
        )}

      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Icon name="ChevronLeft" size={24} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Icon name="ChevronRight" size={24} />
          </Button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/60 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>

          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
      </div>
      
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-[95vh] flex items-center justify-center">
            <img 
              src={images[lightboxIndex]} 
              alt={`${alt} - ${lightboxIndex + 1}`} 
              className="max-w-full max-h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPreviousLightbox}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-white/90 text-gray-900 h-16 w-16 rounded-full shadow-2xl transition-all hover:scale-110"
                >
                  <Icon name="ChevronLeft" size={40} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextLightbox}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-white/90 text-gray-900 h-16 w-16 rounded-full shadow-2xl transition-all hover:scale-110"
                >
                  <Icon name="ChevronRight" size={40} />
                </Button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-4 py-2 rounded">
                  {lightboxIndex + 1} / {images.length}
                </div>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white"
            >
              <Icon name="X" size={24} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}