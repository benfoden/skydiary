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

    const eventMap = events.reduce(
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

    console.log("eventMap", eventMap);

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
    <div className="flex flex-row gap-4">
      <div className="flex w-full flex-col gap-4">
        <p className="text-2xl">Total Users: {userCount}</p>
        <div>
          <h2 className="text-xl">average by type</h2>
          {eventStats.typeAverages &&
            Object.entries(eventStats.typeAverages).map(([type, averages]) => (
              <div key={type}>
                <h3>{type}</h3>
                <p>
                  Daily Average:{" "}
                  {(averages as { dailyAverage: number }).dailyAverage.toFixed(
                    2,
                  )}
                </p>
                <p>
                  Weekly Average:{" "}
                  {(averages as { weeklyAverage: number }).weeklyAverage}
                </p>
              </div>
            ))}
        </div>
        <div>
          <h2 className="text-xl">average per user by type</h2>
          {eventStats.typeAverages &&
            Object.entries(eventStats.typeAverages).map(([type, averages]) => (
              <div key={type}>
                <h3>{type}</h3>
                <p>
                  Daily Average:{" "}
                  {(
                    (averages as { dailyAverage: number }).dailyAverage /
                    userCount
                  ).toFixed(2)}
                </p>
                <p>
                  Weekly Average:{" "}
                  {(
                    (averages as { weeklyAverage: number }).weeklyAverage /
                    userCount
                  ).toFixed(2)}
                </p>
              </div>
            ))}
        </div>
      </div>
      <div className="flex w-full flex-col gap-4">
        <Card isButton={false}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Events</th>
                <th>Event Types</th>
              </tr>
            </thead>
            <tbody>
              {eventStats.weeklyStats.map((day: any) => (
                <tr key={day.date}>
                  <td>{day.date}</td>
                  <td>{day.total}</td>
                  <td>
                    {Object.entries(day.types).map(
                      ([type, count]: [string, any]) => (
                        <div key={type}>
                          {type}: {count}
                        </div>
                      ),
                    )}
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
