"use client";

import { Box } from "@chakra-ui/react";
import { ResponsiveSwarmPlot } from "@nivo/swarmplot";

interface Post {
  handle: string;
  reply: string;
  sentiment: number;
}

interface SwarmGraphProps {
  posts: Post[];
  startScore: number | null;
  endScore: number | null;
  setStartScore: (score: number | null) => void;
  setEndScore: (score: number | null) => void;
}

export default function SwarmGraph({
  posts,
  startScore,
  endScore,
  setStartScore,
  setEndScore,
}: SwarmGraphProps) {
  const data = posts.map((post) => ({
    id: post.handle,
    group: "",
    value: post.sentiment * 100,
  }));

  const handleClick = (node: any) => {
    if (!startScore) {
      setStartScore(node.value as number);
    } else if (!endScore) {
      setEndScore(node.value as number);
    } else {
      setStartScore(node.value as number);
      setEndScore(null);
    }
  };

  return (
    <Box h="full" w="full" position="relative">
      <Box
        position="absolute"
        top="0"
        left="40px"
        right="10px"
        bottom="30px"
        backdropFilter="blur(10px)"
        zIndex="0"
      />
      <ResponsiveSwarmPlot
        data={data}
        groups={[""]}
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
        margin={{ top: 0, right: 10, bottom: 30, left: 40 }}
        axisBottom={{
          tickSize: 10,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Sentiment Score",
          legendPosition: "middle",
          legendOffset: 20,
          tickValues: [0, 100],
        }}
        axisTop={null}
        axisLeft={{
          tickSize: 10,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Users",
          legendPosition: "middle",
          legendOffset: -15,
        }}
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
        colors={["#FFFFFF"]}
        onClick={handleClick}
        tooltip={({ id, value }) => (
          <div
            style={{
              background: "rgba(0,0,0,0.4)",
              padding: "6px 8px",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "6px",
              backdropFilter: "blur(3px)",
              fontSize: "10px",
              color: "#FFFFFF",
            }}
          >
            <strong style={{ fontSize: "11px" }}>
              {(value as number).toFixed(0)}
            </strong>
          </div>
        )}
      />
      {startScore !== null && endScore !== null && (
        <Box
          position="absolute"
          top="0"
          bottom="70px"
          left={`${Math.min(startScore, endScore)}%`}
          width={`${Math.abs(endScore - startScore)}%`}
          bg="rgba(255, 255, 255, 0.1)"
          zIndex="2"
        />
      )}
      {startScore !== null && (
        <Box
          position="absolute"
          top="0"
          bottom="70px"
          left={`${startScore}%`}
          width="2px"
          bg="rgba(255, 255, 255, 0.5)"
          zIndex="3"
        />
      )}
      {endScore !== null && (
        <Box
          position="absolute"
          top="0"
          bottom="70px"
          left={`${endScore}%`}
          width="2px"
          bg="rgba(255, 255, 255, 0.5)"
          zIndex="3"
        />
      )}
    </Box>
  );
}
