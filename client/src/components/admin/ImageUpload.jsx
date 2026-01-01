import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function ImageUpload({
    value,
    onChange,
    folder = 'general',
    type = 'image', // 'image' or 'avatar'
    className = '',
    placeholder = 'Click để upload ảnh'
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(value || null);
    const inputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Chỉ chấp nhận file ảnh');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Kích thước ảnh tối đa 5MB');
            return;
        }

        setError(null);
        setUploading(true);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        // Upload to server
        try {
            const formData = new FormData();
            formData.append('image', file);

            const endpoint = type === 'avatar' ? '/upload/avatar' : `/upload/image?folder=healthcare/${folder}`;
            const response = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const imageUrl = response.data.data.url;
                setPreview(imageUrl);
                onChange?.(imageUrl);
            } else {
                setError('Upload thất bại');
                setPreview(value);
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('Có lỗi khi upload ảnh');
            setPreview(value);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onChange?.(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleClick = () => {
        if (!uploading) {
            inputRef.current?.click();
        }
    };

    return (
        <div className={`relative ${className}`}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {preview ? (
                <div className="relative group">
                    <div className={`overflow-hidden bg-slate-700 ${type === 'avatar' ? 'w-24 h-24 rounded-full' : 'w-full h-40 rounded-xl'}`}>
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {!uploading && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                            <button
                                type="button"
                                onClick={handleClick}
                                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                            >
                                <Upload className="w-5 h-5 text-white" />
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="p-2 bg-red-500/80 rounded-lg hover:bg-red-500 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={uploading}
                    className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-600 hover:border-violet-500 bg-slate-700/30 transition-colors ${type === 'avatar' ? 'w-24 h-24 rounded-full' : 'w-full h-40 rounded-xl'}`}
                >
                    {uploading ? (
                        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                    ) : (
                        <>
                            <ImageIcon className="w-8 h-8 text-slate-400" />
                            <span className="text-sm text-slate-400 text-center px-2">{placeholder}</span>
                        </>
                    )}
                </button>
            )}

            {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
        </div>
    );
}
