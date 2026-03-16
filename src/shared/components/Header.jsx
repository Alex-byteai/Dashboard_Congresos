import React from 'react';
import { ChevronLeft } from 'lucide-react';

export default function Header({ moduleName, onBack }) {
    return (
        <div className="header">
            {onBack && (
                <button className="header-back-btn" onClick={onBack}>
                    <ChevronLeft size={18} />
                    Hub
                </button>
            )}
            <div className="header-content">
                <h1>{moduleName || 'Conferencias Científicas'}</h1>
            </div>
        </div>
    );
}
