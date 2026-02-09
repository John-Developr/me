'use client'

import React from "react";
import styles from "@/styles/admin/experience.module.css"

import Delete from "@/components/icons/Delete";
import Edit from "@/components/icons/Edit";
import EditSquare from "@/components/icons/EditSquare";
import HrHorizontal from "@/components/hr/HrHorizontal";
import Search from "@/components/icons/Search";
import Plus from "@/components/icons/Plus";

import Modal from "@/components/modal/Modal";

import { useApp } from "@/lib/context/AppContext";

export default function ExperienceTable() {
    const { setShowModal } = useApp();

    return (
        <div className={styles["table-container"]}>
            <Modal />
            <div className={styles.operation}>
                <div className={styles.search}>
                    <span className={styles.icon}>
                        <Search 
                            width={18}
                            height={18} />
                    </span>
                    <input 
                        type="search" 
                        placeholder="Search Experience"
                        className={`${styles["search-input"]} focus-animate`} />
                </div>
                <div className={styles["sort-add"]}>
                    <button className={styles.btnadd} onClick={() => {
                        setShowModal(true)
                    }}>
                        Add new
                        <Plus 
                            width={18}
                            height={18} />
                    </button>
                </div>
            </div>
            <div className={styles["general-action"]}>
                <section>
                    <input
                        type="checkbox" 
                        id="selectall"
                        className="form-check-input focus-animate" />
                    <label htmlFor="selectall">
                        Select All
                    </label>
                </section>
                <section>
                    <Delete height={18} width={18} /> 
                    Bulk Delete
                </section>
                <section>
                    Empty Table
                </section>
            </div>
            <div className={styles["table-scroll"]}>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>#ID</th>
                            <th>Company</th>
                            <th>Experience</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 4 }).map((_, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="form-check-input focus-animate" />
                                </td>
                                <td>#EXP-2312</td>
                                <td>Forty Degrees Celcius, Inc.</td>
                                <td>2 years</td>
                                <td>
                                    <div className={styles.action}>
                                        <EditSquare height={18} width={18} />
                                        <Delete height={18} width={18} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <HrHorizontal color="#ccc" spacing={0} thickness={0.5} />
            <div className={styles.footer}>
                <p>Showing 1-9 of 240 entries</p>
            </div>
        </div>
    );
}
