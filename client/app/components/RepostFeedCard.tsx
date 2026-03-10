import React from 'react'
import type { FeedItem } from '~/lib/types'
import PostCard from './PostCard'
import { Link } from 'react-router'
import { Repeat } from 'lucide-react'

type Props = {
    repost: FeedItem
}

function RepostFeedCard({ repost }: Props) {
    if (repost.itemType == 'post')
        return null
    return (
        <div>
            <div className='flex items-center mx-2 p-2 bg-card/20 text-muted-foreground'>
                <Repeat size={18} className='mr-2' /> <Link to={`/@${repost.repostedBy?.displayUsername}`} className='hover:underline'>@{repost.repostedBy?.displayUsername} reposted</Link>
            </div>
            <PostCard post={repost.originalPost} />
        </div>
    )
}

export default RepostFeedCard