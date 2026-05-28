"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/src/context/AppContext';
import { CalendarView } from '@/src/components/SupportingViews';

export default function CalendarPage() {
  const { events, checkOffPost, rescheduleEvent, deleteCalendarEvent } = useAppContext();
  const router = useRouter();

  return (
    <CalendarView
      events={events}
      onCheckPost={checkOffPost}
      onReschedule={rescheduleEvent}
      onDeleteEvent={deleteCalendarEvent}
      onNavigate={(p) => router.push(`/${p.replace('_', '-')}`)}
    />
  );
}
