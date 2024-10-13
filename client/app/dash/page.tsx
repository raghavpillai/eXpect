"use client";

import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
// import LoadingModal from "./components/loading-modal";
import { IoRefresh } from "react-icons/io5";

import DistributionGraph from "./components/distribution-graph";
import SwarmGraph from "./components/swarm-graph";

const TemperatureBar = () => {
  return (
    <VStack w="100%">
      <HStack w="100%" justify="space-between" px={1}>
        <Text fontSize="xs" color="gray.400">
          Disagree
        </Text>
        <Text fontSize="xs" color="gray.400">
          Agree
        </Text>
      </HStack>
      <Box
        w="100%"
        h="5px"
        bg="linear-gradient(to right, rgba(255,0,0,0.7), rgba(7,255,0,0.6))"
        borderRadius="full"
      />
    </VStack>
  );
};

interface UserPostProps {
  handle: string;
  post: string;
}

const UserPost = ({ handle, post }: UserPostProps) => {
  return (
    <VStack
      w="100%"
      align="flex-start"
      p={2}
      bg="rgba(255,255,255,0.1)"
      borderRadius="xl"
      border="1px solid rgba(255,255,255,0.2)"
    >
      <HStack>
        <Avatar name={handle} size="xs" />
        <Text fontSize="sm" color="rgba(255,255,255,0.8)">
          {handle}
        </Text>
      </HStack>
      <Text fontSize="sm">{post}</Text>
    </VStack>
  );
};

const Graphs = ({ posts }: { posts: any }) => {
  const [selectedGraph, setSelectedGraph] = useState("distribution");
  const [startScore, setStartScore] = useState<number | null>(null);
  const [endScore, setEndScore] = useState<number | null>(null);

  const resetScores = () => {
    setStartScore(null);
    setEndScore(null);
  };

  return (
    <VStack w="full" h="full">
      <HStack w="full" justify="space-between">
        <HStack px={4}>
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
            fontSize="sm"
            color="gray.400"
            display={startScore && !endScore ? "block" : "none"}
          >
            Sampling starting {startScore}
          </Text>

          <Text
            fontSize="sm"
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
    </VStack>
  );
};

