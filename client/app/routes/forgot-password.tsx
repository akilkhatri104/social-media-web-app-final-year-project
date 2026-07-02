import React from 'react';
import { ForgotPasswordForm } from '~/components/ForgotPasswordForm';
import type { Route } from './+types/verify-email'; // Reuse existing Route.MetaArgs type
import { useDocumentTitle } from '~/lib/title';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: 'Forgot Password' },
        { name: 'description', content: 'Reset your password' },
    ];
}

function ForgotPassword() {
    useDocumentTitle('Forgot Password');
    return (
        <div className='flex justify-center items-center min-h-screen py-2'>
            <ForgotPasswordForm />
        </div>
    );
}

export default ForgotPassword;
