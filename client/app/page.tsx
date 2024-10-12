import {
  Box,
  Button,
  Image as ChakraImage,
  Container,
  Flex,
  HStack,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";

export default function Home() {
  return (
    <Box>
      <Container maxW="container.xl" py={10}>
        <VStack spacing={10} align="stretch">
          <Flex justifyContent="center">
            <Image
              src="https://nextjs.org/icons/next.svg"
              alt="Next.js logo"
              width={180}
              height={38}
              priority
            />
          </Flex>

          <VStack as="ol" spacing={4} align="stretch">
            <Text as="li">
              Get started by editing <Text as="code">app/page.tsx</Text>.
            </Text>
            <Text as="li">Save and see your changes instantly.</Text>
          </VStack>

          <HStack spacing={4} justifyContent="center">
            <Button
              as={Link}
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
              isExternal
              leftIcon={
                <ChakraImage
                  src="https://nextjs.org/icons/vercel.svg"
                  alt="Vercel logomark"
                  boxSize="20px"
                />
              }
              colorScheme="blue"
            >
              Deploy now
            </Button>
            <Button
              as={Link}
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
              isExternal
              variant="outline"
            >
              Read our docs
            </Button>
          </HStack>
        </VStack>
      </Container>

      <Box as="footer" borderTop="1px" borderColor="gray.700" mt={10} py={6}>
        <Container maxW="container.xl">
          <HStack justifyContent="space-around" flexWrap="wrap">
            <Link
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
              isExternal
            >
              <HStack>
                <ChakraImage
                  src="https://nextjs.org/icons/file.svg"
                  alt="File icon"
                  boxSize="16px"
                />
                <Text>Learn</Text>
              </HStack>
            </Link>
            <Link
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
              isExternal
            >
              <HStack>
                <ChakraImage
                  src="https://nextjs.org/icons/window.svg"
                  alt="Window icon"
                  boxSize="16px"
                />
                <Text>Examples</Text>
              </HStack>
            </Link>
            <Link
              href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
              isExternal
            >
              <HStack>
                <ChakraImage
                  src="https://nextjs.org/icons/globe.svg"
                  alt="Globe icon"
                  boxSize="16px"
                />
                <Text>Go to nextjs.org →</Text>
              </HStack>
            </Link>
          </HStack>
        </Container>
      </Box>
    </Box>
  );
}
