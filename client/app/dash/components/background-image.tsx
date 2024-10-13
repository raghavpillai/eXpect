"use client";

import { Box } from "@chakra-ui/react";

export default function BackgroundImage() {
  return (
    <Box
      position="absolute"
      top={0}
      right={0}
      w="100%"
      height="100vh"
      bg="linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(15,15,15,1))"
    >
      <Box
        position="absolute"
        top={0}
        right={0}
        w="100%"
        height="100vh"
        // height="300px"
        zIndex={-1}
        backgroundImage="url('/bg-3.png')"
        backgroundSize="cover"
        backgroundPosition="center top"
      />
    </Box>
  );
}
