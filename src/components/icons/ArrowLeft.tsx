import React from "react";

interface ArrowLeftProps extends React.SVGProps<SVGSVGElement> {
  v?: number;
}

const ArrowLeft: React.FC<ArrowLeftProps> = ({ v = 1, ...props }) => (
    <svg
        id={`arrow-left-v${v}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}>
        <Paths iconVersion={v} />
    </svg>
);

const Paths = ({ iconVersion }: { iconVersion: number }) => {
    switch (iconVersion) {
        case 2:
            return (
                <>
                    <path 
                        d="M5 12H19" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/>
                    <path 
                        d="M12 5L5 12L12 19" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/>
                </>
            );

        default:
            return (
                <path 
                    d="M15.5 19.0001C15.5 19.0001 8.5 14.8561 8.5 12.0001C8.5 9.14512 15.5 5.00012 15.5 5.00012" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"/>
            );
    }
};

export default ArrowLeft;