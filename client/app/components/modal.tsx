import {
  Modal as ChakraModal,
  ModalBody as ChakraModalBody,
  ModalCloseButton as ChakraModalCloseButton,
  ModalContent as ChakraModalContent,
  ModalFooter as ChakraModalFooter,
  ModalHeader as ChakraModalHeader,
  ModalOverlay as ChakraModalOverlay,
} from "@chakra-ui/react";

const Modal = (props: React.ComponentProps<typeof ChakraModal>) => (
  <ChakraModal {...props} isCentered motionPreset="slideInBottom" />
);

const ModalOverlay = (
  props: React.ComponentProps<typeof ChakraModalOverlay>
) => (
  <ChakraModalOverlay
    bg="rgba(0,0,0,0)"
    backdropFilter="blur(4px)"
    zIndex={10}
    {...props}
  />
);

const ModalContent = (
  props: React.ComponentProps<typeof ChakraModalContent>
) => (
  <ChakraModalContent
    bg="rgba(150,150,150,0.15)"
    borderWidth={1}
    borderColor="rgba(255,255,255,0.1)"
    backdropFilter="blur(10px)"
    borderRadius="xl"
    mx={{ base: 0, md: 8 }}
    {...props}
  />
);

const ModalHeader = (props: React.ComponentProps<typeof ChakraModalHeader>) => (
  <ChakraModalHeader {...props} />
);

const ModalBody = (props: React.ComponentProps<typeof ChakraModalBody>) => (
  <ChakraModalBody {...props} />
);

const ModalCloseButton = (
  props: React.ComponentProps<typeof ChakraModalCloseButton>
) => <ChakraModalCloseButton {...props} />;

const ModalFooter = (props: React.ComponentProps<typeof ChakraModalFooter>) => (
  <ChakraModalFooter {...props} />
);

export {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
};
