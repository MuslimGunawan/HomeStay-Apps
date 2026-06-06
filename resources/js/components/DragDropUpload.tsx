import { useState, useRef } from 'react';
import { Upload, File, Image, Film, X } from 'lucide-react';

interface DragDropUploadProps {
    onChange: (file: File | null) => void;
    value: File | string | null;
    accept?: string;
    maxSizeMB?: number;
    className?: string;
    placeholderText?: string;
}

export default function DragDropUpload({
    onChange,
    value,
    accept = "image/*",
    maxSizeMB = 15,
    className = "",
    placeholderText = "Drag & drop file di sini, atau klik untuk memilih"
}: DragDropUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.size > maxSizeMB * 1024 * 1024) {
                alert(`Ukuran file terlalu besar! Maksimal ${maxSizeMB}MB.`);
                return;
            }
            onChange(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > maxSizeMB * 1024 * 1024) {
                alert(`Ukuran file terlalu besar! Maksimal ${maxSizeMB}MB.`);
                return;
            }
            onChange(file);
        }
    };

    const onButtonClick = () => {
        inputRef.current?.click();
    };

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
    };

    const isImage = (val: any) => {
        if (typeof val === 'string') {
            return val.match(/\.(jpeg|jpg|gif|png|webp)/i) != null;
        }
        return val instanceof File && val.type.startsWith('image/');
    };

    const isVideo = (val: any) => {
        if (typeof val === 'string') {
            return val.match(/\.(mp4|webm|ogg|mov)/i) != null;
        }
        return val instanceof File && val.type.startsWith('video/');
    };

    const getPreviewUrl = () => {
        if (!value) return null;
        if (typeof value === 'string') return value;
        return URL.createObjectURL(value);
    };

    const previewUrl = getPreviewUrl();

    return (
        <div 
            className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer select-none ${
                dragActive 
                    ? "border-gold bg-gold/10 scale-[1.01]" 
                    : "border-white/10 hover:border-gold/40 bg-black/45 hover:bg-black/60"
            } ${className}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
        >
            <input 
                ref={inputRef}
                type="file" 
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />

            {previewUrl ? (
                <div className="relative w-full flex flex-col items-center gap-3">
                    {isImage(value) ? (
                        <div className="relative aspect-video max-h-48 w-full rounded-xl overflow-hidden border border-white/10 bg-[#0f0f0f]">
                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                    ) : isVideo(value) ? (
                        <div className="relative aspect-video max-h-48 w-full rounded-xl overflow-hidden border border-white/10 bg-[#0f0f0f]">
                            <video src={previewUrl} className="h-full w-full object-cover" controls />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl w-full">
                            <File className="h-8 w-8 text-gold shrink-0" />
                            <div className="text-left overflow-hidden">
                                <span className="block text-xs font-bold text-white truncate">
                                    {value instanceof File ? value.name : 'Uploaded File'}
                                </span>
                                <span className="block text-[10px] text-white/40 font-bold uppercase">
                                    {value instanceof File ? `${(value.size / (1024 * 1024)).toFixed(2)} MB` : 'Remote URL'}
                                </span>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        type="button" 
                        onClick={clearFile}
                        className="absolute top-2 right-2 bg-black/80 hover:bg-rose-500 text-white rounded-full p-1.5 transition-all shadow-md active:scale-95 z-10"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                    
                    <span className="text-[10px] text-white/50 font-bold">
                        {value instanceof File ? value.name : 'File terpilih'} (Klik untuk mengganti)
                    </span>
                </div>
            ) : (
                <div className="flex flex-col items-center text-center space-y-3 pointer-events-none">
                    <div className="h-10 w-10 rounded-full bg-gold/10 text-gold flex items-center justify-center animate-pulse">
                        <Upload className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-white font-bold">{placeholderText}</p>
                        <p className="text-[10px] text-white/40">
                            Mendukung {accept.split(',').join(', ')} hingga {maxSizeMB}MB
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
