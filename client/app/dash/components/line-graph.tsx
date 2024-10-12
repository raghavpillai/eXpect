"use client";

import { Box } from "@chakra-ui/react";
import { ResponsiveLine } from "@nivo/line";

export default function LineGraph({ data, ...props }: { data: any }) {
  return (
    <Box {...props}>
      <ResponsiveLine
        data={data}
        colors={"rgba(5, 153, 233, 0.8)"}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: 0,
          max: 100,
          stacked: true,
          reverse: false,
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 60,
          legend: "Paragraph Number",
          legendOffset: -10,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 8,
          tickPadding: 3,
          tickRotation: 0,
          legend: "Relative Sentiment",
          legendOffset: 10,
          legendPosition: "middle",
        }}
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={0}
        pointLabelYOffset={-12}
        // enablePointLabel={true}
        curve="monotoneX"
        pointLabel="y"
        useMesh={true}
        enableArea={true}
        theme={{
          background: "rgba(0, 0, 0, 0)",
          text: {
            fontSize: 12,
            fill: "#000000",
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
                fill: "#000000",
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
                fill: "#dddddd",
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
            color: "black",
            container: {
              background: "rgba(128, 128, 128, 1)",
              fontSize: 12,
            },
          },
        }}
      />
    </Box>
  );
}
