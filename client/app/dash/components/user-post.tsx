"use client";

import {
  Avatar,
  CircularProgress,
  CircularProgressLabel,
  HStack,
  Image,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";

interface UserPostProps {
  name: string;
  handle: string;
  reply: string;
  sentiment: number;
  profilePicture: string;
  explanation: string;
}

export default function UserPost({
  name,
  handle,
  reply,
  sentiment,
  profilePicture,
  explanation,
}: UserPostProps) {
  const getColor = (sentiment: number) => {
    const r = Math.round(255 * (1 - sentiment));
    const g = Math.round(255 * sentiment);
    return `rgba(${r}, ${g}, 0, 1)`;
  };

  return (
    <HStack
      alignItems="flex-start"
      p={4}
      bg="rgba(255,255,255,0.05)"
      borderRadius="xl"
      border="1px solid rgba(255,255,255,0.2)"
      w="full"
      maxW="500px"
      justify="space-between"
      backdropFilter="blur(5px)"
    >
      <HStack>
        <Avatar
          name={handle}
          size="sm"
          mr={2}
          src={profilePicture}
          loading="lazy"
          onError={() => {
            console.log("error");
          }}
        />
        <VStack align="flex-start">
          <HStack spacing={2}>
            <HStack spacing={1}>
              <Text fontSize="sm" fontWeight="bold">
                {name}
              </Text>
              <Image src="verified.svg" alt="verified" w={4} h={4} />
            </HStack>
            <Text fontSize="xs" color="gray.400">
              @{handle}
            </Text>
          </HStack>
          <Text fontSize="sm">{reply}</Text>
        </VStack>
      </HStack>
      <Tooltip label={explanation}>
        <CircularProgress
          value={sentiment * 100}
          color={getColor(sentiment)}
          trackColor="rgba(150,150,150,0.2)"
          size="40px"
        >
          <CircularProgressLabel color="white" fontSize="3xs">
            {Math.round(sentiment * 100)}%
          </CircularProgressLabel>
        </CircularProgress>
      </Tooltip>
    </HStack>
  );
}
