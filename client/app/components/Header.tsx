import React from 'react'
import { ModeToggle } from './mode-toggle'
import LogoutButton from './LogoutButton'
import { Button } from './ui/button'
import { NavLink } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '~/lib/axios'
import type { APIResponse } from '~/lib/types'
import { useMe } from '~/hooks/useMe'
import { Logo } from './Logo'

type Props = {}

export default function Header({ }: Props) {
    const { data, isError, isPending } = useMe()

    let isAuth = !!data && !isError

    return (
        <header className='flex justify-between p-3 bg-popover border-b'>
            <Logo />
            <div className='flex'>
                <div className='mr-3'>
                    {isPending ? "Loading..." : (
                        <>
                            {isAuth ? <LogoutButton /> : (
                                <>
                                    <Button asChild><NavLink className='cursor-auto mr-3' to='/signin'>Signin</NavLink></Button>
                                    <Button asChild><NavLink className='cursor-auto' to='/signup'>Signup</NavLink></Button>
                                </>
                            )}


                        </>
                    )}
                </div>

                <ModeToggle />

            </div>
        </header>
    )
}