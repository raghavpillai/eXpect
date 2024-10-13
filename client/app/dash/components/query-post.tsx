"use client";

import { Avatar, HStack, Image, Text, VStack } from "@chakra-ui/react";

interface QueryPostProps {
  name: string;
  handle: string;
  content: string;
  pfp?: string;
}

export default function QueryPost({
  name,
  handle,
  content,
  pfp,
}: QueryPostProps) {
  return (
    <HStack
      alignItems="flex-start"
      p={4}
      bg="rgba(255,255,255,0.05)"
      borderRadius="xl"
      border="1px solid rgba(255,255,255,0.2)"
      w="full"
      maxW="500px"
      backdropFilter="blur(5px)"
    >
      {pfp ? (
        <Avatar name={handle} size="sm" mr={2} src={pfp} />
      ) : (
        <Avatar name={handle} size="sm" mr={2} />
      )}
      <VStack align="flex-start">
        <HStack spacing={2}>
          <HStack spacing={1}>
            <Text fontSize="sm" fontWeight="bold">
              {name}
            </Text>
            <Image src="verified.svg" alt="verified" w={4} h={4} />
          </HStack>
          <Text fontSize="xs" color="gray.400">
            {handle}
          </Text>
        </HStack>
        <Text fontSize="sm">{content}</Text>
      </VStack>
    </HStack>
  );
}
