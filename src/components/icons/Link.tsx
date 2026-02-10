const Link = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        id={Link.name}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path 
            d="M8 12H16" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"/>
        <path 
            d="M9 8H6C3.79086 8 2 9.79086 2 12C2 14.2091 3.79086 16 6 16H9" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"/>
        <path 
            d="M15 8H18C20.2091 8 22 9.79086 22 12C22 14.2091 20.2091 16 18 16H15" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"/>
    </svg>
);    
  
export default Link;  