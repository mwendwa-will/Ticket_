import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar as CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Event } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  useEffect(() => {
    document.title = "Events Calendar - TicketMaster";
  }, []);
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  
  // Group events by date
  const eventsByDate: Record<string, Event[]> = {};
  
  if (events) {
    events.forEach(event => {
      if (!eventsByDate[event.date]) {
        eventsByDate[event.date] = [];
      }
      eventsByDate[event.date].push(event);
    });
  }
  
  // Get events for the selected date
  const selectedDateStr = selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : '';
  const selectedDateEvents = selectedDateStr ? (eventsByDate[selectedDateStr] || []) : [];
  
  // Handler for previous/next month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };
  
  // Function to highlight dates with events
  const getDayClassNames = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return eventsByDate[dateString] ? 'bg-blue-100 text-blue-800 font-medium hover:bg-blue-200' : '';
  };
  
  return (
    <div className="container mx-auto my-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Events Calendar
        </h1>
        
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" size="sm">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Event List View
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 h-fit">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-medium">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('next')}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{
                booked: (date) => {
                  const dateString = date.toISOString().split('T')[0];
                  return !!eventsByDate[dateString];
                }
              }}
              modifiersClassNames={{
                booked: "bg-blue-100 text-blue-800 font-medium hover:bg-blue-200"
              }}
              className="rounded-md border"
            />
            
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-100 border border-blue-400 mr-1"></div>
                <span>Events Available</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : selectedDateEvents.length > 0 ? (
              <>
                <h2 className="text-xl font-bold mb-4">
                  Events on {selectedDate ? formatDate(selectedDateStr) : ''}
                </h2>
                <div className="space-y-4">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-2 md:mb-0">
                          <Link href={`/event/${event.id}`}>
                            <h3 className="text-lg font-semibold hover:text-blue-600">{event.title}</h3>
                          </Link>
                          <p className="text-gray-600 text-sm">{event.time} • {event.location}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="badge-genre">{event.genre}</Badge>
                          <span className="price-tag">${Number(event.price).toFixed(2)}</span>
                          <Link href={`/event/${event.id}`}>
                            <Button size="sm">View Details</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
                <p className="text-gray-500 mb-6">
                  {selectedDate 
                    ? `There are no events scheduled for ${formatDate(selectedDateStr)}.` 
                    : 'Select a date to view events.'}
                </p>
                <Link href="/">
                  <Button variant="outline">View All Events</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;