"use client";

import { Box } from "@chakra-ui/react";

export default function BackgroundImage() {
  return (
    <Box
      position="absolute"
      top={0}
      right={0}
      w="100%"
      height="100%"
      // height="300px"
      zIndex={-1}
      backgroundImage="url('/bg-3.png')"
      backgroundSize="cover"
      backgroundPosition="center top"
      _after={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,1))",
      }}
    />
  );
}
