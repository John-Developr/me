import Image from "next/image";
import Link from "next/link";

import Setting from "@/components/icons/Setting";
import { me } from "@/config/personalConfig";

export default function RightPanel() {
    return (
        <section className="add-on">
            <div className="profile-detail">
                <div className="profile-pic">
                    <Image
                    src={me.profile}
                    width={50}
                    height={50}
                    alt="Avatar"/>
                </div>
                <div className="name-role">
                    <h3>Lorem Ipsum</h3>
                    <p>Admin / Creator</p>
                </div>
                <Link 
                    href="/admin/profile" 
                    className="icon">
                    <Setting
                        width={28}
                        height={28}/>
                </Link>
            </div>
        </section>
    );
}
