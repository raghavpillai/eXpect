"use client";

import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  HStack,
  Image,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useProfileStore } from "@utils/stores/profile";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [tempHandle, setTempHandle] = useState("");
  const { setHandle } = useProfileStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTempHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempHandle(
      value === "" ? "" : value.startsWith("@") ? value : "@" + value
    );
  };

  const handleLogin = () => {
    setLoading(true);
    setHandle(tempHandle);

    setTimeout(() => {
      router.push("/search");
    }, 1000);
  };

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
      <VStack
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
        <VStack mt={12} spacing={4}>
          <Input
            placeholder="@rag_pil"
            value={tempHandle}
            onChange={handleTempHandleChange}
          />
          <Button
            bg="white"
            color="black"
            rightIcon={<ChevronRightIcon />}
            onClick={handleLogin}
            rounded="full"
            size="sm"
            disabled={tempHandle === ""}
            _hover={{ bg: "rgba(255,255,255,0.6)" }}
            isLoading={loading}
          >
            Login
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
