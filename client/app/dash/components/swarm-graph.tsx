"use client";

import { Box } from "@chakra-ui/react";
import { ResponsiveSwarmPlot } from "@nivo/swarmplot";

interface Post {
  handle: string;
  reply: string;
  sentiment: number;
}

export default function SwarmGraph({ posts }: { posts: Post[] }) {
  const data = posts.map((post) => ({
    id: post.handle,
    group: "users",
    value: post.sentiment * 100, // Convert sentiment to a 0-100 scale
  }));

  return (
    <Box h="full" w="full">
      <ResponsiveSwarmPlot
        data={data}
        groups={["users"]}
        value="value"
        valueScale={{ type: "linear", min: 0, max: 100 }}
        size={10}
        forceStrength={4}
        simulationIterations={100}
        borderColor={{
          from: "color",
          modifiers: [
            ["darker", 0.6],
            ["opacity", 0.5],
          ],
        }}
        margin={{ top: 20, right: 20, bottom: 70, left: 20 }}
        axisBottom={{
          tickSize: 10,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Sentiment Score",
          legendPosition: "middle",
          legendOffset: 46,
        }}
        axisTop={null}
        axisLeft={null}
        axisRight={null}
        layout="horizontal"
        theme={{
          background: "rgba(0, 0, 0, 0)",
          text: {
            fontSize: 12,
            fill: "#FFFFFF",
          },
          axis: {
            domain: {
              line: {
                stroke: "rgba(255, 255, 255, 1)",
                strokeWidth: 1,
              },
            },
            legend: {
              text: {
                fontSize: 14,
                fill: "#FFFFFF",
                outlineWidth: 5,
                outlineColor: "transparent",
              },
            },
            ticks: {
              line: {
                stroke: "rgba(255, 255, 255, 0.5)",
                strokeWidth: 1,
              },
              text: {
                fontSize: 13,
                fill: "#DDDDDD",
                outlineWidth: 3,
                outlineColor: "transparent",
              },
            },
          },
          grid: {
            line: {
              stroke: "rgba(255, 255, 255, 0.2)",
              strokeWidth: 1,
            },
          },
          tooltip: {
            container: {
              background: "rgba(128, 128, 128, 1)",
              color: "#FFFFFF",
              fontSize: 12,
            },
          },
        }}
      />
    </Box>
  );
}
