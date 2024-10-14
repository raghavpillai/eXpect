"use client";

import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  HStack,
  Icon,
  Image,
  Input,
  Link,
  SimpleGrid,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useProfileStore } from "@utils/stores/profile";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";

const MotionBox = motion(Box as any);
const MotionVStack = motion(VStack as any);
const MotionHStack = motion(HStack as any);
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

    const handleGetUserInfo = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/user/${tempHandle}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setHandle(tempHandle);
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
          isClosable: true,
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1, delay: 1.8, ease: "easeInOut" }}
          />
          <MotionButton
            bg={tempHandle === "" ? "rgba(255,255,255,0.4)" : "white"}
            color="black"
            rightIcon={<ChevronRightIcon />}
            onClick={handleLogin}
            rounded="full"
            size="sm"
            disabled={tempHandle === ""}
            _hover={{ bg: "rgba(255,255,255,0.6)" }}
            isLoading={loading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1, delay: 2.1, ease: "easeInOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </MotionButton>
        </MotionVStack>

        <MotionVStack
          position="absolute"
          bottom="10px"
          left="0"
          right="0"
          w="full"
          spacing={4}
          align="center"
          justify="center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.4 }}
        >
          <VStack mb={4}>
            <Image
              src="xai-icon.svg"
              alt="hackathon"
              w="50px"
              filter="invert(100%)"
            />
            <Text fontSize="sm" color="white">
              Hackathon
            </Text>
          </VStack>
          <Box w="full" px={4}>
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 4 }}
              spacing={4}
              justifyItems="center"
            >
              {[
                {
                  firstName: "Ray",
                  lastName: "Del Vecchio",
                  handle: "raydelvecc",
                },
                { firstName: "Raghav", lastName: "Pillai", handle: "rag_pil" },
                {
                  firstName: "Ethan",
                  lastName: "Shaotran",
                  handle: "EShaotran",
                },
                {
                  firstName: "Giovanni",
                  lastName: "D'Antonio",
                  handle: "GiovanniMDanto2",
                },
              ].map((user, index) => (
                <VStack key={index} spacing={0} align="center">
                  <Text
                    fontSize="sm"
                    color="white"
                    textAlign="center"
                    fontWeight="bold"
                  >
                    {user.firstName} {user.lastName}
                  </Text>
                  <Link
                    href={`https://x.com/${user.handle}`}
                    isExternal
                    color="blue.300"
                    fontSize="sm"
                  >
                    @{user.handle}
                  </Link>
                </VStack>
              ))}
            </SimpleGrid>
          </Box>

          <Button
            leftIcon={<Icon as={FaGithub} />}
            colorScheme="gray"
            variant="outline"
            size="sm"
            onClick={() =>
              window.open("https://github.com/raghavpillai/eXpect", "_blank")
            }
          >
            View on GitHub
          </Button>
        </MotionVStack>
      </MotionVStack>
    </MotionBox>
  );
}
