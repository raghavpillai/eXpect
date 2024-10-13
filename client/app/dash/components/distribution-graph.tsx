"use client";

import { Box } from "@chakra-ui/react";
import { Point, ResponsiveLine, Serie } from "@nivo/line";
import { useEffect, useState } from "react";

interface Post {
  handle: string;
  reply: string;
  sentiment: number;
}

function gaussianKDE(
  data: number[],
  bandwidth: number,
  min: number,
  max: number,
  steps: number
) {
  const kde = (x: number) => {
    return (
      data.reduce((sum, dataPoint) => {
        const z = (x - dataPoint) / bandwidth;
        return (
          sum + Math.exp(-0.5 * z * z) / (Math.sqrt(2 * Math.PI) * bandwidth)
        );
      }, 0) / data.length
    );
  };

  const step = (max - min) / steps;
  const kdeData = [];
  for (let x = min; x <= max; x += step) {
    kdeData.push({ x, y: kde(x) });
  }
  return kdeData;
}

interface DistributionGraphProps {
  posts: Post[];
  startScore: number | null;
  endScore: number | null;
  setStartScore: (score: number | null) => void;
  setEndScore: (score: number | null) => void;
}

export default function DistributionGraph({
  posts,
  startScore,
  endScore,
  setStartScore,
  setEndScore,
}: DistributionGraphProps) {
  // Extract sentiment values
  const sentiments = posts.map((post: any) => post.response.sentiment * 100);

  // Generate KDE data
  const kdeData = gaussianKDE(sentiments, 5, 0, 100, 100);

  const [animatedData, setAnimatedData] = useState<Serie[]>([
    {
      id: "sentiment distribution",
      data: kdeData.map((point) => ({ x: point.x, y: 0 })),
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData([
        {
          id: "sentiment distribution",
          data: kdeData,
        },
      ]);
    }, 100); // 1 second delay

    return () => clearTimeout(timer);
  }, []);

  const handleSlice = (slice: { points: readonly Point[] }) => {
    const clickedX = slice.points[0].data.x as number;
    if (!startScore) {
      setStartScore(clickedX);
      setEndScore(null);
    } else if (!endScore) {
      setEndScore(clickedX);
    } else {
      setStartScore(clickedX);
      setEndScore(null);
    }
  };

  // Add this new function to generate the highlighted area data
  const getHighlightedAreaData = () => {
    if (startScore === null || endScore === null) return [];

    const start = Math.min(startScore, endScore);
    const end = Math.max(startScore, endScore);

    return kdeData.filter((point) => point.x >= start && point.x <= end);
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
      <ResponsiveLine
        data={[
          ...animatedData,
          {
            id: "highlighted-area",
            data: getHighlightedAreaData(),
          },
        ]}
        colors={["#FFFFFF", "#808080"]}
        xScale={{ type: "linear", min: 0, max: 100 }}
        yScale={{
          type: "linear",
          min: 0,
          max: Math.max(...kdeData.map((point) => point.y)) * 1.1, // Set max to 110% of the highest y value
          stacked: false,
          reverse: false,
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Sentiment Score",
          legendOffset: 20,
          legendPosition: "middle",
          tickValues: [0, 100],
          format: (value) => value.toFixed(0), // Remove decimal places
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Density",
          legendOffset: -15,
          legendPosition: "middle",
          tickValues: [], // Remove all ticks
        }}
        enablePoints={false}
        enableArea={true}
        areaOpacity={0.3}
        areaBaselineValue={0}
        curve="monotoneX"
        theme={{
          background: "rgba(0, 0, 0, 0)",
          text: {
            fontSize: 12,
            fill: "#FFFFFF",
          },
          axis: {
            domain: {
              line: {
                stroke: "#FFFFFF",
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
                fill: "#FFFFFF",
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
            color: "#FFFFFF",
            container: {
              background: "rgba(128, 128, 128, 1)",
              fontSize: 12,
            },
          },
        }}
        enableSlices="x"
        sliceTooltip={({ slice }) => (
          <div
            style={{
              background: "rgba(0,0,0,0.4)",
              padding: "6px 8px",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "6px",
              backdropFilter: "blur(3px)",
              fontSize: "10px",
            }}
          >
            <strong style={{ fontSize: "11px" }}>
              {slice.points[0].data.xFormatted}
            </strong>
          </div>
        )}
        onClick={handleSlice}
        brushBorderColor="rgba(255,255,255,0.5)"
        brushBorderWidth={1}
        brushProps={{
          brushColor: "rgba(255,255,255,0.1)",
        }}
        margin={{ top: 0, right: 10, bottom: 30, left: 40 }}
        markers={[
          startScore && {
            axis: "x",
            value: startScore,
            lineStyle: {
              stroke: "#808080",
              strokeWidth: 1,
              strokeDasharray: "5,5",
            },
            legend: "Start",
            legendOrientation: "vertical",
          },
          endScore && {
            axis: "x",
            value: endScore,
            lineStyle: {
              stroke: "#808080",
              strokeWidth: 1,
              strokeDasharray: "5,5",
            },
            legend: "End",
            legendOrientation: "vertical",
          },
        ].filter(Boolean)}
        // Add these animation properties
        animate={true}
        motionConfig="gentle"
        transitionMode="default"
        layers={[
          "grid",
          "markers",
          "areas",
          "lines",
          "slices",
          "axes",
          "points",
          "legends",
        ]}
      />
    </Box>
  );
}
