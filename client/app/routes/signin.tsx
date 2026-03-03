import React from 'react'
import { SigninForm } from '~/components/SigninForm'
import type { Route } from './+types/signin';
import GuestRoute from '~/components/GuestRoute';


export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Signin" },
        { name: "description", content: "Signin to your account" },
    ];
}

function signup() {
    return (
        <div className='flex justify-center items-center'>
            <GuestRoute>
                <SigninForm />
            </GuestRoute>
        </div>
    )
}

export default signup