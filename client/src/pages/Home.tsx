import { useEffect } from "react";
import { useLocation } from "wouter";
import Hero from "@/components/Hero";
import EventList from "@/components/EventList";

const Home = () => {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const searchQuery = params.get("search") || "";
  const categoryFilter = params.get("category") || "";

  // Set page title
  useEffect(() => {
    document.title = "TicketMaster - Discover Live Events";
  }, []);

  return (
    <div>
      <Hero />
      <section className="container mx-auto my-12 px-4">
        <EventList searchQuery={searchQuery} categoryFilter={categoryFilter} />
      </section>
    </div>
  );
};

export default Home;
