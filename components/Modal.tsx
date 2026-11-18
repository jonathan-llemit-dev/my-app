"use client";

import { useState } from "react";

interface ModalProps {
    children: React.ReactNode;
}

export default function Modal({ children }: ModalProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <div>
            <button onClick={() => setIsOpen(true)} className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-fg hover:bg-primary-hover transition-colors">View Details</button>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="modal bg-primary rounded-lg shadow-lg max-w-md w-full p-6">
                        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white hover:bg-muted transition-colors">Close</button>
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}