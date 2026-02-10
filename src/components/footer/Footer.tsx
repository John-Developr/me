// SVG
import Facebook from "../icons/Facebook";
import Instagram from "../icons/Instagram";
import Twitter from "../icons/Twitter";
import Linkedin from "../icons/Linkedin";
import Github from "../icons/Github";

export default function Footer() {
  return (
    <>
    <hr className="hr-horizontal" />
    <footer className="section">
        <p>© 2025 John Carlo. All rights reserved.</p>
        <section className="socials">
            <ul>
                <li>
                    <Facebook 
                        width={17.5}
                        height={17.5} />                                    
                </li>
                <li>
                    <Instagram 
                        width={17.5} 
                        height={17.5} />                                                                                
                </li>
                <li>
                    <Twitter 
                        width={17.5} 
                        height={17.5} />                                                                                                         
                </li>
                <li>
                    <Linkedin 
                        width={17.5} 
                        height={17.5} />                                                                     
                </li>
                <li>
                    <Github 
                        width={17.5} 
                        height={17.5} />                                                                     
                </li>
            </ul>
        </section>
    </footer>
    </>
  );
}
