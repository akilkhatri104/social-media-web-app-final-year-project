import React from 'react'
import { ModeToggle } from './mode-toggle'

type Props = {}

export default function Header({ }: Props) {
    return (
        <nav>
            <ModeToggle />
        </nav>
    )
}