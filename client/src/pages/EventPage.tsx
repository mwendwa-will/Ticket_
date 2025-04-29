import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import EventDetails from "@/components/EventDetails";
import EventList from "@/components/EventList";
import { Event } from "@shared/schema";

const EventPage = () => {
  const [match, params] = useRoute("/event/:id");
  const eventId = params?.id || "";

  const { data: event } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
  });

  // Set page title with event name when loaded
  useEffect(() => {
    if (event) {
      document.title = `${event.title} - TicketMaster`;
    } else {
      document.title = "Event Details - TicketMaster";
    }
  }, [event]);

  if (!match) return null;

  return (
    <div className="container mx-auto my-12 px-4">
      <EventDetails eventId={eventId} />

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
        <EventList />
      </div>
    </div>
  );
};

export default EventPage;
