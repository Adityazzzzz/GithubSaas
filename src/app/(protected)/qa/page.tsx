'use client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'
import AskQuestionCard from '../dashboard/ask-question-card'
import MDEditor from '@uiw/react-md-editor'
import CodeReferences from '../dashboard/code-reference'
import { NoProjectPlaceholder } from '@/components/no-project-placeholder'

const QAPage = () => {
    const { projectId } = useProject()
    const { data: projects } = api.project.getProjects.useQuery()
    const isProjectActive = projects?.find(p => p.id === projectId);
    if (!projectId || (projects && !isProjectActive)) {
      return <NoProjectPlaceholder />
    }
    const { data: questions } = api.project.getQuestions.useQuery(
      { projectId }, 
      { enabled: !!projectId }
    )

    const [questionIndex, setQuestionIndex] = React.useState(0)
    const question = questions?.[questionIndex]

    return (
        <Sheet>
            <AskQuestionCard />
            <div className="h-4"></div>
            <h1 className='text-xl font-semibold dark:text-white'>Saved Questions</h1>
            <div className="h-2"></div>
            <div className="flex flex-col gap-2">
                {questions?.map((question, index) => {
                    return <React.Fragment key={question.id}>
                      <SheetTrigger onClick={()=>setQuestionIndex(index)}>
                          <div className='flex items-center gap-4 bg-white dark:bg-gray-900 rounded-lg p-4 shadow border dark:border-gray-700'>
                            <img className='rounded-full' height={30} width={30} src={question.user.imageUrl ?? ""}/>

                            <div className='text-left flex flex-col'>
                              <div className='flex items-center gap-3'> 
                                <p className='text-gray-700 dark:text-gray-100 line-clamp-1 text-lg font-medium'>
                                  {question.question}
                                </p>
                                <span className='text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap'>
                                  {question.createdAt.toLocaleDateString()}
                                </span>
                              </div>

                              <p className='text-gray-500 dark:text-gray-400 line-clamp-1 text-sm'> 
                                {question.answer}
                              </p>
                            </div>
                          </div>
                      </SheetTrigger>
                    </React.Fragment>
                })}
            </div>

            {question && (
                <SheetContent className='sm:max-w-[80vw]'>
                    <SheetHeader>
                        <SheetTitle>
                            {question.question}
                        </SheetTitle>
                        <MDEditor.Markdown source={question.answer} />
                        <CodeReferences filesReferences={(question.filesReferences ?? []) as any} />
                    </SheetHeader>
                </SheetContent>
            )}

        </Sheet>
    )
}

export default QAPage