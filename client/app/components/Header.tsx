import { ModeToggle } from './mode-toggle'
import LogoutButton from './LogoutButton'
import { Button } from './ui/button'
import { NavLink } from 'react-router'
import { useMe } from '~/hooks/useMe'
import { Logo } from './Logo'
import { Spinner } from './ui/spinner'

export default function Header() {
    const { isInitialLoading, isAuth } = useMe()

    return (
        <header className='flex justify-between p-3 bg-popover border-b'>
            <Logo />
            <div className='flex'>
                <div className='mr-3'>
                    {isInitialLoading ? <Spinner /> : (
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