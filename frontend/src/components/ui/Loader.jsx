"use client"

import Container from "../layout/Container"

export default function Loader() {
    return (
        <Container className="flex flex-col justify-center items-center h-screen">
            <span className="loader"></span>
        </Container>
    )
} 