"use client"
import { useUser } from '@clerk/nextjs'
import React from 'react'

const DashboardPage = () => {
    const {user} = useUser()
    return (<>
        <div>{user?.firstName}</div>
        <div>{user?.lastName}</div>
    </>)
}

export default DashboardPage