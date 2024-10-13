"use client";

import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  CircularProgressLabel,
  Grid,
  HStack,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import LoadingModal from "./components/loading-modal";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@/app/components/modal";
import { useProfileStore } from "@utils/stores/profile";
import { useSearchQueryStore } from "@utils/stores/search";
import { useRouter } from "next/navigation";
import { IoArrowBack, IoRefresh } from "react-icons/io5";
import DistributionGraph from "./components/distribution-graph";
import SwarmGraph from "./components/swarm-graph";

interface UserPostProps {
  name: string;
  handle: string;
  reply: string;
  sentiment: number;
}

const UserPost = ({ name, handle, reply, sentiment }: UserPostProps) => {
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
        <Avatar name={handle} size="sm" mr={2} />
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
    </HStack>
  );
};

interface QueryPostProps {
  name: string;
  handle: string;
  content: string;
}

const QueryPost = ({ name, handle, content }: QueryPostProps) => {
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
      <Avatar name={handle} size="sm" mr={2} />
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
};

interface GraphsProps {
  posts: any;
  startScore: number | null;
  endScore: number | null;
  setStartScore: (score: number | null) => void;
  setEndScore: (score: number | null) => void;
}

const Graphs = ({
  posts,
  startScore,
  endScore,
  setStartScore,
  setEndScore,
}: GraphsProps) => {
  const [selectedGraph, setSelectedGraph] = useState("distribution");

  const resetScores = () => {
    setStartScore(null);
    setEndScore(null);
  };

  return (
    <VStack w="full" h="50vh">
      <HStack w="full" justify="space-between">
        <HStack px={4} spacing={4}>
          <Button
            size="xs"
            bg="rgba(255,255,255,0.4)"
            onClick={resetScores}
            _hover={{ bg: "rgba(255,255,255,0.6)" }}
            borderRadius="full"
            leftIcon={<IoRefresh fontSize="0.9rem" />}
          >
            Reset
          </Button>
          <Text
            fontSize="xs"
            color="gray.400"
            display={startScore && !endScore ? "block" : "none"}
          >
            Sampling starting {startScore}
          </Text>

          <Text
            fontSize="xs"
            color="gray.400"
            display={startScore && endScore ? "block" : "none"}
          >
            Sampling between {startScore} and {endScore}
          </Text>
        </HStack>

        <ButtonGroup isAttached>
          <Button
            size="xs"
            variant={selectedGraph === "distribution" ? "solid" : "outline"}
            onClick={() => setSelectedGraph("distribution")}
            bg={
              selectedGraph === "distribution"
                ? "rgba(255,255,255,0.2)"
                : "transparent"
            }
          >
            Distribution
          </Button>
          <Button
            size="xs"
            variant={selectedGraph === "swarm" ? "solid" : "outline"}
            onClick={() => setSelectedGraph("swarm")}
            bg={
              selectedGraph === "swarm"
                ? "rgba(255,255,255,0.2)"
                : "transparent"
            }
          >
            Quantity
          </Button>
        </ButtonGroup>
      </HStack>
      <Box w="full" h="full">
        {selectedGraph === "distribution" && (
          <DistributionGraph
            posts={posts}
            startScore={startScore}
            endScore={endScore}
            setStartScore={setStartScore}
            setEndScore={setEndScore}
          />
        )}
        {selectedGraph === "swarm" && (
          <SwarmGraph
            posts={posts}
            startScore={startScore}
            endScore={endScore}
            setStartScore={setStartScore}
            setEndScore={setEndScore}
          />
        )}
      </Box>
    </VStack>
  );
};

const BackgroundImage = () => {
  return (
    <Box
      position="absolute"
      top={0}
      right={0}
      w="100%"
      height="100%"
      // height="300px"
      zIndex={-1}
      backgroundImage="url('/bg-3.png')"
      backgroundSize="cover"
      backgroundPosition="center top"
      _after={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,1))",
      }}
    />
  );
};

export default function DashPage() {
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  const [startScore, setStartScore] = useState<number | null>(null);
  const [endScore, setEndScore] = useState<number | null>(null);
  const [isAllPostsModalOpen, setIsAllPostsModalOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const { handle } = useProfileStore();
  const { searchQuery } = useSearchQueryStore();
  const hasInitialized = useRef(false);

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
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
        if (reader)
          while (true) {
            const { value, done }: ReadableStreamReadResult<Uint8Array> =
              await reader.read();
            if (done) break;
            if (value) {
              buffer += decoder.decode(value, { stream: true });
              let lines = buffer.split("\n");
              buffer = lines.pop() ?? ""; // Save the last incomplete line
              for (const line of lines) {
                if (line.trim()) {
                  try {
                    const parsed = JSON.parse(line);
                    console.log('new line', parsed)
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

    // setTimeout(() => {
    //   setDataLoading(false);
    // }, 3000);
  }, []);

  console.log('now we have all', posts)

  const getDistributedPosts = (posts: any[], count: number) => {
    const filteredPosts = posts.filter((post) => {
      if (startScore === null || endScore === null) return true;
      return (
        post.sentiment >= startScore / 100 && post.sentiment <= endScore / 100
      );
    });

    if (filteredPosts.length <= count) return filteredPosts;

    filteredPosts.sort((a, b) => a.sentiment - b.sentiment);
    const step = (filteredPosts.length - 1) / (count - 1);
    const distributedPosts = [];

    for (let i = 0; i < count; i++) {
      const index = Math.round(i * step);
      distributedPosts.push(filteredPosts[index]);
    }

    return distributedPosts;
  };

  const distributedPosts = getDistributedPosts(posts, 10);

  return (
    <VStack
      w="full"
      h="full"
      color="white"
      p={8}
      display="flex"
      position="relative"
      spacing={0}
      zIndex={20}
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
      <Button
        onClick={() => router.push("/search")}
        position="absolute"
        top={4}
        left={4}
        size="sm"
        leftIcon={<IoArrowBack />}
        bg="rgba(255,255,255,0.1)"
        _hover={{ bg: "rgba(255,255,255,0.2)" }}
      >
        Back
      </Button>
      <QueryPost name="User" handle={handle} content={searchQuery} />
      <Box minH="50vh" w="full" mt={6}>
        <Graphs
          posts={posts}
          startScore={startScore}
          endScore={endScore}
          setStartScore={setStartScore}
          setEndScore={setEndScore}
        />
      </Box>
      <VStack w="full">
        <Text
          w="full"
          textAlign="center"
          fontSize="2xl"
          fontWeight="bold"
          mt={12}
        >
          {startScore && endScore ? `Sampled Posts` : "Posts"}
        </Text>
        <Button
          onClick={() => setIsAllPostsModalOpen(true)}
          mb={4}
          p={3}
          bg="rgba(255,255,255,0.1)"
          _hover={{ bg: "rgba(255,255,255,0.2)" }}
          mt={2}
          backdropFilter="blur(3px)"
        >
          View All
        </Button>
      </VStack>
      <HStack w="100%" justify="space-between" p={4}>
        <Box w="100%">
          <Grid
            templateColumns="repeat(2, 1fr)"
            gap={4}
            w="100%"
            justifyContent="center"
            alignItems="center"
          >
            {distributedPosts.map((post, index) => (
              <Box key={index} display="flex" justifyContent="center">
                <UserPost
                  name={post.user.name}
                  handle={post.user.username}
                  reply={post.response.response}
                  sentiment={post.response.sentiment}
                />
              </Box>
            ))}
          </Grid>
        </Box>
      </HStack>

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
    </VStack>
  );
}
