import Header from "@/components/header/Header";   
import Footer from "@/components/footer/Footer";
import PageIntro from "@/components/header/PageIntro";

export default function ContactPage() {
    return (
        <>
            <Header />
            <PageIntro 
                subtitle="Let's Work" 
                title="Together" 
                intro={`
                    Have a project in mind, a collaboration opportunity, or just want to say hello? 
                    I'm always open to discussing new ideas and meaningful work. 
                    Fill out the form below and I'll get back to you as soon as possible.`
                } />
                
            <Footer />
        </>
    );
}