'use client';

import React from "react";
import styles from "@/styles/general/component.module.css";

import { useApp } from "@/lib/context/AppContext";
import { 
    FormInputsRow,
    FormInputsColumn,
    FormTextarea,
    FormSelect,
    FormInput,
    FormCheckBox
} from "@/components/input/Input";

import Work from "@/components/icons/Work";
import Plus from "@/components/icons/Plus";
import Close from "@/components/icons/Close";
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
                        <p className={styles["modal-title"]}>
                            <Work 
                                width={18} 
                                height={18} />
                            Add Experience
                        </p>
                        <button
                            className={styles["modal-close-btn"]}
                            onClick={() => setShowModal(false)}>
                            <Close width={20} height={20} />
                        </button>
                    </section>
                    <section className={styles["main-content-modal"]}>
                        <p className={styles["modal-form-info"]}>
                            Share your latest experience! Fill in the details below to add it to your profile. 
                            Highlight your role, achievements, and any key skills you gained.  &#8628;
                        </p>
                        <form className={styles["modal-form"]}>
                            <FormInputsRow>
                                <FormInput
                                    id="company"
                                    label="Company Name*"
                                    placeholder="Ex. ABC Corporation"
                                    data="" />
                            </FormInputsRow>
                            
                            <FormInputsRow>
                                <FormInput
                                    id="company"
                                    label="Title*"
                                    placeholder="Ex. Retail Sales Manager"
                                    data="" />
                            </FormInputsRow>
                            
                            <FormInputsRow>
                                <FormSelect
                                    label="Employment Type"
                                    name="employmentType"
                                    data={""}
                                    options={[
                                        { value: "full-time", label: "Full-time" },
                                        { value: "part-time", label: "Part-time" },
                                        { value: "self-employed", label: "Self-employed" },
                                        { value: "freelance", label: "Freelance" },
                                        { value: "contract", label: "Contract" },
                                        { value: "internship", label: "Internship" },
                                        { value: "apprenticeship", label: "Apprenticeship" },
                                        { value: "seasonal", label: "Seasonal" },
                                    ]}
                                    placeholder="Select Employment Type"
                                    className=""
                                    required />
                            </FormInputsRow>

                            <FormInputsRow>
                                <FormCheckBox
                                    id="currentlyWorking"
                                    label="I am currently working in this role"
                                    className={styles["focus-animate"]}
                                    checked={false}
                                    labelPosition="right" />
                            </FormInputsRow>

                            <FormInputsRow>
                                <FormInput
                                    id="startDate"
                                    type="date"
                                    label="Start Date"
                                    placeholder="Select Start Date"
                                    data="" />
                            </FormInputsRow>

                            <FormInputsRow>
                                <FormInput
                                    id="endDate"
                                    type="date"
                                    label="End Date"
                                    placeholder="Select End Date"
                                    data="" />
                            </FormInputsRow>

                            <FormInputsRow>
                                <FormInput
                                    id="location"
                                    label="Location"
                                    placeholder="Ex. New York, NY"
                                    data="" />
                            </FormInputsRow>

                            <FormTextarea
                                id="description"
                                label="Description"
                                data=""
                                placeholder="Describe your role, responsibilities, and achievements in this position. Highlight key projects, skills utilized, and any notable accomplishments during your tenure."
                                required />
                        </form>
                    </section>
                    <section className={styles["modal-footer"]}>
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
    // <div className="form-group">
    //     <input
    //         type="text"
    //         name={id}
    //         id={id}
    //         value={value ?? ""}
    //         className="form-control focus-animate"
    //         onChange={(e) => setValue(e.target.value)}
    //         placeholder="" />
    //     <label htmlFor={id}>{label}</label>
    // </div>
     <section className={styles["modal-form-row"]}>
        <div className={styles["modal-form-group"]}>
            <label htmlFor="">Description</label>
            <textarea 
                className="modal-form-control" 
                placeholder="Describe your role, responsibilities, and achievements in this position. Highlight key projects, skills utilized, and any notable accomplishments during your tenure." />
        </div>
    </section>
  );
}