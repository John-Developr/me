const Message = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        id={Message.name}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path 
            d="M17.5448 9.01913C17.5448 9.01913 14.3348 12.8718 11.9869 12.8718C9.64004 12.8718 6.39392 9.01913 6.39392 9.01913" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
        <path 
            fillRule="evenodd"
            clipRule="evenodd" 
            d="M2.45203 11.9689C2.45203 5.13081 4.83298 2.85211 11.9758 2.85211C19.1187 2.85211 21.4996 5.13081 21.4996 11.9689C21.4996 18.806 19.1187 21.0857 11.9758 21.0857C4.83298 21.0857 2.45203 18.806 2.45203 11.9689Z" 
            stroke="currentColor" 
            strokeWidth="1.5"
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </svg>
);
  
export default Message;  