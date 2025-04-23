"use client";
import React from "react";

const Page = ({ params }) => {
    const { id } = React.use(params);
    return (
        <h1>{id}</h1>
    )
};

export default Page;