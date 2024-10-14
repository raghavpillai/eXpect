"use client";

import { Box } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProfileStore } from "./utils/stores/profile";

export default function Home() {
  const { handle, loadHandle, loadProfilePicture, loadName } =
    useProfileStore();
  const router = useRouter();

  useEffect(() => {
    const foundHandle = loadHandle();
    const foundProfilePicture = loadProfilePicture();
    const foundName = loadName();

    if (foundHandle === "") {
      router.push("/login");
    } else {
      router.push("/search");
    }
  }, [handle, router]);

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
