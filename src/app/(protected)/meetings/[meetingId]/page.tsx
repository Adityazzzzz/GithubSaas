import React from 'react'

type Props ={
    params: Promise<{meetingId:string}>
}

const MeetingDetailesPage = async ({params}:Props) => {
    const {meetingId} = await params
    return (
        {meetingId}
    )
}

export default MeetingDetailesPage