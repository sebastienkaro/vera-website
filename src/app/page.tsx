import { Hero } from "@/components/home/Hero";
import { Collection } from "@/components/home/Collection";
import { WhyVera } from "@/components/home/WhyVera";
import { AboutVera } from "@/components/home/AboutVera";

export default function Home() {
  return (
    <>
      <Hero />
      <Collection />
      <WhyVera />
      <AboutVera />
    </>
  );
}
