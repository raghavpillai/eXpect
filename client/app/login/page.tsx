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
  useToast,
} from "@chakra-ui/react";
import { useProfileStore } from "@utils/stores/profile";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MotionBox = motion(Box as any);
const MotionVStack = motion(VStack as any);
const MotionText = motion(Text as any);
const MotionImage = motion(Image as any);
const MotionInput = motion(Input as any);
const MotionButton = motion(Button as any);

export default function LoginPage() {
  const [tempHandle, setTempHandle] = useState("");
  const { setHandle, setName, setProfilePicture } = useProfileStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleTempHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTempHandle(
      value === "" ? "" : value.startsWith("@") ? value : "@" + value
    );
  };

  const handleLogin = () => {
    setLoading(true);
    setHandle(tempHandle);

    const handleGetUserInfo = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/user/${tempHandle}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setName(data.data.name);
        setProfilePicture(data.data.profile_image_url || data.data.image_url);

        // if (
        //   !data.data.name ||
        //   !data.data.profile_image_url ||
        //   !data.data.image_url
        // ) {
        //   throw new Error("User data is incomplete");
        // }

        router.push("/search");
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    handleGetUserInfo();
  };

  return (
    <MotionBox
      w="100vw"
      h="100vh"
      position="relative"
      overflow="hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <MotionImage
        src="/bg-1.png"
        alt="bg-login"
        position="absolute"
        top="0"
        w="100%"
        h="100%"
        objectFit="cover"
        filter="grayscale(30%) brightness(100%)"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1 }}
      />
      <MotionVStack
        h="full"
        w={{ base: "80%", md: "50%" }}
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
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <MotionText
          fontSize="xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Login to
        </MotionText>
        <HStack spacing={0.5}>
          <MotionText
            fontSize="3xl"
            fontWeight="bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            e
          </MotionText>
          <MotionImage
            src="/x-icon.png"
            alt="logo"
            w="20px"
            h="20px"
            filter="invert(100%)"
            mt={1}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          />
          <MotionText
            fontSize="3xl"
            fontWeight="bold"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            pect
          </MotionText>
        </HStack>
        <MotionVStack
          mt={12}
          spacing={4}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          <MotionInput
            placeholder="@rag_pil"
            value={tempHandle}
            onChange={handleTempHandleChange}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          />
          <MotionButton
            bg="white"
            color="black"
            rightIcon={<ChevronRightIcon />}
            onClick={handleLogin}
            rounded="full"
            size="sm"
            disabled={tempHandle === ""}
            _hover={{ bg: "rgba(255,255,255,0.6)" }}
            isLoading={loading}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </MotionButton>
        </MotionVStack>
      </MotionVStack>
    </MotionBox>
  );
}
