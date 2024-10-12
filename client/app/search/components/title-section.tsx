import { HStack, Image, Text, VStack } from "@chakra-ui/react";

export default function TitleSection() {
  const words = ["Seek", "Ground", "Truth"];

  return (
    <VStack spacing={0}>
      <HStack spacing={1} alignItems="center" justifyContent="center">
        <Text fontSize="8xl">e</Text>
        <Image
          src="x-icon.png"
          w="58px"
          h="58px"
          filter="invert(100%)"
          mt={5}
        />
        <Text fontSize="8xl">pect</Text>
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
