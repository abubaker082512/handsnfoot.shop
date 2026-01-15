const Logo = ({ className = "h-8 w-auto", variant = "full" }) => {
    if (variant === "icon") {
        // Icon-only version for mobile/favicon
        return (
            <svg
                className={className}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                </defs>

                {/* Watch Circle */}
                <circle cx="50" cy="35" r="20" stroke="url(#logoGradient)" strokeWidth="3" fill="none" />

                {/* Watch Hands */}
                <line x1="50" y1="35" x2="50" y2="25" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" />
                <line x1="50" y1="35" x2="58" y2="35" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" />

                {/* Shoe Silhouette */}
                <path
                    d="M 30 70 Q 35 65 45 65 L 65 65 Q 70 65 70 70 L 68 75 Q 67 78 63 78 L 32 78 Q 28 78 28 74 Z"
                    fill="url(#logoGradient)"
                />

                {/* Connecting Element */}
                <line x1="50" y1="55" x2="50" y2="65" stroke="url(#logoGradient)" strokeWidth="2" strokeDasharray="2 2" />
            </svg>
        )
    }

    // Full logo with text
    return (
        <svg
            className={className}
            viewBox="0 0 200 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Gradient Definition */}
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
            </defs>

            {/* Icon Part */}
            <g transform="translate(5, 10)">
                {/* Watch Circle */}
                <circle cx="20" cy="15" r="10" stroke="url(#logoGradient)" strokeWidth="2" fill="none" />

                {/* Watch Hands */}
                <line x1="20" y1="15" x2="20" y2="10" stroke="url(#logoGradient)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="20" y1="15" x2="24" y2="15" stroke="url(#logoGradient)" strokeWidth="1.5" strokeLinecap="round" />

                {/* Shoe */}
                <path
                    d="M 12 35 Q 15 32 20 32 L 28 32 Q 30 32 30 35 L 29 38 Q 28.5 39.5 26 39.5 L 13 39.5 Q 11 39.5 11 37.5 Z"
                    fill="url(#logoGradient)"
                />

                {/* Connecting Line */}
                <line x1="20" y1="25" x2="20" y2="32" stroke="url(#logoGradient)" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
            </g>

            {/* Text */}
            <text
                x="50"
                y="38"
                fontFamily="'Outfit', sans-serif"
                fontSize="24"
                fontWeight="700"
                fill="url(#logoGradient)"
            >
                Hands
            </text>
            <text
                x="115"
                y="38"
                fontFamily="'Outfit', sans-serif"
                fontSize="20"
                fontWeight="400"
                fill="#764ba2"
            >
                n
            </text>
            <text
                x="130"
                y="38"
                fontFamily="'Outfit', sans-serif"
                fontSize="24"
                fontWeight="700"
                fill="url(#logoGradient)"
            >
                Foot
            </text>
        </svg>
    )
}

export default Logo
