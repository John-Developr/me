const XMark = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        id={XMark.name}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="m4 4 8 8m-8 0 8-8" 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeWidth="1.5" 
        />
    </svg>
);    
  
export default XMark;  