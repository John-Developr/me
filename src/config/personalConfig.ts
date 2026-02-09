// import { supabase } from "@/utils/supabase";

interface Me {
    name: Name;
    role: string;
    location: string;
    about: string;
    profile: string;
    experience: Experience;
}

interface Name {
    first: string;
    last: string;
    mid: string;
}

interface Experience {
    contents: ExperienceItem[];
    filterSetAllDescriptionsToolsToNull(): ExperienceItem[];
}

type SubExperience = {
  title: string | null;
  date: string | null;
  tools: string;
  description: string[] | null;
};

export type ExperienceItem = {
  company: string;
  title: string | null;
  date: string | null;
  tools: string;
  image: string | null;
  description: string[] | null;
  withSub: SubExperience[];
};

export interface ExperiencesContainerProps {
  experiences: ExperienceItem[];
  callFrom: string;
}

export interface ExperienceContentProps {
  contents: ExperienceItem;
}

export const me: Me = {
    name: {
        first: `John Carlo`,
        last: `Ylanan`,
        mid: `Amistad`
    },
    role: `Web and Mobile Developer`,
    location: "Cebu City, Cebu, Philippines",

    about: `Hello there, I'm John Carlo, a 25-year-old web and mobile developer based in Cebu, Philippines. 
            I specialize in building scalable web, software, and mobile applications that work seamlessly across platforms. 
            With a strong foundation in JavaScript, PHP, and other modern technologies, I'm passionate about crafting solutions that are both efficient and impactful.
            (break)
            (break)
            When I'm not writing code, you'll find me watching movies, reading, playing video games, exploring new places, going for rides, traveling, or staying active through sports.`,
    
    profile: "/images/avatar.png",

    experience: {
        contents: [
            {
            company: "Forty Degrees Celcius, Inc.",
            title: null, // Title is null because roles are detailed in withSub
            date: "07 / 2023 - Present",
            tools: "",
            description: null, // Description is also null due to use of withSub
            image: "/images/company/fdci.png",
            withSub: [
                {
                    title: "iOS Developer",
                    date: "for 1 year until now",
                    tools: "Swift, SwiftUI, Objective-C, RESTful APIs, XCode, and more Swift libraries",
                    description: [
                        `As an iOS Developer, my role encompasses the end-to-end development lifecycle, from designing and testing applications on the iOS platform to collaborating closely with Planning and Design teams for specification delivery. 
                        I am dedicated to enhancing code quality by adhering to standards and best practices, with a focus on implementing UI/UX elements according to approved client designs. 
                        My responsibilities extend to ensuring the performance, quality, and responsiveness of applications, assessing the technical feasibility of features, and actively contributing to code maintenance. 
                        Additionally, I specialize in resolving memory leaks, fine-tuning performance, and seamlessly handling RESTful APIs to create robust and efficient iOS applications.`,
                    ],
                },
                {
                    title: "Web Developer",
                    date: "for 6 months",
                    tools: "HTML, CSS, Bootsrap, JavaScript, JQuery, Angular.js, Node.JS, Socket.io, PHP, CakekPHP, Memecached, Redis, MySQL, AWS, JAVA, Docker, VScode and more libraries",
                    description: [
                        "As a Web Developer for nativecamp.net, the number one online teaching platform in Japan, I oversee both backend and front-end development, ensuring the maintenance and scalability of our large web applications. My responsibilities include designing, documenting, and delivering APIs that seamlessly manage data between the server and users on Android and iOS devices.",
                    ],
                },
            ],
            },
            {
                company: "Proweaver, Inc.",
                title: "Full Stack Developer",
                date: "07 / 2021 - 07 / 2023",
                tools: "HTML, CSS, Bootsrap, JavaScript, JQuery, PHP, Codeigniter, Wordpress, Shopify, Vue.js, Quasar, MySQL, React Native, Prestashop, Cpanel, VSCode and more libraries",
                image: "/images/company/proweaver.png",
                description: [
                    `My position as Web Programmer is responsible for front-end, back-end, database planning, and creating scrum technique when building special projects, WordPress plugins, Company Tools. 
                    Also, I'm responsible on maintaining/fixing errors launched projects, Company Tools, Plugins, WordPress sites, Prestashop sites, and Shopify sites, as well as fixing Payments, Integration Payments (Paypal, Authorize, Square) considering myself as Full Stack Developer. 
                    Also, we are in charge of responding to client inquiries, concerns, and meetings with the client's agent in order to better understand their points of view.`
                ],
                withSub: [],
            },
            {
                company: "University of Cebu - Main",
                title: "BS Information Technology",
                date: "06 / 2015 - 12 / 2021",
                tools: "",
                image: "/images/company/UC.png",
                description: null,
                withSub: [],
            },
            {
                company: "Hello Wordl!",
                title: "Wrote my first line of code",
                date: "06 / 2015",
                tools: "",
                image: null,
                description: null,
                withSub: [],
            }
        ],

        // Returns a deep copy of the contents array with all descriptions and sub-descriptions set to null
        filterSetAllDescriptionsToolsToNull(this: Experience): ExperienceItem[] {
            return this.contents.map(exp => ({
                ...exp,
                tools: "",
                description: null,
                withSub: exp.withSub.map(sub => ({
                    ...sub,
                    tools: "",
                    description: null,
                })),
            }));
        },
    }
}

class user {

    public async checkExist() {
        console.error('Debug-Log: [Supabase][checkExist]... ');

        try {
            //  let server = await supabase.createServer() 
            //  const { data, error } = await server
            //     .from('user_detail')
            //     .from

        } catch (err) {
            console.error('Debug-Log: [Supabase][isAuthenticated][Failed]: ', err);
        }
    }
}


