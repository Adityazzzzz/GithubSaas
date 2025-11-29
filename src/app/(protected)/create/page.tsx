'use client'
import { useForm } from 'react-hook-form'
import Image from 'next/image' 
import github from '@/icon/undraw_developer-activity_4zqd.svg'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
type FormInput = {
    repoUrl: string
    projectName: string
    githubToken?: string
}

const CreatePage = () => {
    const { register, handleSubmit, reset } = useForm<FormInput>()
    const createProject = api.project.createProject.useMutation()

    function onSubmit(data:FormInput){
        // window.alert(JSON.stringify(data,null,2))
        createProject.mutate({
            githubUrl:data.repoUrl,
            name:data.projectName,
            githubToken:data.githubToken,
        },{
            onSuccess:()=>{
                toast.success('Project created successfully')
                reset()
            },
            onError:()=>{
                toast.error('Failed to create Project')
            }
        })
        return true
    }
    return (
        <div className='flex items-center gap-12 h-full justify-center'>
            <Image 
                src={github} 
                alt="GitHub Activity" 
                className='h-56 w-auto' 
            />
            <div>
                <div>
                    <h1 className='font-semibold text-2xl'>
                        Link your GitHub Repository
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Enter the URL of your repository to link it to GitBrain
                    </p>
                </div>
                <div className='h-4'></div>
                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input 
                            {...register('projectName',{required:true})}
                            placeholder='ProjectName'
                            required
                        />
                        <div className='h-2'></div>
                        <Input 
                            {...register('repoUrl',{required:true})}
                            placeholder='Github URL'
                            type='url'
                            required
                        />
                        <div className='h-2'></div>
                        <Input 
                            {...register('githubToken')}
                            placeholder='Github Token (Optional)'
                        />
                        <div className='h-4'></div>
                        <Button type='submit' disabled={createProject.isPending}>
                            Create Project
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreatePage