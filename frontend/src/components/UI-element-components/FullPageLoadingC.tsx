import React from 'react';

interface FullPageLoadingProps {
    minHeight?: string;
}

export default function FullPageLoadingC({ minHeight = "100vh" }: FullPageLoadingProps) {
    return (
        <div className={`flex items-center justify-center bg-gray-50`} style={{ minHeight }}>
            <style>
                {`
                    .loader {
                    width: 45px;
                    aspect-ratio: 1;
                    --c: no-repeat linear-gradient(#000 0 0);
                    background: 
                        var(--c) 0%   100%,
                        var(--c) 50%  100%,
                        var(--c) 100% 100%;
                    animation: l2 1s infinite linear;
                    }
                    @keyframes l2 {
                    0%  {background-size: 20% 100%,20% 100%,20% 100%}
                    20% {background-size: 20% 60% ,20% 100%,20% 100%}
                    40% {background-size: 20% 80% ,20% 60% ,20% 100%}
                    60% {background-size: 20% 100%,20% 80% ,20% 60% }
                    80% {background-size: 20% 100%,20% 100%,20% 80% }
                    100%{background-size: 20% 100%,20% 100%,20% 100%}
                    }
                `}
            </style>
            <div className="loader"></div>
        </div>
    );
} 