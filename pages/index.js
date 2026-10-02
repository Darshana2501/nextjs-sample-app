import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import styles from "@/styles/Home.module.css";
import { useSession,signIn,signOut } from "next-auth/react";



export default function Home() {
  const session=useSession();
  console.log("Session,session");
  if (session.data ==null){
    return <button onClick={signIn}>Login</button>
  }

  return (
    <div className={styles.container}>
      <h1>hello {session?.data?.user?.name}</h1>
      <button onClick={signOut}>logout</button>
    </div>
  );
}
