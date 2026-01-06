import HomePage from "../../components/HomePage";

export const revalidate = 3600; // ISR: revalidate every 1 hour

export async function generateMetadata() {
  return {
    title: "Sil3aty - منصة تسوق إلكترونية حديثة",
  };
}

export default function Home() {
  return <HomePage />;
}
