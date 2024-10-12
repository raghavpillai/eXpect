import { Box } from "@chakra-ui/react";
import { ResponsivePie } from "@nivo/pie";

interface PieChartProps {
  agrees: number;
  disagrees: number;
}

export default function PieChart({ agrees, disagrees }: PieChartProps) {
  const data = [
    { id: "Agrees", value: agrees, color: "#D3D3D3" }, // Light gray
    { id: "Disagrees", value: disagrees, color: "#4A4A4A" }, // Dark gray
  ];

  return (
    <Box h="200px" w="500px">
      <ResponsivePie
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ datum: "data.color" }} // Use custom colors from data
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#ffffff"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor="#ffffff"
      />
    </Box>
  );
}
