"use client";

import {
  CircularProgress,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

import { HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaChartBar,
  FaClipboardList,
  FaComments,
  FaFileAlt,
  FaSearch,
  FaUserFriends,
} from "react-icons/fa";

interface LoadingModalProps {
  isOpen: boolean;
}

export default function LoadingModal({ isOpen }: LoadingModalProps) {
  const [visibleStages, setVisibleStages] = useState<number[]>([]);
  const stages = [
    {
      description: "Scraping user data",
      icon: FaSearch,
    },
    {
      description: "Identifying followers",
      icon: FaUserFriends,
    },
    {
      description: "Analyzing followers",
      icon: FaChartBar,
    },
    {
      description: "Sampling posts",
      icon: FaClipboardList,
    },
    {
      description: "Analyzing posts",
      icon: FaComments,
    },
    {
      description: "Generating report",
      icon: FaFileAlt,
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setVisibleStages([]);
      let cumulativeDelay = 0;
      stages.forEach((_, index) => {
        const randomDelay =
          Math.floor(Math.random() * (10000 - 6000 + 1)) + 6000; // Random delay between 6000ms and 10000ms
        cumulativeDelay += randomDelay;
        setTimeout(() => {
          setVisibleStages((prev) => [...prev, index]);
        }, cumulativeDelay);
      });
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      isCentered
    >
      <ModalOverlay backdropFilter="blur(3px)" />
      <ModalContent
        bg="rgba(255,255,255,0.1)"
        borderRadius="2xl"
        border="1px solid rgba(255,255,255,0.15)"
        p={2}
      >
        <ModalHeader borderBottom="1px solid rgba(255,255,255,0.1)" pb={3}>
          <HStack spacing={4}>
            <CircularProgress
              isIndeterminate
              size="5"
              color="rgba(0,0,0,0.5)"
            />
            <Text fontSize="md">Generating Analysis...</Text>
          </HStack>
        </ModalHeader>
        <ModalBody mt={2}>
          <VStack spacing={4} align="stretch">
            {stages.map((stage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={
                  visibleStages.includes(index) ? { opacity: 1, y: 0 } : {}
                }
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <HStack spacing={4}>
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={
                      visibleStages.includes(index)
                        ? { rotate: [0, 20, 0] }
                        : {}
                    }
                    transition={{ duration: 0.25, delay: 0.5 }}
                  >
                    <Icon as={stage.icon} boxSize={4} />
                  </motion.div>
                  <Text fontSize="sm">{stage.description}</Text>
                </HStack>
              </motion.div>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
