'use client';

import React from "react";
import styles from "@/styles/general/component.module.css";
import Close from "@/components/icons/Close";
import { useApp } from "@/lib/context/AppContext";

export default function Modal() {
    const { showModal, setShowModal } = useApp();

    return (
        <div
            className={`${styles["modal-overlay"]} ${showModal ? styles["active-modal"] : ""}`}
            id="modal"
            onClick={() => setShowModal(false)}>
            <div 
                className={styles["modal"]}
                onClick={(e) => e.stopPropagation()}>
                <div className={styles["modal-container"]}>
                    <section className={styles["header-modal"]}>
                        <p className={styles["modal-title"]}>Add new experience</p>
                        <button
                            className={styles["modal-close-btn"]}
                            onClick={() => setShowModal(false)}>
                            <Close width={20} height={20} />
                        </button>
                    </section>
                    <section className={styles["main-content-modal"]}>
                        <form className="form">
                            <p className={styles["modal-form-info"]}>Share your latest experience! Fill in the details below to add it to your profile. Highlight your role, achievements, and any key skills you gained.  &#8628;</p>
                            <section>
                                <Input
                                    id="company"
                                    label="Company"
                                    data={""} />
                            </section>
                            <section>
                                <p>Address</p>
                                <div className="form-groups">
                                    <Input
                                        id="city"
                                        label="City"
                                        data={""} />
                                        
                                    <Input
                                        id="province"
                                        label="Province"
                                        data={""} />

                                    <Input
                                        id="country"
                                        label="Country"
                                        data={""} />
                                </div>
                            </section>
                        </form>
                    </section>
                    <section className={styles["footer-modal"]}>
                        <button>Cancel</button>
                        <button>Save Changes ⌘ ↵</button>
                    </section>
                </div>
            </div>
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
