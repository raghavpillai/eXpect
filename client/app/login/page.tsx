"use client";

import { Box, Image } from "@chakra-ui/react";

export default function LoginPage() {
  return (
    <Box w="100vw" h="100vh" position="relative" overflow="hidden">
      <Image
        src="/bg-1.png"
        alt="bg-login"
        position="absolute"
        top="0"
        w="100%"
        h="100%"
        objectFit="cover"
        filter="grayscale(50%) brightness(50%)"
      />
      <Box
        h="full"
        w="50%"
        bg="rgba(0, 0, 0, 0.2)"
        position="absolute"
        right="0"
        top="0"
        zIndex="1"
        backdropFilter="blur(5px)"
        borderLeft="1px"
        borderColor="rgba(255,255,255,0.2)"
      ></Box>
    </Box>
  );
}
