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
import { useSearchQueryStore } from "@utils/stores/search";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProfileSection from "./components/profile-section";
import TitleSection from "./components/title-section";

const MotionBox = motion(Box as any);
const MotionVStack = motion(VStack as any);
const MotionButton = motion(Button as any);

const BackgroundImage = () => {
  return (
    <MotionBox
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  );
};

export default function SearchPage() {
  const [postQuery, setPostQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { setSearchQuery } = useSearchQueryStore();
  const router = useRouter();
  const handlePostInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostQuery(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
    if (e.target.scrollHeight == 58 || e.target.scrollHeight == 59) {
      e.target.style.height = "38px";
    }
  };

  const handleSearchSubmit = () => {
    setLoading(true);
    setSearchQuery(postQuery);

    setTimeout(() => {
      setLoading(false);
      router.push("/dash");
    }, 1000);
  };

  const handleFocus = (focused: boolean) => {
    setIsFocused(focused);
  };

  return (
    <MotionBox
      w="100vw"
      h="100vh"
      color="white"
      p={8}
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
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
      <MotionBox
        position="absolute"
        top={4}
        right={4}
        zIndex={40}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <ProfileSection />
      </MotionBox>
      <MotionVStack
        zIndex={40}
        spacing={8}
        align="stretch"
        w={{ base: "90vw", md: "80vw", lg: "70vw" }}
        alignItems="center"
        justifyContent="center"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <TitleSection />
        <MotionBox
          w="full"
          animate={{
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ duration: 0.1 }}
        >
          <MotionBox
            borderWidth={1}
            borderRadius="lg"
            p={4}
            w="full"
            backdropFilter="blur(10px)"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <VStack spacing={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none" h="auto">
                  <SearchIcon color="gray.500" mt={3} />
                </InputLeftElement>
                <Textarea
                  placeholder="Enter your sample post"
                  minH="40px"
                  overflow="hidden"
                  resize="none"
                  py={2}
                  pl={10}
                  pr={2}
                  onChange={handlePostInputChange}
                  onFocus={() => handleFocus(true)}
                  onBlur={() => handleFocus(false)}
                />
              </InputGroup>

              <HStack justify="space-between" width="100%">
                <HStack>
                  <MotionButton
                    leftIcon={<AttachmentIcon />}
                    variant="ghost"
                    size="sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Attach
                  </MotionButton>
                </HStack>
                <MotionButton
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore
                </MotionButton>
              </HStack>
            </VStack>
          </MotionBox>
        </MotionBox>
      </MotionVStack>
    </MotionBox>
  );
}
