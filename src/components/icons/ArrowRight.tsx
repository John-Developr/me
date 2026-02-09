const ArrowRight = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        id={ArrowRight.name}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M19.75 11.7258L4.75 11.7258"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round" />
        <path
            d="M13.6997 5.70134C13.6997 5.70134 19.7497 8.96234 19.7497 11.7243C19.7497 14.4883 13.6997 17.7503 13.6997 17.7503"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round" />
    </svg>
);

const ArrowRightV2 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props} 
    >
        <path 
            d="M19 12L5 12" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"/>

        <path 
            d="M12 19L19 12L12 5" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"/>
     </svg>
);
  
export { ArrowRight, ArrowRightV2 };  