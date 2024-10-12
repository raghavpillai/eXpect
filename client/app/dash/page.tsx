"use client";

import { Avatar, Box, Grid, HStack, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
// import LoadingModal from "./components/loading-modal";
import PieChart from "./components/pie-chart";

const TemperatureBar = () => {
  return (
    <VStack w="100%">
      <HStack w="100%" justify="space-between" px={1}>
        <Text fontSize="xs" color="gray.400">
          Agree
        </Text>
        <Text fontSize="xs" color="gray.400">
          Disagree
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
      positive: true,
    },
    {
      handle: "@tech_enthusiast",
      reply: "Incredible innovation! Can't wait to see more.",
      positive: true,
    },
    {
      handle: "@skeptic123",
      reply: "I'm not convinced. Needs more evidence.",
      positive: false,
    },
    {
      handle: "@future_thinker",
      reply: "This could revolutionize the industry!",
      positive: true,
    },
    {
      handle: "@pragmatic_user",
      reply: "Interesting concept, but how practical is it?",
      positive: false,
    },
    {
      handle: "@innovator_x",
      reply: "Brilliant execution of a complex idea.",
      positive: true,
    },
    {
      handle: "@cautious_observer",
      reply: "Let's not get ahead of ourselves. Still many questions.",
      positive: false,
    },
    {
      handle: "@excited_newbie",
      reply: "Mind-blowing! This is why I love technology!",
      positive: true,
    },
    {
      handle: "@industry_veteran",
      reply: "Seen similar ideas fail. Not optimistic.",
      positive: false,
    },
    {
      handle: "@curious_mind",
      reply: "Fascinating approach! How does it handle [specific scenario]?",
      positive: true,
    },
    {
      handle: "@tech_critic",
      reply: "Overhyped. Doesn't solve the real problem.",
      positive: false,
    },
    {
      handle: "@forward_thinker",
      reply: "This could be a game-changer for our field!",
      positive: true,
    },
    {
      handle: "@practical_dev",
      reply: "Solid implementation. Looking forward to testing it.",
      positive: true,
    },
    {
      handle: "@ui_lover",
      reply: "The interface is so intuitive! Great user experience.",
      positive: true,
    },
    {
      handle: "@security_expert",
      reply: "Promising, but what about the security implications?",
      positive: true,
    },
  ];

  useEffect(() => {
    const agreeCount = posts.filter((post) => post.positive).length;
    const disagreeCount = posts.filter((post) => !post.positive).length;
    setAgrees(agreeCount);
    setDisagrees(disagreeCount);
  }, [posts]);

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
      {/* <LoadingModal isOpen={dataLoading} /> */}
      <PieChart agrees={agrees} disagrees={disagrees} />
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
        <Grid templateColumns="repeat(3, 1fr)" gap={4} w="50%">
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
        </Grid>
      </HStack>
    </VStack>
  );
}
