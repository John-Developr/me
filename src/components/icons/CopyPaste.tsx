const CopyPaste = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        id={CopyPaste.name}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path 
            d="M16 3H4V16" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
        <path 
            d="M8 7H20V19C20 20.1046 19.1046 21 18 21H10C8.89543 21 8 20.1046 8 19V7Z" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </svg>
);
  
export default CopyPaste;  