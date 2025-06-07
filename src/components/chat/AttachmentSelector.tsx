
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Paperclip, 
  Camera, 
  Video, 
  Image, 
  File,
  X
} from 'lucide-react';
import { useNative } from '@/hooks/useNative';

interface AttachmentSelectorProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onRemoveFile: () => void;
}

export const AttachmentSelector = ({ 
  onFileSelect, 
  selectedFile, 
  onRemoveFile 
}: AttachmentSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { hapticFeedback } = useNative();
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      hapticFeedback('light');
    }
    setIsOpen(false);
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
    hapticFeedback('light');
  };

  const openVideo = () => {
    videoInputRef.current?.click();
    hapticFeedback('light');
  };

  const openGallery = () => {
    imageInputRef.current?.click();
    hapticFeedback('light');
  };

  const openFiles = () => {
    fileInputRef.current?.click();
    hapticFeedback('light');
  };

  if (selectedFile) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedFile.type.startsWith('image/') ? (
            <Image className="h-4 w-4 text-blue-500" />
          ) : selectedFile.type.startsWith('video/') ? (
            <Video className="h-4 w-4 text-purple-500" />
          ) : (
            <File className="h-4 w-4 text-gray-500" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onRemoveFile();
            hapticFeedback('light');
          }}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-11 w-11 p-0"
            title="Anexar arquivo"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={openCamera} className="cursor-pointer">
            <Camera className="h-4 w-4 mr-2" />
            Câmera
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openVideo} className="cursor-pointer">
            <Video className="h-4 w-4 mr-2" />
            Gravar vídeo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openGallery} className="cursor-pointer">
            <Image className="h-4 w-4 mr-2" />
            Galeria
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openFiles} className="cursor-pointer">
            <File className="h-4 w-4 mr-2" />
            Arquivo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
};
