import React from 'react'
import { SigninForm } from '~/components/SigninForm'
import type { Route } from './+types/signin';
import GuestRoute from '~/components/GuestRoute';
import { useDocumentTitle } from '~/lib/title';


export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Signin" },
        { name: "description", content: "Signin to your account" },
    ];
}

function signin() {
    useDocumentTitle("Sign In");

    return (
        <div className='flex justify-center items-center'>
            <SigninForm />
        </div>
    )
}

export default signin
