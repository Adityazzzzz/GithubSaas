import { useQueryClient } from '@tanstack/react-query'
import React from 'react'

const useRefetch = () => {
    const queryClient = useQueryClient()
    return async(queryKey?: any[])=>{
        await queryClient.refetchQueries({
            queryKey,
            type:'active'
        })
    }
}

export default useRefetch