export default function DashPage() {
  const [dataLoading, setDataLoading] = useState(true);
  const [agrees, setAgrees] = useState(0);
  const [disagrees, setDisagrees] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setDataLoading(false);
    }, 3000); // Dummy loading time
  }, []);

  const posts = [
    {
      handle: "@rag_pil",
      reply: "This is amazing! I love this!",
      sentiment: 1.0,
    },
    {
      handle: "@tech_enthusiast",
      reply: "Incredible innovation! Can't wait to see more.",
      sentiment: 0.9,
    },
    {
      handle: "@skeptic123",
      reply: "I'm not convinced. Needs more evidence.",
      sentiment: 0.2,
    },
    {
      handle: "@future_thinker",
      reply: "This could revolutionize the industry!",
      sentiment: 0.8,
    },
    {
      handle: "@pragmatic_user",
      reply: "Interesting concept, but how practical is it?",
      sentiment: 0.5,
    },
    {
      handle: "@innovator_x",
      reply: "Brilliant execution of a complex idea.",
      sentiment: 0.9,
    },
    {
      handle: "@cautious_observer",
      reply: "Let's not get ahead of ourselves. Still many questions.",
      sentiment: 0.3,
    },
    {
      handle: "@excited_newbie",
      reply: "Mind-blowing! This is why I love technology!",
      sentiment: 1.0,
    },
    {
      handle: "@industry_veteran",
      reply: "Seen similar ideas fail. Not optimistic.",
      sentiment: 0.1,
    },
    {
      handle: "@curious_mind",
      reply: "Fascinating approach! How does it handle [specific scenario]?",
      sentiment: 0.7,
    },
    {
      handle: "@tech_critic",
      reply: "Overhyped. Doesn't solve the real problem.",
      sentiment: 0.0,
    },
    {
      handle: "@forward_thinker",
      reply: "This could be a game-changer for our field!",
      sentiment: 0.9,
    },
    {
      handle: "@practical_dev",
      reply: "Solid implementation. Looking forward to testing it.",
      sentiment: 0.8,
    },
    {
      handle: "@ui_lover",
      reply: "The interface is so intuitive! Great user experience.",
      sentiment: 1.0,
    },
    {
      handle: "@security_expert",
      reply: "Promising, but what about the security implications?",
      sentiment: 0.6,
    },
    {
      handle: "@optimistic_coder",
      reply: "This opens up so many possibilities! Excited to explore.",
      sentiment: 0.95,
    },
    {
      handle: "@data_scientist",
      reply: "Impressive results. Would love to see the methodology.",
      sentiment: 0.85,
    },
    {
      handle: "@ux_designer",
      reply: "Clean design, but accessibility could be improved.",
      sentiment: 0.65,
    },
    {
      handle: "@startup_founder",
      reply: "Game-changing potential. How soon can we implement?",
      sentiment: 0.9,
    },
    {
      handle: "@ethical_tech",
      reply: "Innovative, but we need to consider the ethical implications.",
      sentiment: 0.55,
    },
    {
      handle: "@ai_researcher",
      reply: "Fascinating approach. Curious about the training data.",
      sentiment: 0.75,
    },
    {
      handle: "@skeptical_user",
      reply: "Sounds too good to be true. What's the catch?",
      sentiment: 0.25,
    },
    {
      handle: "@tech_journalist",
      reply: "Groundbreaking if it delivers. Looking forward to testing.",
      sentiment: 0.7,
    },
    {
      handle: "@product_manager",
      reply: "Great concept. How does it fit into existing workflows?",
      sentiment: 0.8,
    },
    {
      handle: "@privacy_advocate",
      reply: "Innovative, but raises serious privacy concerns.",
      sentiment: 0.4,
    },
    {
      handle: "@tech_optimist",
      reply: "This is the future! Can't wait to see it in action.",
      sentiment: 0.95,
    },
    {
      handle: "@cautious_adopter",
      reply: "Interesting, but I'll wait for more real-world testing.",
      sentiment: 0.5,
    },
    {
      handle: "@industry_analyst",
      reply: "Potential disruptor. Keeping a close eye on developments.",
      sentiment: 0.75,
    },
    {
      handle: "@tech_skeptic",
      reply: "Seen similar promises before. Doubtful it'll deliver.",
      sentiment: 0.15,
    },
    {
      handle: "@enthusiastic_dev",
      reply: "Can't wait to get my hands on this! So many possibilities!",
      sentiment: 0.95,
    },
  ];

  // useEffect(() => {
  //   const agreeCount = posts.filter((post) => post.positive).length;
  //   const disagreeCount = posts.filter((post) => !post.positive).length;
  //   setAgrees(agreeCount);
  //   setDisagrees(disagreeCount);
  // }, [posts]);

  return (
    <VStack
      w="100vw"
      h="100vh"
      color="white"
      p={8}
      display="flex"
      position="relative"
      spacing={0}
    >
      <Graphs posts={posts} />
      <HStack
        spacing={0}
        bg="rgba(255,255,255,0.1)"
        border="1px solid rgba(255,255,255,0.2)"
        borderRadius="xl"
        p={2}
        justify="space-between"
        w="200px"
        mb={12}
      >
        <VStack w="50%">
          <Text fontSize="sm" fontWeight="bold">
            Agree
          </Text>
          <Text>{agrees}</Text>
        </VStack>
        <Box w="1px" h="100%" bg="rgba(255,255,255,0.1)" />
        <VStack w="50%">
          <Text fontSize="sm" fontWeight="bold">
            Disagree
          </Text>
          <Text>{disagrees}</Text>
        </VStack>
      </HStack>
      <TemperatureBar />
      <HStack w="100%" justify="space-between" p={4}>
        {/* <Grid templateColumns="repeat(3, 1fr)" gap={4} w="50%">
          {posts
            .filter((post) => post.positive)
            .map((post, index) => (
              <UserPost key={index} handle={post.handle} post={post.reply} />
            ))}
        </Grid>
        <Box w="1px" h="100%" bg="rgba(255,255,255,0.4)" mx={6} />
        <Grid templateColumns="repeat(3, 1fr)" gap={4} w="50%">
          {posts
            .filter((post) => !post.positive)
            .map((post, index) => (
              <UserPost key={index} handle={post.handle} post={post.reply} />
            ))}
        </Grid> */}
      </HStack>
    </VStack>
  );
}
