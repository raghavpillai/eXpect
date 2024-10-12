"use client";

import { Box, HStack, Image, Text, VStack } from "@chakra-ui/react";

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
        filter="grayscale(30%) brightness(100%)"
      />
      <Box
        h="full"
        w="50%"
        bg="rgba(0, 0, 0, 0.4)"
        position="absolute"
        right="0"
        top="0"
        zIndex="1"
        backdropFilter="blur(10px) grayscale(50%)"
        borderLeft="1px"
        borderColor="rgba(255,255,255,0.2)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack>
          <Text fontSize="xl">Login to</Text>
          <HStack spacing={1}>
            <Image
              src="/x-icon.png"
              alt="logo"
              w="20px"
              h="20px"
              filter="invert(100%)"
            />
            <Text fontSize="2xl" fontWeight="bold">
              pect
            </Text>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
