import Link from "next/link";

import styles from "@/styles/pages/404.module.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

import Home from "@/components/icons/Home";
import Shape404 from "@/components/shapes/Shape404";

export default function Page404() {
  return (
    <>
        <Header />
        <div className={styles.container}>
            <section>
                <div className={styles.detail}>
                    <h3>ERROR</h3>
                    <h1>Oops!</h1>
                    <section>
                        <p>Sorry, the content you're looking for doesn't exist. </p>
                        <p>Either it was removed, or you mistyped the link. </p>
                    </section>
                    <Link href="/" className={styles.link}>
                        <Home width={15} height={15} /> Back to Home Page
                    </Link>
                </div>
                <div className={styles.shapeContainer}>
                    <Shape404 className={styles.shape} width={574} height={520} />
                </div>
            </section>
        </div>
        <Footer />
    </>
  );
}
