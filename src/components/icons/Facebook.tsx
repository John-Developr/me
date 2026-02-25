const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        id={Facebook.name}
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path 
            d="M24.2188 12.1094C24.2188 5.41992 18.7988 0 12.1094 0C5.41992 0 0 5.41992 0 12.1094C0 18.1533 4.42822 23.1631 10.2173 24.0723V15.6099H7.14111V12.1094H10.2173V9.44141C10.2173 6.40674 12.0239 4.73047 14.791 4.73047C16.1162 4.73047 17.502 4.9668 17.502 4.9668V7.94531H15.9746C14.4707 7.94531 14.0015 8.87891 14.0015 9.83643V12.1094H17.3599L16.8228 15.6099H14.0015V24.0723C19.7905 23.1631 24.2188 18.1533 24.2188 12.1094Z" 
            fill="currentColor"
        />    
    </svg>
);    

const FacebookV2 = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        id={FacebookV2.name}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path 
            d="M16.2792 13.125L16.8496 9.86742H13.2831V7.75348C13.2831 6.86227 13.7813 5.99355 15.3786 5.99355H17V3.22008C17 3.22008 15.5286 3 14.1218 3C11.1847 3 9.26486 4.56023 9.26486 7.38469V9.86742H6V13.125H9.26486V21H13.2831V13.125H16.2792Z" 
            fill="currentColor"/>   
    </svg>
);
  
export {
    Facebook,
    FacebookV2
};  