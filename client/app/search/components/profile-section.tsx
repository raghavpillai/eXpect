"use client";

import {
  Avatar,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useProfileStore } from "@utils/stores/profile";
import { useRouter } from "next/navigation";

export default function ProfileSection() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const { handle, setHandle } = useProfileStore();

  const handleLogout = () => {
    setHandle("");
    router.push("/login");
  };

  const goToProfile = () => {
    router.push("/profile");
  };

  return (
    <Menu isOpen={isOpen} onClose={onClose}>
      <MenuButton
        as={HStack}
        spacing={3}
        border="1px"
        borderColor="gray.700"
        p={2}
        borderRadius="lg"
        onClick={onOpen}
        cursor="pointer"
      >
        <HStack spacing={3}>
          <Avatar src="/x-icon.png" size="xs" filter="invert(100%)" />
          <Text fontSize="sm" color="gray.400">
            {handle}
          </Text>
        </HStack>
      </MenuButton>
      <MenuList bg="rgba(255,255,255,0.1)">
        <MenuItem
          bg="rgba(255,255,255,0)"
          _hover={{ bg: "rgba(255,255,255,0.2)" }}
          onClick={goToProfile}
        >
          Profile
        </MenuItem>
        <MenuItem
          bg="rgba(255,255,255,0)"
          _hover={{ bg: "rgba(255,255,255,0.2)" }}
          onClick={handleLogout}
        >
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
