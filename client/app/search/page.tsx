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
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProfileSection from "./components/profile-section";
import TitleSection from "./components/title-section";

const BackgroundImage = () => {
  return (
    <Box
      position="absolute"
      top={0}
      right={0}
      w="100%"
      height="100%"
      zIndex={1}
      backgroundImage="url('/bg-2.png')"
      backgroundSize="cover"
      backgroundPosition="center top"
      _after={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0), rgba(0,0,0,0.6))",
      }}
    />
  );
};

export default function SearchPage() {
  const [postQuery, setPostQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const handlePostInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostQuery(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
    if (e.target.scrollHeight == 58) {
      e.target.style.height = "38px";
    }
  };

  const handleSearchSubmit = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.push("/dash");
    }, 1000);
  };

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
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        alignItems="center"
        justifyContent="center"
      >
        <BackgroundImage />
      </Box>
      <Box position="absolute" top={4} right={4} zIndex={40}>
        <ProfileSection />
      </Box>
      <VStack
        zIndex={40}
        spacing={8}
        align="stretch"
        w={{ base: "90vw", md: "80vw", lg: "70vw" }}
        alignItems="center"
        justifyContent="center"
      >
        <TitleSection />

        <Box
          borderWidth={1}
          borderRadius="lg"
          p={4}
          w="full"
          backdropFilter="blur(10px)"
        >
          <VStack spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none" h="auto">
                <SearchIcon color="gray.500" mt={3} />
              </InputLeftElement>
              <Textarea
                placeholder="You ask, we answer..."
                minH="40px"
                overflow="hidden"
                resize="none"
                py={2}
                pl={10}
                pr={2}
                onChange={handlePostInputChange}
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
                disabled={postQuery === "" || loading}
                onClick={handleSearchSubmit}
                isLoading={loading}
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
