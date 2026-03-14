import React from 'react'
import GuestRoute from '~/components/GuestRoute'
import { SignupForm } from '~/components/SignupForm'
import { useDocumentTitle } from '~/lib/title'

function signup() {
    useDocumentTitle("Sign Up");

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
