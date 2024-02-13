import { Box, Center, Heading, Text } from "@chakra-ui/react";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error: any = useRouteError();
  console.error(error);

  return (
    <Center id="error-page" mt={'7rem'}>
      <Box textAlign={'center'}>
      <Heading mb={5}>Oops!</Heading>
      <Text>Sorry, an unexpected error has occurred.</Text>
      <Text>
        <i>{error.statusText || error.message}</i>
      </Text>
      </Box>
    </Center>
  );
}