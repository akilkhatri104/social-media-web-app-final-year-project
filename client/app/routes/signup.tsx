import React from 'react'
import GuestRoute from '~/components/GuestRoute'
import { SignupForm } from '~/components/SignupForm'

function signup() {
    return (
        <div>
            <div className='flex justify-center items-center'>
                <GuestRoute>
                    <SignupForm />
                </GuestRoute>
            </div>
        </div>
    )
}

export default signup