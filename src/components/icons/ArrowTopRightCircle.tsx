const ArrowTopRightCircle = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        id={ArrowTopRightCircle.name}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <circle 
            cx="12" 
            cy="12" 
            r="9" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
        <path 
            d="M14 14L14 10L10 10" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </svg>
);

export default ArrowTopRightCircle;  