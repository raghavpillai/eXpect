"use client";

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@/app/components/modal";
import {
  Box,
  Button,
  Grid,
  HStack,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useProfileStore } from "@utils/stores/profile";
import { useSearchQueryStore } from "@utils/stores/search";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import BackgroundImage from "./components/background-image";
import Graphs from "./components/graphs";
import LoadingModal from "./components/loading-modal";
import QueryPost from "./components/query-post";
import UserPost from "./components/user-post";

// Create motion components
const MotionBox = motion(Box as any);
const MotionHStack = motion(HStack as any);
const MotionVStack = motion(VStack as any);
const MotionButton = motion(Button as any);
const MotionText = motion(Text as any);
const MotionImage = motion(Image as any);

const AnimatedUserPost = motion(UserPost as any);

export default function DashPage() {
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  const [startScore, setStartScore] = useState<number | null>(null);
  const [endScore, setEndScore] = useState<number | null>(null);
  const [isAllPostsModalOpen, setIsAllPostsModalOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const { handle, name, profilePicture } = useProfileStore();
  const { searchQuery } = useSearchQueryStore();
  const hasInitialized = useRef(false);

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!handle || !searchQuery) {
      router.push("/search");
    }

    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    const handleSendQuery = async () => {
      try {
        const url = `http://localhost:8080/sample_x?username=${handle}&sampling_text=${searchQuery}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // Stream data
        // Ethan TODO: render as it streams in
        if (reader) {
          while (true) {
            const { value, done }: ReadableStreamReadResult<Uint8Array> =
              await reader.read();
            if (done) {
              break;
            }
            if (value) {
              buffer += decoder.decode(value, { stream: true });
              let lines = buffer.split("\n");
              buffer = lines.pop() ?? ""; // Save the last incomplete line
              for (const line of lines) {
                if (line.trim()) {
                  try {
                    const parsed = JSON.parse(line);
                    console.log("new line", parsed);
                    setData((prevData) => [...prevData, parsed]);
                    setPosts((prevData) => [...prevData, parsed]);
                    setDataLoading(false); // allow rendering to begin
                  } catch (e) {
                    console.error("Error parsing JSON:", e);
                  }
                }
              }
            }
          }
        }

        // Process any remaining data in buffer
        if (buffer.trim()) {
          try {
            const parsed = JSON.parse(buffer);
            setData((prevData) => [...prevData, parsed]);
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    handleSendQuery();
  }, [handle, searchQuery]);

  const getDistributedPosts = (posts: any[], count: number) => {
    const filteredPosts = posts.filter((post) => {
      if (startScore === null || endScore === null) {
        return true;
      }
      return (
        post.response.sentiment >= startScore / 100 &&
        post.response.sentiment <= endScore / 100
      );
    });

    console.log(
      "filteredPosts for start and end ",
      startScore,
      endScore,
      filteredPosts
    );

    if (filteredPosts.length <= count) {
      return filteredPosts;
    }

    filteredPosts.sort((a, b) => a.response.sentiment - b.response.sentiment);
    const step = (filteredPosts.length - 1) / (count - 1);
    const distributedPosts = [];

    for (let i = 0; i < count; i++) {
      const index = Math.round(i * step);
      distributedPosts.push(filteredPosts[index]);
    }
    console.log(
      "distributedPosts for start and end ",
      startScore,
      endScore,
      distributedPosts
    );

    return distributedPosts;
  };

  if (dataLoading) {
    return (
      <MotionVStack
        w="full"
        h="full"
        minH="100vh"
        color="white"
        p={8}
        display="flex"
        position="relative"
        spacing={0}
        zIndex={20}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <LoadingModal isOpen={dataLoading && data.length === 0} />
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
      </MotionVStack>
    );
  }

  return (
    <MotionVStack
      w="full"
      h="full"
      minH="100vh"
      color="white"
      p={8}
      display="flex"
      position="relative"
      spacing={0}
      zIndex={20}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <LoadingModal isOpen={dataLoading && data.length === 0} />
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
      <MotionButton
        onClick={() => router.push("/search")}
        position="absolute"
        top={4}
        left={4}
        size="sm"
        leftIcon={<IoArrowBack />}
        bg="rgba(255,255,255,0.1)"
        _hover={{ bg: "rgba(255,255,255,0.2)" }}
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Back
      </MotionButton>
      <MotionVStack
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <HStack spacing={0.5}>
          <MotionText
            fontSize="3xl"
            fontWeight="bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            e
          </MotionText>
          <MotionImage
            src="/x-icon.png"
            alt="logo"
            w="20px"
            h="20px"
            filter="invert(100%)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          <MotionText
            fontSize="3xl"
            fontWeight="bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            pect
          </MotionText>
        </HStack>

        <QueryPost
          name={name}
          handle={handle}
          content={searchQuery}
          pfp={profilePicture}
        />
      </MotionVStack>
      <MotionBox
        minH="50vh"
        w="full"
        mt={6}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.5 }}
      >
        <Graphs
          posts={posts}
          startScore={startScore}
          endScore={endScore}
          setStartScore={setStartScore}
          setEndScore={setEndScore}
        />
      </MotionBox>
      <MotionVStack
        w="full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Text
          w="full"
          textAlign="center"
          fontSize="2xl"
          fontWeight="bold"
          mt={12}
        >
          {startScore && endScore ? `Sampled Posts` : "Posts"}
        </Text>
        <MotionButton
          onClick={() => setIsAllPostsModalOpen(true)}
          mb={4}
          p={3}
          bg="rgba(255,255,255,0.1)"
          _hover={{ bg: "rgba(255,255,255,0.2)" }}
          mt={2}
          backdropFilter="blur(3px)"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View All
        </MotionButton>
      </MotionVStack>
      <MotionHStack
        w="100%"
        justify="space-between"
        p={4}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Box w="100%">
          <Grid
            templateColumns="repeat(2, 1fr)"
            gap={4}
            w="100%"
            justifyContent="center"
            alignItems="center"
          >
            {getDistributedPosts(posts, 10).map((post, index) => (
              <MotionBox
                key={index}
                display="flex"
                justifyContent="center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <AnimatedUserPost
                  name={post.user.name}
                  handle={post.user.username}
                  reply={post.response.response}
                  sentiment={post.response.sentiment}
                  profilePicture={post.user.image_url}
                  explanation={post.response.explanation}
                />
              </MotionBox>
            ))}
          </Grid>
        </Box>
      </MotionHStack>

      <Modal
        isOpen={isAllPostsModalOpen}
        onClose={() => setIsAllPostsModalOpen(false)}
        size="6xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>All Posts</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="scroll">
            <Grid
              templateColumns="repeat(2, 1fr)"
              gap={4}
              maxH="60vh"
              justifyContent="center"
              alignItems="center"
            >
              {posts.map((post, index) => (
                <Box key={index} display="flex" justifyContent="center">
                  <UserPost
                    name={post.user.name}
                    handle={post.user.username}
                    reply={post.response.response}
                    sentiment={post.response.sentiment}
                    profilePicture={post.user.image_url}
                    explanation={post.response.explanation}
                  />
                </Box>
              ))}
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsAllPostsModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </MotionVStack>
  );
}
