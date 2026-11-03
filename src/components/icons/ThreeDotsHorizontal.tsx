const ThreeDotsHorizontal = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        id={ThreeDotsHorizontal.name}
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <rect 
            x="12.01" 
            y="11.9991" 
            width="0.01" 
            height="0.01" 
            transform="rotate(90 12.01 11.9991)" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinejoin="round"/>
        <rect 
            x="19.01" 
            y="11.9991" 
            width="0.01" 
            height="0.01" 
            transform="rotate(90 19.01 11.9991)" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinejoin="round"/>
        <rect 
            x="5.01001" 
            y="11.9991" 
            width="0.01" 
            height="0.01" 
            transform="rotate(90 5.01001 11.9991)" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinejoin="round"/>
    </svg>
);    
  
export default ThreeDotsHorizontal;  