import Image from "next/image";

import styles from "@/styles/admin/experience.module.css"
import Admin from "@/components/admin/Admin";
import ExperienceTable from "./ExperienceTable";


export default function ExperiencePage() {
    return (
        <Admin 
            pageTitle="List of Experience">
            <p>Create, update, and organize your data with ease. Add new entries, edit existing ones, or remove what you no longer need—all in one place. &#8628;</p>
            <br />
            <ExperienceTable />
        </Admin>
    );
}
