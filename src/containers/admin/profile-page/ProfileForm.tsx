'use client'

import React from "react";
import styles from "@/styles/admin/profile.module.css"
import HrHorizontal from "@/components/hr/HrHorizontal";
import EditSquare from "@/components/icons/EditSquare";

import { useApp } from "@/lib/context/AppContext";
import { userAction } from "@/action/user";

export default function ProfileForm() {
    const { user } = useApp()
    const { updateDetail } = userAction()

    return (
        <form className="form" onSubmit={updateDetail} >
            <section>
                <p>Full Name</p>
                <div className="form-groups">
                    <Input
                        id="fname"
                        label="First Name"
                        data={user?.fname} />

                    <Input
                        id="mname"
                        label="Middile Name"
                        data={user?.mname} />
                        
                    <Input
                        id="lname"
                        label="Last Name"
                        data={user?.lname} />
                </div>
            </section>
            <section>
                <p>Title</p>
                <Input
                    id="role"
                    label="Role"
                    data={user?.role} />
            </section>
            <section>
                <p>Address</p>
                <div className="form-groups">
                    <Input
                        id="city"
                        label="City"
                        data={user?.city} />
                        
                    <Input
                        id="province"
                        label="Province"
                        data={user?.province} />

                    <Input
                        id="country"
                        label="Country"
                        data={user?.country} />
                </div>
            </section>
            <section>
                <p>Contact</p>
                <Input
                    id="phoneno"
                    label="Phone Number"
                    data={user?.phoneno} />
            </section>
            <section>
                <p>About</p>
                <Textarea 
                    id="about" 
                    label="Tell them about your self" 
                    data={user?.about}/>
            </section>
            <HrHorizontal thickness={1} spacing={10} />
            <div className="form-action">
                <button className={styles["btn-update-profile"]}>
                    <EditSquare 
                        width={20} 
                        height={20} />
                    Update Profile
                </button>
            </div>
        </form>
    );
}

type TextareaProps = {
  id: string;
  label: string;
  data: string | null | undefined;
};

function Textarea({ id, label, data }: TextareaProps) {
  const [value, setValue] = React.useState(data);

  return (
    // <div className={styles["form-group"]}>
    //   <textarea
    //     id={id}
    //     name={id}
    //     className={`${styles["form-control"]} focus-animate`}
    //     value={value ?? ""}
    //     onChange={(e) => setValue(e.target.value)}
    //   />
    //   <label htmlFor={id}>{label}</label>
    // </div>
     <div className="form-group">
      <textarea
        id={id}
        name={id}
        className="form-control focus-animate"
        value={value ?? ""}
        onChange={(e) => setValue(e.target.value)}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

type InputProps = {
  id: string;
  label: string;
  data: string | null | undefined;
};

function Input({ id, label, data }: InputProps) {
  const [value, setValue] = React.useState(data);

  return (
    // <div className={styles["form-group"]}>
    //     <input
    //         type="text"
    //         name={id}
    //         id={id}
    //         value={value ?? ""}
    //         className={`${styles["form-control"]} focus-animate`}
    //         onChange={(e) => setValue(e.target.value)}
    //         placeholder="" />
    //     <label htmlFor={id}>{label}</label>
    // </div>
    <div className="form-group">
        <input
            type="text"
            name={id}
            id={id}
            value={value ?? ""}
            className="form-control focus-animate"
            onChange={(e) => setValue(e.target.value)}
            placeholder="" />
        <label htmlFor={id}>{label}</label>
    </div>
  );
}


// const Textarea = React.memo(function Textarea({
//   value,
//   onChange,
//   id,
//   label,
// }: {
//   value: string;
//   onChange: (v: string) => void;
//   id: string;
//   label: string;
// }) {
//   return (
//     <div className={styles["form-group"]}>
//       <textarea
//         id={id}
//         className={styles["form-control"]}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//       />
//       <label htmlFor={id}>{label}</label>
//     </div>
//   );
// });