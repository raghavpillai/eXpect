"use client";

import { Box } from "@chakra-ui/react";
import LoadingModal from "./components/loading-modal";

export default function DashPage() {
  return (
    <Box
      w="100vw"
      h="100vh"
      color="white"
      p={8}
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      <LoadingModal isOpen={true} />
    </Box>
  );
}
