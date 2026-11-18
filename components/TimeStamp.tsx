"use client";

import { useEffect, useState } from "react";

export default function TimeStamp() {
    const [time, setTime] = useState("");

    useEffect(() => {
        setTime(new Date().toLocaleTimeString());
    }, []);

    return <p>{time || "Loading time..."}</p>;
}