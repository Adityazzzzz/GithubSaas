'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useProject from '@/hooks/use-project'
import { DialogTitle } from '@radix-ui/react-dialog'
import Image from 'next/image'
import React from 'react'

const AskQuestionCard = () => {
  const {project,projectId} = useProject()
  const [open,setOpen] = React.useState(false)
  const [question,setQuestion] = React.useState('')

  const onSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault()
    window.alert(question)
  }

  return <>
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
            <DialogTitle>
                {/* <Image src={} alt='' height={40} width={40}/> */}

            </DialogTitle>
        </DialogHeader>
        <DialogContent>

        </DialogContent>
    </Dialog>
    <Card className='relative col-span-3'>
        <CardHeader>
            <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={onSubmit}>
                <Textarea placeholder='Which file should I edit to change the home page?'/>
                <div className='h-4'>

                </div>
                <Button type='submit'>
                    Ask GitBrain!
                </Button>
            </form>
        </CardContent>
    </Card>
  </>
}

export default AskQuestionCard