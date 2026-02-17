'use client';

import React from "react";
import styles from "@/styles/general/component.module.css";

interface FormInputsRowProps
    extends React.HTMLAttributes<HTMLElement> {
    className?: string;
    gap?: number | string;
    children: React.ReactNode;
}

export const FormInputsRow: React.FC<FormInputsRowProps> = ({
    className = "",
    children,
    ...rest
}) => {
    return (
        <section 
            className={`${styles["input-form-row"]} ${className}`} 
            {...rest}
        >
            {children}
        </section>
    );
};

export const FormInputsColumn: React.FC<FormInputsRowProps> = ({
    className = "",
    children,
    gap,
    ...rest
}) => {
    return (
        <section 
            className={`${styles["input-form-column"]} ${className}`} 
            style={{ gap: gap }}
            {...rest}
        >
            {children}
        </section>
    );
};

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  data?: string;
  className?: string;
  placeholder?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
    id,
    label,
    data = "",
    className = "",
    placeholder = "",
    ...rest
}) => {
    const [value, setValue] = React.useState<string>(data);

    return (
        <div className={`${styles["input-form-group"]} ${className}`}>
            <label htmlFor={id}>{label}</label>
            <textarea
                id={id}
                value={value}
                placeholder={placeholder}
                onChange={(e) => setValue(e.target.value)}
                className={styles["input-form-control"]}
                {...rest}
            />
        </div>
    );
};

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  type?: string;
  label: string;
  data?: string;
  className?: string;
  placeholder?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
    id,
    type = "text",
    label,
    data = "",
    className = "",
    placeholder = "",
    ...rest
}) => {
    const [value, setValue] = React.useState<string>(data);

    return (
        <div className={`${styles["input-form-group"]} ${className}`}>
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                value={value}
                placeholder={placeholder}
                onChange={(e) => setValue(e.target.value)}
                className={styles["input-form-control"]}
                type={type}
                {...rest}
            />
        </div>
    );
};

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    name: string;
    data: string | null | undefined;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
};

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  data,
  options,
  placeholder = "Select option",
  className = "",
  ...rest
}) => {
    const [value, setValue] = React.useState(data);

    return (
        <div className={`${styles["input-form-group"]} ${className}`}>
            <label htmlFor={name}>{label}</label>
            <select
            name={name}
            value={value ?? ""}
            onChange={(e) => setValue(e.target.value)}
            className={styles["input-form-control"]}
            {...rest}>
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                    {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

interface FormCheckBoxProps 
    extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label: string;
    className?: string;
    checked?: boolean; // optional controlled prop
    labelPosition?: "left" | "right"; // new prop
}

export const FormCheckBox: React.FC<FormCheckBoxProps> = ({
    id,
    label,
    className = "",
    checked = false,
    labelPosition = "right", // default label on the right
    ...rest
}) => {
    const [isChecked, setIsChecked] = React.useState<boolean>(checked);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(e.target.checked);
        if (rest.onChange) rest.onChange(e);
    };

    return (
        <div className={`${styles["input-form-group"]} ${className}`}>
            {labelPosition === "left" && (
                <label className={styles["checkbox-label"]}>
                    <span>{label}</span>
                    <input
                        id={id}
                        type="checkbox"
                        checked={isChecked}
                        onChange={handleChange}
                        className={styles["input-form-control"]}
                        {...rest}
                    />
                </label>
            )}

            {labelPosition === "right" && (
                <label className={styles["checkbox-label"]}>
                    <input
                        id={id}
                        type="checkbox"
                        checked={isChecked}
                        onChange={handleChange}
                        className={styles["input-form-control"]}
                        {...rest}
                    />
                    <span>{label}</span>
                </label>
            )}
        </div>
    );
};
