"use client";

import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { IoRefresh } from "react-icons/io5";
import DistributionGraph from "./distribution-graph";
import SwarmGraph from "./swarm-graph";

interface GraphsProps {
  posts: any;
  startScore: number | null;
  endScore: number | null;
  setStartScore: (score: number | null) => void;
  setEndScore: (score: number | null) => void;
}

export default function Graphs({
  posts,
  startScore,
  endScore,
  setStartScore,
  setEndScore,
}: GraphsProps) {
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
}
