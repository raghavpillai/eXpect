"use client";

import { Box } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfileStore } from "./utils/stores/profile";

export default function Home() {
  const { handle } = useProfileStore();
  const router = useRouter();

  useEffect(() => {
    console.log(handle);
    if (handle === "") {
      router.push("/login");
    } else {
      router.push("/search");
    }
  }, []);

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
    ></Box>
  );
}
