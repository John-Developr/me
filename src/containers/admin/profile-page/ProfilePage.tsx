import Image from "next/image";

import styles from "@/styles/admin/profile.module.css"
import Admin from "@/components/admin/Admin";

import HrHorizontal from "@/components/hr/HrHorizontal";

import ProfileForm from "./ProfileForm";
import ProfileBackground from "./ProfileBackground";

export default function ProfilePage() {
    return (
        <Admin 
            pageTitle="Account Settings" 
            enableBack={true}>
            <p>Profile Photo and Background. &#8628;</p>
            <br />
            <ProfileBackground />
            <HrHorizontal thickness={1} spacing={35} />
            <div className={styles.info}>
                <h3>User Information</h3>
                <section className={styles["page-info"]}>
                    <p>Here you can edit public indormation about yourself.</p>
                    <p>The changes will be displayed for other users within 5 minutes.</p>
                </section>
                <ProfileForm />
            </div>
        </Admin>
    );
}
