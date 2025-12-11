'use client'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { Card } from '@/components/ui/card'
import { useDropzone } from 'react-dropzone'
import React from 'react'
import { Client, Storage, ID } from "appwrite" 
import { Presentation, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!); 

const storage = new Storage(client);

const MeetingCard = () => {
    const [isUploading, setIsUploading] = React.useState(false)
    const [progress, setProgress] = React.useState(0)

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'audio/*': ['.mp3', '.wav', '.m4a']
        },
        multiple: false,
        maxSize: 50_000_000,
        onDrop: async acceptedFiles => {
            setIsUploading(true)
            const file = acceptedFiles[0]

            if (!file) {
                setIsUploading(false)
                return
            }
            
            try {
                const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
                const promise = storage.createFile(
                    bucketId,
                    ID.unique(),
                    file,
                    [], 
                    (progress) => { 
                        console.log("Upload Progress:", progress.progress);
                        if (setProgress) {
                            setProgress(progress.progress); 
                        }
                    }
                );
                setProgress(50) 
                
                const response = await promise;
                const fileUrl = storage.getFileView(
                    bucketId,
                    response.$id
                );

                setProgress(100)
                window.alert("Upload Success! URL: " + fileUrl)
                console.log("File URL:", fileUrl)

            } catch (error: any) {
                console.error(error)
                window.alert("Error: " + error.message)
            } finally {
                setIsUploading(false)
                setProgress(0)
            }
        }
    })

    return (
        <Card className='col-span-1 flex flex-col items-center justify-center p-10' {...getRootProps()}>
            {!isUploading && (
                <>
                <Presentation className="h-10 w-10 animate-bounce" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    Create a new meeting
                </h3>
                <p className="mt-1 text-center text-sm text-gray-500">
                    Analyse your meeting with GitBrain.
                    <br />
                    Powered by AI.
                </p>
                <div className="mt-6">
                    <Button disabled={isUploading}>
                        <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        Upload Meeting
                        <input className="hidden" {...getInputProps()} />
                    </Button>
                </div>
                </>
            )}

            {isUploading && (
                <div className='flex flex-col items-center justify-center'>
                    <CircularProgressbar 
                        value={progress} 
                        text={`${progress}%`} 
                        className='size-20'
                        styles={buildStyles({
                            pathColor: `#2563eb`,
                            textColor: '#2563eb',
                        })}
                    />
                    <p className='text-sm text-gray-500 text-center mt-2'>Uploading to Appwrite...</p>
                </div>
            )}
        </Card>
    )
}
export default MeetingCard