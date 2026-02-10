const InfoSquare = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        id={InfoSquare.name}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M21.2502 12C21.2502 18.937 18.9372 21.25 12.0002 21.25C5.06324 21.25 2.75024 18.937 2.75024 12C2.75024 5.06303 5.06324 2.75003 12.0002 2.75003C18.9372 2.75003 21.2502 5.06303 21.2502 12Z" 
            stroke="currentColor"
            strokeWidth="1.5" 
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path 
            d="M12.0002 15.8951V12.0001" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
        <path 
            d="M12.0045 8.50012H11.9955" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </svg>
);    
  
export default InfoSquare;  