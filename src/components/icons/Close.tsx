const Close = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        id={Close.name}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path 
            d="M7 7L17 17M7 17L17 7" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"/>
    </svg>
);
  
export default Close;  