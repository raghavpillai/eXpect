"use client";

import { AttachmentIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  HStack,
  InputGroup,
  InputLeftElement,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import ProfileSection from "./components/profile-section";
import TitleSection from "./components/title-section";

export default function SearchPage() {
  return (
    <Box
      w="100vw"
      h="100vh"
      color="white"
      p={8}
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      <Box position="absolute" top={4} right={4}>
        <ProfileSection />
      </Box>
      <VStack
        spacing={8}
        align="stretch"
        w={{ base: "90vw", md: "80vw", lg: "70vw" }}
        alignItems="center"
        justifyContent="center"
      >
        <TitleSection />

        <Box borderWidth={1} borderRadius="lg" p={4} w="full">
          <VStack spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none" h="auto">
                <SearchIcon color="gray.500" mt={12} />
              </InputLeftElement>
              <Textarea
                placeholder="You ask, we answer..."
                minH="40px"
                overflow="hidden"
                resize="none"
                py={2}
                pl={10}
                pr={2}
                onChange={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                  if (e.target.scrollHeight == 58) {
                    e.target.style.height = "38px";
                  }
                }}
              />
            </InputGroup>

            <HStack justify="space-between" width="100%">
              <HStack>
                <Button leftIcon={<AttachmentIcon />} variant="ghost" size="sm">
                  Attach
                </Button>
              </HStack>
              <Button
                colorScheme="teal"
                rightIcon={<SearchIcon />}
                size="sm"
                bg="white"
                color="black"
                rounded="full"
                _hover={{ bg: "rgba(255,255,255,0.6)" }}
              >
                Search
              </Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
