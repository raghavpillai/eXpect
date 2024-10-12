import { HStack, Image, Text, VStack } from "@chakra-ui/react";

export default function TitleSection() {
  const words = ["Seek", "Ground", "Truth"];

  return (
    <VStack spacing={0}>
      <HStack>
        <Image src="x-icon.png" w="60px" h="60px" filter="invert(100%)" />
        <Text fontSize="7xl">PECT</Text>
      </HStack>

      <HStack spacing={1}>
        {words.map((word, index) => (
          <Text key={index} fontSize="xl" fontWeight="bold">
            {word}
          </Text>
        ))}
      </HStack>
    </VStack>
  );
}
