"use client"

import Container from "../layout/Container"

export default function Loader() {
    return (
        <Container className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
            <span className="loader"></span>
        </Container>
    )
} 