"use client";

import { useState } from "react";

interface ModalProps {
    children: React.ReactNode;
}

export default function Modal({ children }: ModalProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <div>
            <button onClick={() => setIsOpen(true)}>View Details</button>
            {isOpen && (
                <div className="modal">
                    <button onClick={() => setIsOpen(false)}>Close</button>
                    {children}
                </div>
            )}
        </div>
    );
}