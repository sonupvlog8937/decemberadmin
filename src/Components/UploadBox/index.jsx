import React, { useContext, useState } from 'react';
import { FaRegImages } from "react-icons/fa6";
import { uploadImage, uploadImages } from '../../utils/api.js';
import { MyContext } from '../../App';
import CircularProgress from '@mui/material/CircularProgress';


const UploadBox = (props) => {
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    const context = useContext(MyContext);

    // Image compression function
    const compressImage = (file, maxSizeKB = 300) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Calculate new dimensions while maintaining aspect ratio
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 1920;
                    const MAX_HEIGHT = 1920;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Start with quality 0.8 and reduce until target size is met
                    let quality = 0.8;
                    const tryCompress = () => {
                        canvas.toBlob(
                            (blob) => {
                                if (!blob) {
                                    reject(new Error('Image compression failed'));
                                    return;
                                }

                                const sizeKB = blob.size / 1024;
                                console.log(`🖼️ Compressed size: ${sizeKB.toFixed(2)}KB at quality ${quality}`);

                                // If size is acceptable or quality is too low, use this version
                                if (sizeKB <= maxSizeKB || quality <= 0.3) {
                                    const compressedFile = new File([blob], file.name, {
                                        type: 'image/jpeg',
                                        lastModified: Date.now(),
                                    });
                                    console.log(`✅ Final compressed size: ${(compressedFile.size / 1024).toFixed(2)}KB`);
                                    resolve(compressedFile);
                                } else {
                                    // Reduce quality and try again
                                    quality -= 0.1;
                                    tryCompress();
                                }
                            },
                            'image/jpeg',
                            quality
                        );
                    };

                    tryCompress();
                };
                img.onerror = () => reject(new Error('Failed to load image'));
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
        });
    };

    const onChangeFile = async (e, apiEndPoint) => {

        try {
            setPreviews([]);
            const files = e.target.files;

            setUploading(true);

            const formdata = new FormData();

            for (var i = 0; i < files.length; i++) {

                if (files[i] && (files[i].type === "image/jpeg" || files[i].type === "image/jpg" ||
                    files[i].type === "image/png" ||
                    files[i].type === "image/webp" ||  files[i].type === "image/svg+xml")
                ) {

                    const file = files[i];
                    const originalSizeKB = (file.size / 1024).toFixed(2);
                    console.log(`📁 Original size: ${originalSizeKB}KB`);

                    // Compress image before uploading
                    try {
                        const compressedFile = await compressImage(file, 300); // Target 300KB max
                        formdata.append('images', compressedFile);
                        console.log(`✅ Image ${i + 1} compressed and added to upload`);
                    } catch (compressionError) {
                        console.error('❌ Compression failed, using original:', compressionError);
                        formdata.append('images', file); // Fallback to original if compression fails
                    }


                } else {
                    context.alertBox("error", "Please select a valid JPG , PNG or webp image file.");
                    setUploading(false);
                    return false;
                }
            }

            uploadImages(apiEndPoint, formdata).then((res) => {
                setUploading(false);
                props.setPreviewsFun(res?.data?.images);
                // Reset file input
                e.target.value = '';
            })

        } catch (error) {
            console.log(error);
            setUploading(false);
        }
    }


    return (
        <div className='uploadBox p-3 rounded-md overflow-hidden border border-dashed border-[rgba(0,0,0,0.3)] h-[150px] w-[100%] bg-gray-100 cursor-pointer hover:bg-gray-200 flex items-center justify-center flex-col relative'>

            {
                uploading === true ? <>
                <CircularProgress />
                <h4 className="text-center">Uploading...</h4>
                </> :
                    <>
                        <FaRegImages className='text-[40px] opacity-35 pointer-events-none' />
                        <h4 className='text-[14px] pointer-events-none'>Image Upload</h4>

                        <input type="file" accept='image/*' multiple={props.multiple !== undefined ? props.multiple : false} className='absolute top-0 left-0 w-full h-full z-50 opacity-0'
                            onChange={(e) =>
                                onChangeFile(e, props?.url)
                            }
                            name={props?.name}
                        />

                    </>

            }


        </div>
    )
}


export default UploadBox;