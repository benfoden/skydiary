/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { type Event } from "@prisma/client";
import { eachDayOfInterval, endOfWeek, format, startOfWeek } from "date-fns";
import { useEffect, useState } from "react";
import { Card } from "~/app/_components/Card";

export default function EventBody({
  events,
  userCount,
}: {
  events: Event[];
  userCount: number;
}) {
  const [eventStats, setEventStats] = useState<any>(null);

  useEffect(() => {
    if (!events) {
      throw new Error("No events found.");
    }

    const eventMap = events
      .filter((event) => event.userId !== "clwaeilcb0000j405ba96cc5p")
      .reduce(
        (
          acc: Record<string, { total: number; types: Record<string, number> }>,
          event,
        ) => {
          if (!event) {
            return acc;
          }
          const date = format(new Date(event.createdAt), "yyyy-MM-dd");
          if (!acc[date]) {
            acc[date] = { total: 0, types: {} };
          }
          acc[date].total += 1;
          if (!acc[date].types) {
            acc[date].types = {};
          }
          if (!acc[date].types[event.type]) {
            acc[date].types[event.type] = 0;
          }

          acc[date].types[event.type] = (acc[date].types[event.type] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, { total: number; types: Record<string, number> }>,
      );

    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const weeklyStats = daysOfWeek.map((day) => {
      const date = format(day, "yyyy-MM-dd");
      return {
        date,
        total: eventMap[date]?.total ?? 0,
        types: eventMap[date]?.types ?? {},
      };
    });

    const totalEvents = weeklyStats.reduce((acc, day) => acc + day.total, 0);
    const dailyAverage = totalEvents / 7;
    const weeklyAverage = totalEvents;

    const typeAverages = Object.entries(eventMap).reduce(
      (acc, [_date, { types }]) => {
        Object.entries(types).forEach(([type, count]) => {
          if (!acc[type]) {
            acc[type] = { total: 0, days: 0 };
          }
          acc[type].total += count;
          acc[type].days += 1;
        });
        return acc;
      },
      {} as Record<string, { total: number; days: number }>,
    );

    const typeAveragesFormatted = Object.entries(typeAverages).reduce(
      (acc, [type, { total, days }]) => {
        acc[type] = {
          dailyAverage: total / days,
          weeklyAverage: total,
        };
        return acc;
      },
      {} as Record<string, { dailyAverage: number; weeklyAverage: number }>,
    );

    setEventStats({
      weeklyStats,
      dailyAverage,
      weeklyAverage,
      typeAverages: typeAveragesFormatted,
    });
  }, [events]);

  if (!eventStats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full flex-row flex-wrap gap-4 md:mt-4">
        <p className="text-2xl">Total Users: {userCount}</p>
        <p> target comments / user / day: 1+</p>
        <p> target posts / user / day: 0.5</p>
        <p> target personas / user : 1+</p>
      </div>
      <div className="flex w-full flex-col gap-4">
        <Card isButton={false}>
          <table>
            <thead>
              <tr className="flex w-full flex-row gap-4">
                <th className="w-20 text-start">Date</th>
                <th className="w-20 text-start">Total</th>
                <th className="w-20 text-start">Comments</th>
                <th className="w-20 text-start">Posts</th>
                <th className="w-20 text-start">Personas</th>
              </tr>
            </thead>
            <tbody>
              {eventStats.weeklyStats.map((day: any) => (
                <tr className="flex w-full flex-row gap-4" key={day.date}>
                  <td className="w-20 text-start">{day.date}</td>
                  <td className="w-20 text-start">{day.total}</td>
                  <td className="w-20 text-start">
                    {Object.entries(day.types)
                      .filter(([type]) => type === "comment")
                      .map(([type, count]: [string, any]) => (
                        <span key={type}>{count}</span>
                      ))}
                  </td>
                  <td className="w-20 text-start">
                    {Object.entries(day.types)
                      .filter(([type]) => type === "post")
                      .map(([type, count]: [string, any]) => (
                        <span key={type}>{count}</span>
                      ))}
                  </td>
                  <td className="w-20 text-start">
                    {Object.entries(day.types)
                      .filter(([type]) => type === "persona")
                      .map(([type, count]: [string, any]) => (
                        <span key={type}>{count}</span>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
